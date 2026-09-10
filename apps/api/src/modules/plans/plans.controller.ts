import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PaidGuard } from "../auth/guards/paid.guard";
import type { SafeUser } from "../users/safe-user";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { CutSimulationDto } from "./dto/cut-simulation.dto";
import { RefinanceDto } from "./dto/refinance.dto";
import { SimulateDto } from "./dto/simulate.dto";
import { PlansService } from "./plans.service";

@ApiTags("plans")
@Controller("plans")
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Post("simulate")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  simulate(@Body() dto: SimulateDto) {
    return this.plans.simulate(dto);
  }

  @Post("cut-simulation")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaidGuard)
  simulateCut(
    @CurrentUser() user: SafeUser,
    @Body() dto: CutSimulationDto
  ) {
    return this.plans.simulateCut(user.id, dto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaidGuard)
  create(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreatePlanDto
  ) {
    return this.plans.create(user.id, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaidGuard)
  findAll(@CurrentUser() user: SafeUser) {
    return this.plans.findAll(user.id);
  }

  @Post(":id/refinance-compare")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaidGuard)
  compareRefinance(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string,
    @Body() dto: RefinanceDto
  ) {
    return this.plans.compareRefinance(user.id, id, dto);
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PaidGuard)
  findOne(
    @CurrentUser() user: SafeUser,
    @Param("id") id: string
  ) {
    return this.plans.findOne(user.id, id);
  }
}
