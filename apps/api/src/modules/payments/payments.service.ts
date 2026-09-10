import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { MailService } from "../../mail/mail.service";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaymentProduct,
  PaymentProvider
} from "./dto/checkout.dto";
import { MockPaymentProvider } from "./mock-payment.provider";

export interface MercadoPagoWebhook {
  type?: string;
  data?: {
    id?: string;
    external_reference?: string;
    status?: string;
  };
}

interface StripeWebhook {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      amount_paid?: number;
      metadata?: Record<string, string | undefined>;
    };
  };
}

export interface PixCheckoutResponse {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  expiresAt: string;
}

export interface StripeCheckoutResponse {
  paymentId: string;
  url: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly provider: MockPaymentProvider
  ) {}

  async createPixCheckout(
    userId: string,
    product: PaymentProduct
  ): Promise<PixCheckoutResponse> {
    await this.findUser(userId);
    const payment = await this.createPendingPayment(
      userId,
      PaymentProvider.MERCADOPAGO,
      product
    );
    const checkout = this.provider.createPix(payment.id);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkout.externalId }
    });

    return {
      paymentId: payment.id,
      qrCode: checkout.qrCode,
      qrCodeBase64: checkout.qrCodeBase64,
      ticketUrl: checkout.ticketUrl,
      expiresAt: checkout.expiresAt
    };
  }

  async createStripeCheckout(
    userId: string,
    product: PaymentProduct
  ): Promise<StripeCheckoutResponse> {
    await this.findUser(userId);
    const payment = await this.createPendingPayment(
      userId,
      PaymentProvider.STRIPE,
      product
    );
    const checkout = this.provider.createStripe(payment.id, product);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkout.externalId }
    });

    return {
      paymentId: payment.id,
      url: checkout.url
    };
  }

  async getPaymentStatus(
    userId: string,
    paymentId: string
  ): Promise<{ status: string }> {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
      select: { status: true }
    });

    if (!payment) {
      throw new NotFoundException("Pagamento não encontrado");
    }

    return payment;
  }

  async handleMercadoPagoWebhook(
    rawBody: Buffer,
    body: MercadoPagoWebhook,
    signature?: string
  ): Promise<void> {
    this.verifySignature(rawBody, signature, "MP_WEBHOOK_SECRET");

    if (body.type !== "payment") {
      return;
    }

    const reference = body.data?.external_reference;

    if (!reference || body.data?.status !== "approved") {
      return;
    }

    await this.confirmPayment(reference, PaymentProvider.MERCADOPAGO);
  }

  async handleStripeWebhook(
    rawBody: Buffer,
    signature?: string
  ): Promise<void> {
    this.verifySignature(rawBody, signature, "STRIPE_WEBHOOK_SECRET");

    let event: StripeWebhook;

    try {
      event = JSON.parse(rawBody.toString("utf8")) as StripeWebhook;
    } catch {
      throw new BadRequestException("Webhook Stripe inválido");
    }

    const object = event.data?.object;
    const metadata = object?.metadata ?? {};

    if (event.type === "checkout.session.completed") {
      const paymentId = metadata.internalPaymentId;

      if (paymentId) {
        await this.confirmPayment(paymentId, PaymentProvider.STRIPE);
      }
      return;
    }

    if (event.type === "invoice.paid") {
      const userId = metadata.userId;

      if (userId && event.id) {
        await this.renewSubscription(
          userId,
          event.id,
          object?.amount_paid ?? 0
        );
      }
      return;
    }

    if (event.type === "customer.subscription.deleted") {
      const userId = metadata.userId;

      if (userId) {
        await this.prisma.user.updateMany({
          where: { id: userId },
          data: { plan: "FREE", planExpiresAt: null }
        });
      }
    }
  }

  private async createPendingPayment(
    userId: string,
    provider: PaymentProvider,
    product: PaymentProduct
  ) {
    return this.prisma.payment.create({
      data: {
        userId,
        provider,
        externalId: randomUUID(),
        amount: this.priceCents(product) / 100,
        status: "PENDING",
        product
      }
    });
  }

  private async confirmPayment(
    paymentId: string,
    provider: PaymentProvider
  ): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, provider },
      include: { user: true }
    });

    if (!payment) {
      this.logger.warn(`Pagamento de webhook não encontrado: ${paymentId}`);
      return;
    }

    const product = payment.product as PaymentProduct;
    const changed = await this.prisma.$transaction(async (transaction) => {
      const update = await transaction.payment.updateMany({
        where: { id: payment.id, status: { not: "PAID" } },
        data: { status: "PAID", paidAt: new Date() }
      });

      if (update.count === 0) {
        return false;
      }

      await transaction.user.update({
        where: { id: payment.userId },
        data: this.planUpdate(product)
      });

      return true;
    });

    if (changed) {
      await this.sendConfirmationSafely(
        payment.user.email,
        this.productName(product)
      );
    }
  }

  private async renewSubscription(
    userId: string,
    eventId: string,
    amountPaid: number
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return;
    }

    const renewed = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.payment.findUnique({
        where: { externalId: eventId }
      });

      if (existing) {
        return false;
      }

      const base =
        user.planExpiresAt && user.planExpiresAt > new Date()
          ? user.planExpiresAt
          : new Date();
      const planExpiresAt = new Date(base);

      planExpiresAt.setUTCMonth(planExpiresAt.getUTCMonth() + 1);
      await transaction.payment.create({
        data: {
          userId,
          provider: PaymentProvider.STRIPE,
          externalId: eventId,
          amount: amountPaid / 100,
          status: "PAID",
          product: PaymentProduct.SUBSCRIPTION,
          paidAt: new Date()
        }
      });
      await transaction.user.update({
        where: { id: userId },
        data: { plan: "SUBSCRIBER", planExpiresAt }
      });

      return true;
    });

    if (renewed) {
      await this.sendConfirmationSafely(user.email, "Assinatura Meu Dim");
    }
  }

  private verifySignature(
    rawBody: Buffer,
    signature: string | undefined,
    providerSecretKey: "MP_WEBHOOK_SECRET" | "STRIPE_WEBHOOK_SECRET"
  ): void {
    const secret =
      this.config.get<string>(providerSecretKey) ??
      this.config.getOrThrow<string>("PAYMENTS_MOCK_WEBHOOK_SECRET");

    if (!signature) {
      throw new UnauthorizedException("Assinatura do webhook ausente");
    }

    const supplied = signature.replace(/^sha256=/, "");
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const suppliedBuffer = Buffer.from(supplied, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException("Assinatura do webhook inválida");
    }
  }

  private async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  private priceCents(product: PaymentProduct): number {
    const key =
      product === PaymentProduct.SUBSCRIPTION
        ? "SUBSCRIPTION_PRICE_BRL_CENTS"
        : "ONE_TIME_PRICE_BRL_CENTS";

    return this.config.getOrThrow<number>(key);
  }

  private planUpdate(product: PaymentProduct): {
    plan: "ONE_TIME" | "SUBSCRIBER";
    planExpiresAt: Date | null;
  } {
    if (product === PaymentProduct.ONE_TIME_PLAN) {
      return { plan: "ONE_TIME", planExpiresAt: null };
    }

    const expiresAt = new Date();

    expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 1);
    return { plan: "SUBSCRIBER", planExpiresAt: expiresAt };
  }

  private productName(product: PaymentProduct): string {
    return product === PaymentProduct.SUBSCRIPTION
      ? "Assinatura Meu Dim"
      : "Plano de Quitação";
  }

  private async sendConfirmationSafely(
    email: string,
    productName: string
  ): Promise<void> {
    try {
      await this.mail.sendPaymentConfirmed(email, productName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Falha no e-mail de pagamento: ${message}`);
    }
  }
}
