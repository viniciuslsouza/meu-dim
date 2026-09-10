import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { SafeUser } from "../users/safe-user";
import { CreateStatementDto } from "./dto/create-statement.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { UpdateTransactionCategoryDto } from "./dto/update-transaction-category.dto";
import { StatementsService } from "./statements.service";

@ApiTags("statements")
@ApiBearerAuth()
@Controller("statements")
@UseGuards(JwtAuthGuard)
export class StatementsController {
  constructor(private readonly statements: StatementsService) {}

  @Post()
  create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateStatementDto
  ) {
    return this.statements.upsert(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: SafeUser,
    @Query() pagination: PaginationDto
  ) {
    return this.statements.findAll(
      user.id,
      pagination.page,
      pagination.limit
    );
  }

  @Get(":id/diagnosis")
  diagnosis(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ) {
    return this.statements.getDiagnosis(user.id, id);
  }

  @Patch(":id/transactions/:transactionId")
  updateTransactionCategory(
    @CurrentUser() user: SafeUser,
    @Param("id") statementId: string,
    @Param("transactionId") transactionId: string,
    @Body() dto: UpdateTransactionCategoryDto
  ) {
    return this.statements.updateTransactionCategory(
      user.id,
      statementId,
      transactionId,
      dto.category
    );
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ) {
    return this.statements.findOne(user.id, id);
  }
}
