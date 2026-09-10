import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { ReportsModule } from "../reports/reports.module";
import { PlansController } from "./plans.controller";
import { PlansService } from "./plans.service";

@Module({
  imports: [PrismaModule, ReportsModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService]
})
export class PlansModule {}
