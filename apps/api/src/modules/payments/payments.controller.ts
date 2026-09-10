import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { SafeUser } from "../users/safe-user";
import {
  CheckoutDto,
  PaymentProvider
} from "./dto/checkout.dto";
import {
  type MercadoPagoWebhook,
  PaymentsService
} from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("checkout")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  checkout(
    @CurrentUser() user: SafeUser,
    @Body() dto: CheckoutDto
  ) {
    if (dto.provider === PaymentProvider.MERCADOPAGO) {
      return this.payments.createPixCheckout(user.id, dto.product);
    }

    return this.payments.createStripeCheckout(user.id, dto.product);
  }

  @Get(":id/status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getStatus(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ) {
    return this.payments.getPaymentStatus(user.id, id);
  }

  @Post("webhooks/mercadopago")
  async mercadoPagoWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Body() body: unknown,
    @Headers("x-signature") signature?: string
  ): Promise<{ status: "ok" }> {
    const rawBody = this.requireRawBody(request);

    await this.payments.handleMercadoPagoWebhook(
      rawBody,
      body as MercadoPagoWebhook,
      signature
    );
    return { status: "ok" };
  }

  @Post("webhooks/stripe")
  async stripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string
  ): Promise<{ status: "ok" }> {
    await this.payments.handleStripeWebhook(
      this.requireRawBody(request),
      signature
    );
    return { status: "ok" };
  }

  private requireRawBody(request: RawBodyRequest<Request>): Buffer {
    if (!request.rawBody) {
      throw new BadRequestException(
        "Corpo bruto do webhook não está disponível"
      );
    }

    return request.rawBody;
  }
}
