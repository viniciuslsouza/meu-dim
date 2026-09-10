import {
  DebtTypeSchema,
  type DebtType
} from "@meudim/shared";
import {
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions
} from "class-validator";

export function IsAtMostBalance(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: "isAtMostBalance",
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown, arguments_: ValidationArguments) {
          const { balance } = arguments_.object as { balance?: unknown };

          return (
            typeof value === "number" &&
            typeof balance === "number" &&
            value <= balance
          );
        }
      }
    });
  };
}

export class CreateDebtDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsIn(DebtTypeSchema.options)
  type!: DebtType;

  @IsNumber()
  @IsPositive()
  balance!: number;

  @IsNumber()
  @Min(0)
  @Max(0.3)
  monthlyRate!: number;

  @IsNumber()
  @IsPositive()
  @IsAtMostBalance({
    message: "minimumPayment não pode ser maior que balance"
  })
  minimumPayment!: number;
}
