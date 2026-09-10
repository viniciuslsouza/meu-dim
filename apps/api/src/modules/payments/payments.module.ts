import { Module } from "@nestjs/common";

import { MailModule } from "../../mail/mail.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { MockPaymentProvider } from "./mock-payment.provider";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentProvider],
  exports: [PaymentsService]
})
export class PaymentsModule {}
