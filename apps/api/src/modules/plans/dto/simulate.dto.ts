import type { PayoffStrategy } from "@meudim/shared";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsPositive,
  ValidateNested
} from "class-validator";

import { CreateDebtDto } from "../../debts/dto/create-debt.dto";

const PUBLIC_STRATEGIES = ["SNOWBALL", "AVALANCHE"] as const;

export class SimulateDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDebtDto)
  debts!: CreateDebtDto[];

  @IsNumber()
  @IsPositive()
  monthlyBudget!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PUBLIC_STRATEGIES, { each: true })
  strategies: PayoffStrategy[] = ["SNOWBALL", "AVALANCHE"];
}
