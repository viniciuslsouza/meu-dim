import { IsString, MinLength } from "class-validator";

export class VerifyTokenDto {
  @IsString()
  @MinLength(32)
  token!: string;
}
