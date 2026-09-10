import {
  PayoffStrategySchema,
  type PayoffStrategy
} from "@meudim/shared";
import { IsIn } from "class-validator";

import { SimulateDto } from "./simulate.dto";

export class CreatePlanDto extends SimulateDto {
  @IsIn(PayoffStrategySchema.options)
  chosenStrategy!: PayoffStrategy;
}
