import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { PdfProcessor } from "./pdf.processor";

@Module({
  imports: [BullModule.registerQueue({ name: "pdf" })],
  providers: [PdfProcessor],
  exports: [BullModule]
})
export class ReportsModule {}
