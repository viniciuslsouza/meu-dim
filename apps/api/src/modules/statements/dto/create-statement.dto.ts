import {
  BankIdSchema,
  CategorySchema,
  type BankId,
  type Category
} from "@meudim/shared";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
  ValidateNested
} from "class-validator";

export class StatementTransactionDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  merchantKey!: string;

  @IsNumber()
  amount!: number;

  @IsIn(CategorySchema.options)
  category!: Category;

  @IsOptional()
  @IsInt()
  @IsPositive()
  installment?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  installments?: number;

  @IsBoolean()
  isRecurring!: boolean;
}

export class CreateStatementDto {
  @IsIn(BankIdSchema.options)
  bank!: BankId;

  @Matches(/^\d{4}-\d{2}$/)
  referenceMonth!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  total?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minimumPayment?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementTransactionDto)
  transactions!: StatementTransactionDto[];

  @IsArray()
  @IsString({ each: true })
  warnings!: string[];
}
