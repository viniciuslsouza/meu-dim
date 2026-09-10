import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PaymentProduct } from "./dto/checkout.dto";

export interface PixCheckoutResult {
  externalId: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  expiresAt: string;
}

export interface StripeCheckoutResult {
  externalId: string;
  url: string;
}

@Injectable()
export class MockPaymentProvider {
  constructor(private readonly config: ConfigService) {}

  createPix(internalPaymentId: string): PixCheckoutResult {
    const externalId = `mp_mock_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
    const payload = [
      "000201",
      "MEUDIM-MOCK",
      internalPaymentId,
      externalId
    ].join("|");

    return {
      externalId,
      qrCode: payload,
      qrCodeBase64: Buffer.from(payload).toString("base64"),
      ticketUrl: `${this.config.getOrThrow<string>("APP_URL")}/checkout/mock-pix/${externalId}`,
      expiresAt
    };
  }

  createStripe(
    internalPaymentId: string,
    product: PaymentProduct
  ): StripeCheckoutResult {
    const externalId = `cs_mock_${randomUUID()}`;
    const params = new URLSearchParams({
      session_id: externalId,
      payment_id: internalPaymentId,
      product
    });

    return {
      externalId,
      url: `${this.config.getOrThrow<string>("APP_URL")}/checkout/mock-stripe?${params.toString()}`
    };
  }
}
