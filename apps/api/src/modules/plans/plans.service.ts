import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import {
  CreatePlanSchema,
  SimulateInputSchema,
  compareRefinance,
  simulateBoth,
  simulateCutImpact,
  simulatePayoff,
  type Debt,
  type PayoffResult,
  type RefinanceComparison
} from "@meudim/shared";
import type {
  PayoffPlan,
  Prisma
} from "@prisma/client";
import type { Queue } from "bullmq";

import { PrismaService } from "../../prisma/prisma.service";
import type { PdfJobData } from "../reports/pdf.processor";
import type { CreatePlanDto } from "./dto/create-plan.dto";
import type { CutSimulationDto } from "./dto/cut-simulation.dto";
import type { RefinanceDto } from "./dto/refinance.dto";
import type { SimulateDto } from "./dto/simulate.dto";

interface PayoffSummary {
  months: number;
  totalInterest: number;
  payoffDate: string;
  infeasible: boolean;
}

export interface SimulateResult {
  snowball: PayoffSummary;
  avalanche: PayoffSummary;
  savingsAvalanche: number;
}

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("pdf")
    private readonly pdfQueue: Queue<PdfJobData>
  ) {}

  simulate(dto: SimulateDto): SimulateResult {
    const input = this.parseSimulation(dto);
    const { snowball, avalanche } = simulateBoth(
      input.debts,
      input.monthlyBudget
    );

    return {
      snowball: this.toSummary(snowball),
      avalanche: this.toSummary(avalanche),
      savingsAvalanche: this.roundCurrency(
        snowball.totalInterest - avalanche.totalInterest
      )
    };
  }

  async create(
    userId: string,
    dto: CreatePlanDto
  ): Promise<PayoffPlan> {
    const parsed = CreatePlanSchema.safeParse(dto);

    if (!parsed.success) {
      throw this.validationError(parsed.error.issues);
    }

    const result = simulatePayoff(
      parsed.data.debts,
      parsed.data.monthlyBudget,
      parsed.data.chosenStrategy
    );
    const plan = await this.prisma.payoffPlan.create({
      data: {
        userId,
        strategy: parsed.data.chosenStrategy,
        monthlyBudget: parsed.data.monthlyBudget,
        resultJson: result as unknown as Prisma.InputJsonValue
      }
    });

    await this.pdfQueue.add(
      "generate",
      { planId: plan.id },
      {
        jobId: plan.id,
        attempts: 3,
        backoff: { type: "exponential", delay: 2_000 },
        removeOnComplete: 100
      }
    );

    return plan;
  }

  findAll(userId: string): Promise<PayoffPlan[]> {
    return this.prisma.payoffPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async findOne(userId: string, id: string): Promise<PayoffPlan> {
    const plan = await this.prisma.payoffPlan.findFirst({
      where: { id, userId }
    });

    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }

    return plan;
  }

  async compareRefinance(
    userId: string,
    id: string,
    dto: RefinanceDto
  ): Promise<RefinanceComparison> {
    const plan = await this.findOne(userId, id);
    const debts = await this.getUserDebts(userId);

    if (debts.length === 0) {
      throw new BadRequestException(
        "Cadastre ao menos uma dívida para comparar o refinanciamento"
      );
    }

    return compareRefinance(
      debts,
      Number(plan.monthlyBudget),
      dto.loanRate,
      dto.loanMonths
    );
  }

  async simulateCut(
    userId: string,
    dto: CutSimulationDto
  ): Promise<{
    newMonths: number;
    monthsSaved: number;
    interestSaved: number;
  }> {
    const records = await this.prisma.debt.findMany({
      where: {
        userId,
        id: { in: dto.debtIds }
      }
    });

    if (records.length !== dto.debtIds.length) {
      throw new NotFoundException(
        "Uma ou mais dívidas não foram encontradas"
      );
    }

    return simulateCutImpact(
      records.map((debt) => this.toEngineDebt(debt)),
      dto.currentBudget,
      dto.cutAmount
    );
  }

  private parseSimulation(dto: SimulateDto) {
    const result = SimulateInputSchema.safeParse(dto);

    if (!result.success) {
      throw this.validationError(result.error.issues);
    }

    return result.data;
  }

  private validationError(
    issues: { message: string }[]
  ): BadRequestException {
    return new BadRequestException(
      issues.map((issue) => issue.message).join("; ")
    );
  }

  private toSummary(result: PayoffResult): PayoffSummary {
    return {
      months: result.months,
      totalInterest: result.totalInterest,
      payoffDate: result.payoffDate,
      infeasible: result.infeasible
    };
  }

  private async getUserDebts(userId: string): Promise<Debt[]> {
    const debts = await this.prisma.debt.findMany({ where: { userId } });

    return debts.map((debt) => this.toEngineDebt(debt));
  }

  private toEngineDebt(debt: {
    id: string;
    name: string;
    type: Debt["type"];
    balance: Prisma.Decimal;
    monthlyRate: Prisma.Decimal;
    minimumPayment: Prisma.Decimal;
  }): Debt {
    return {
      id: debt.id,
      name: debt.name,
      type: debt.type,
      balance: Number(debt.balance),
      monthlyRate: Number(debt.monthlyRate),
      minimumPayment: Number(debt.minimumPayment)
    };
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
