import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsPositive,
  IsString
} from "class-validator";

export class CutSimulationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  debtIds!: string[];

  @IsNumber()
  @IsPositive()
  currentBudget!: number;

  @IsNumber()
  @IsPositive()
  cutAmount!: number;
}
