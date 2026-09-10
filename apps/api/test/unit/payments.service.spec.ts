import type { ConfigService } from "@nestjs/config";
import { createHmac } from "node:crypto";

import type { MailService } from "../../src/mail/mail.service";
import {
  PaymentProduct,
  PaymentProvider
} from "../../src/modules/payments/dto/checkout.dto";
import { MockPaymentProvider } from "../../src/modules/payments/mock-payment.provider";
import { PaymentsService } from "../../src/modules/payments/payments.service";
import type { PrismaService } from "../../src/prisma/prisma.service";

const configValues: Record<string, string | number> = {
  APP_URL: "http://localhost:3000",
  PAYMENTS_MOCK_WEBHOOK_SECRET: "test-mock-webhook-secret",
  ONE_TIME_PRICE_BRL_CENTS: 3900,
  SUBSCRIPTION_PRICE_BRL_CENTS: 990
};

function createConfig(): ConfigService {
  return {
    get: jest.fn((key: string) => configValues[key]),
    getOrThrow: jest.fn((key: string) => {
      const value = configValues[key];

      if (value === undefined) {
        throw new Error(`Config ausente: ${key}`);
      }
      return value;
    })
  } as unknown as ConfigService;
}

describe("PaymentsService", () => {
  it("creates a mocked Pix checkout and persists its external id", async () => {
    const config = createConfig();
    const update = jest.fn().mockResolvedValue({});
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: "user-1",
          email: "user@example.com"
        })
      },
      payment: {
        create: jest.fn().mockResolvedValue({ id: "payment-1" }),
        update
      }
    } as unknown as PrismaService;
    const service = new PaymentsService(
      prisma,
      config,
      { sendPaymentConfirmed: jest.fn() } as unknown as MailService,
      new MockPaymentProvider(config)
    );

    const checkout = await service.createPixCheckout(
      "user-1",
      PaymentProduct.ONE_TIME_PLAN
    );

    expect(checkout.paymentId).toBe("payment-1");
    expect(checkout.qrCode).toContain("MEUDIM-MOCK");
    expect(checkout.ticketUrl).toContain("/checkout/mock-pix/");
    expect(update).toHaveBeenCalledWith({
      where: { id: "payment-1" },
      data: { externalId: expect.stringMatching(/^mp_mock_/) }
    });
  });

  it("rejects an invalid Mercado Pago webhook signature", async () => {
    const config = createConfig();
    const service = new PaymentsService(
      {} as PrismaService,
      config,
      { sendPaymentConfirmed: jest.fn() } as unknown as MailService,
      new MockPaymentProvider(config)
    );

    await expect(
      service.handleMercadoPagoWebhook(
        Buffer.from("{}"),
        {},
        "invalid"
      )
    ).rejects.toMatchObject({ status: 401 });
  });

  it("activates a one-time plan only once for repeated webhooks", async () => {
    const config = createConfig();
    const updateMany = jest
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const userUpdate = jest.fn().mockResolvedValue({});
    const payment = {
      id: "payment-1",
      userId: "user-1",
      provider: PaymentProvider.MERCADOPAGO,
      product: PaymentProduct.ONE_TIME_PLAN,
      status: "PENDING",
      user: { email: "user@example.com" }
    };
    const transactionClient = {
      payment: { updateMany },
      user: { update: userUpdate }
    };
    const prisma = {
      payment: {
        findFirst: jest.fn().mockResolvedValue(payment)
      },
      $transaction: jest.fn(
        async (
          operation: (client: typeof transactionClient) => Promise<boolean>
        ) => operation(transactionClient)
      )
    } as unknown as PrismaService;
    const sendPaymentConfirmed = jest.fn().mockResolvedValue(undefined);
    const service = new PaymentsService(
      prisma,
      config,
      { sendPaymentConfirmed } as unknown as MailService,
      new MockPaymentProvider(config)
    );
    const rawBody = Buffer.from(
      JSON.stringify({
        type: "payment",
        data: {
          id: "mp-1",
          external_reference: "payment-1",
          status: "approved"
        }
      })
    );
    const signature = createHmac(
      "sha256",
      String(configValues.PAYMENTS_MOCK_WEBHOOK_SECRET)
    )
      .update(rawBody)
      .digest("hex");

    await service.handleMercadoPagoWebhook(
      rawBody,
      JSON.parse(rawBody.toString("utf8")),
      signature
    );
    await service.handleMercadoPagoWebhook(
      rawBody,
      JSON.parse(rawBody.toString("utf8")),
      signature
    );

    expect(userUpdate).toHaveBeenCalledTimes(1);
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { plan: "ONE_TIME", planExpiresAt: null }
    });
    expect(sendPaymentConfirmed).toHaveBeenCalledTimes(1);
  });
});
