import {
  DebtTypeSchema,
  type DebtType
} from "@meudim/shared";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class UpdateDebtDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(DebtTypeSchema.options)
  type?: DebtType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  balance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.3)
  monthlyRate?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minimumPayment?: number;
}
