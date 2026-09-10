import { Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";

export interface PdfJobData {
  planId: string;
}

@Processor("pdf")
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  async process(job: Job<PdfJobData>): Promise<void> {
    this.logger.log(
      `[PDF Job] Plano ${job.data.planId} na fila — implementar na Etapa 09`
    );
  }
}
