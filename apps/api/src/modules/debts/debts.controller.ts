import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { SafeUser } from "../users/safe-user";
import { DebtsService } from "./debts.service";
import { CreateDebtDto } from "./dto/create-debt.dto";
import { UpdateDebtDto } from "./dto/update-debt.dto";

@ApiTags("debts")
@Controller("debts")
export class DebtsController {
  constructor(private readonly debts: DebtsService) {}

  @Get("reference-rates")
  referenceRates() {
    return this.debts.getReferenceRates();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: SafeUser) {
    return this.debts.findAll(user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateDebtDto
  ) {
    return this.debts.create(user.id, dto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ) {
    return this.debts.findOne(user.id, id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string,
    @Body() dto: UpdateDebtDto
  ) {
    return this.debts.update(user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ): Promise<void> {
    return this.debts.remove(user.id, id);
  }
}
