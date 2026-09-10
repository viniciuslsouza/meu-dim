import {
  IsInt,
  IsNumber,
  IsPositive,
  Max,
  Min
} from "class-validator";

export class RefinanceDto {
  @IsNumber()
  @Min(0)
  @Max(0.3)
  loanRate!: number;

  @IsInt()
  @IsPositive()
  loanMonths!: number;
}
