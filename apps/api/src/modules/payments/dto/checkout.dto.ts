import { IsEnum } from "class-validator";

export enum PaymentProduct {
  ONE_TIME_PLAN = "ONE_TIME_PLAN",
  SUBSCRIPTION = "SUBSCRIPTION"
}

export enum PaymentProvider {
  MERCADOPAGO = "MERCADOPAGO",
  STRIPE = "STRIPE"
}

export class CheckoutDto {
  @IsEnum(PaymentProduct)
  product!: PaymentProduct;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;
}
