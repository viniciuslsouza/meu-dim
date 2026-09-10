import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { DebtSchema, type DebtType } from "@meudim/shared";
import type { Debt as PrismaDebt } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import type { CreateDebtDto } from "./dto/create-debt.dto";
import type { UpdateDebtDto } from "./dto/update-debt.dto";

export interface ReferenceRate {
  type: DebtType;
  minRate: number;
  avgRate: number;
  maxRate: number;
}

export interface ReferenceRatesResult {
  rates: ReferenceRate[];
  warning: string;
}

const REFERENCE_RATES: ReferenceRate[] = [
  {
    type: "CREDIT_CARD",
    minRate: 0.09,
    avgRate: 0.149,
    maxRate: 0.3
  },
  {
    type: "LOAN",
    minRate: 0.018,
    avgRate: 0.035,
    maxRate: 0.08
  },
  {
    type: "OVERDRAFT",
    minRate: 0.12,
    avgRate: 0.18,
    maxRate: 0.3
  },
  {
    type: "OTHER",
    minRate: 0.01,
    avgRate: 0.05,
    maxRate: 0.15
  }
];

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateDebtDto
  ): Promise<PrismaDebt> {
    this.validateDebt(dto);

    return this.prisma.debt.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        balance: dto.balance,
        monthlyRate: dto.monthlyRate,
        minimumPayment: dto.minimumPayment
      }
    });
  }

  findAll(userId: string): Promise<PrismaDebt[]> {
    return this.prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async findOne(userId: string, id: string): Promise<PrismaDebt> {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId }
    });

    if (!debt) {
      throw new NotFoundException("Dívida não encontrada");
    }

    return debt;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateDebtDto
  ): Promise<PrismaDebt> {
    const current = await this.findOne(userId, id);
    const updatedDebt = {
      id: current.id,
      name: dto.name ?? current.name,
      type: dto.type ?? current.type,
      balance: dto.balance ?? Number(current.balance),
      monthlyRate: dto.monthlyRate ?? Number(current.monthlyRate),
      minimumPayment:
        dto.minimumPayment ?? Number(current.minimumPayment)
    };

    this.validateDebt(updatedDebt);

    return this.prisma.debt.update({
      where: { id: current.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.balance !== undefined ? { balance: dto.balance } : {}),
        ...(dto.monthlyRate !== undefined
          ? { monthlyRate: dto.monthlyRate }
          : {}),
        ...(dto.minimumPayment !== undefined
          ? { minimumPayment: dto.minimumPayment }
          : {})
      }
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const debt = await this.findOne(userId, id);

    await this.prisma.debt.delete({ where: { id: debt.id } });
  }

  getReferenceRates(): ReferenceRatesResult {
    return {
      rates: REFERENCE_RATES,
      warning:
        "Taxas de referência. Confirme com sua instituição financeira."
    };
  }

  private validateDebt(debt: {
    id?: string;
    name: string;
    type: DebtType;
    balance: number;
    monthlyRate: number;
    minimumPayment: number;
  }): void {
    const result = DebtSchema.safeParse(debt);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message).join("; ")
      );
    }
  }
}
