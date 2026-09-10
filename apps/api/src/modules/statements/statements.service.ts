import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  StatementInputSchema,
  calcHealthScore,
  categorize,
  detectSubscriptions,
  getInstallmentsForecast,
  getTopOffenders,
  type Category,
  type DiagnosisResult,
  type RawTransaction
} from "@meudim/shared";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import type { CreateStatementDto } from "./dto/create-statement.dto";

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type StatementWithTransactions = Prisma.StatementGetPayload<{
  include: { transactions: true };
}>;

const EVITABLE_CATEGORIES = new Set<Category>([
  "Alimentação fora",
  "Delivery",
  "Assinaturas/Streaming",
  "Vestuário",
  "Lazer",
  "Viagem",
  "Compras online"
]);

@Injectable()
export class StatementsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    dto: CreateStatementDto
  ): Promise<StatementWithTransactions> {
    const result = StatementInputSchema.safeParse(dto);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message).join("; ")
      );
    }

    const input = result.data;
    const total =
      input.total ??
      input.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

    return this.prisma.$transaction(async (database) => {
      const statement = await database.statement.upsert({
        where: {
          userId_bank_referenceMonth: {
            userId,
            bank: input.bank,
            referenceMonth: input.referenceMonth
          }
        },
        create: {
          userId,
          bank: input.bank,
          referenceMonth: input.referenceMonth,
          total,
          minimumPayment: input.minimumPayment,
          dueDate: input.dueDate
            ? new Date(`${input.dueDate}T00:00:00.000Z`)
            : undefined
        },
        update: {
          total,
          minimumPayment: input.minimumPayment ?? null,
          dueDate: input.dueDate
            ? new Date(`${input.dueDate}T00:00:00.000Z`)
            : null
        }
      });

      await database.transaction.deleteMany({
        where: { statementId: statement.id }
      });

      if (input.transactions.length > 0) {
        await database.transaction.createMany({
          data: input.transactions.map((transaction) => ({
            statementId: statement.id,
            date: new Date(`${transaction.date}T00:00:00.000Z`),
            description: transaction.description,
            merchantKey: transaction.merchantKey,
            amount: transaction.amount,
            category: transaction.category,
            installment: transaction.installment,
            installments: transaction.installments,
            isRecurring: transaction.isRecurring
          }))
        });
      }

      const correctedTransactions = input.transactions.filter(
        (transaction) =>
          categorize(transaction.merchantKey) !== transaction.category
      );

      for (const transaction of correctedTransactions) {
        await database.userCategoryRule.upsert({
          where: {
            userId_merchantKey: {
              userId,
              merchantKey: transaction.merchantKey
            }
          },
          create: {
            userId,
            merchantKey: transaction.merchantKey,
            category: transaction.category
          },
          update: { category: transaction.category }
        });
      }

      return database.statement.findUniqueOrThrow({
        where: { id: statement.id },
        include: { transactions: true }
      });
    });
  }

  async findAll(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<StatementWithTransactions>> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.statement.findMany({
        where: { userId },
        include: { transactions: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.statement.count({ where: { userId } })
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(
    userId: string,
    id: string
  ): Promise<StatementWithTransactions> {
    const statement = await this.prisma.statement.findFirst({
      where: { id, userId },
      include: { transactions: true }
    });

    if (!statement) {
      throw new NotFoundException("Fatura não encontrada");
    }

    return statement;
  }

  async updateTransactionCategory(
    userId: string,
    statementId: string,
    transactionId: string,
    category: Category
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        statementId,
        statement: { userId }
      }
    });

    if (!transaction) {
      throw new NotFoundException("Transação não encontrada");
    }

    return this.prisma.$transaction(async (database) => {
      const updated = await database.transaction.update({
        where: { id: transaction.id },
        data: { category }
      });

      await database.userCategoryRule.upsert({
        where: {
          userId_merchantKey: {
            userId,
            merchantKey: transaction.merchantKey
          }
        },
        create: {
          userId,
          merchantKey: transaction.merchantKey,
          category
        },
        update: { category }
      });

      return updated;
    });
  }

  async getDiagnosis(
    userId: string,
    statementId: string
  ): Promise<DiagnosisResult> {
    const statement = await this.findOne(userId, statementId);
    const transactions: RawTransaction[] = statement.transactions.map(
      (transaction) => ({
        date: transaction.date.toISOString().slice(0, 10),
        description: transaction.description,
        merchantKey: transaction.merchantKey,
        amount: Number(transaction.amount),
        category: transaction.category as Category,
        installment: transaction.installment ?? undefined,
        installments: transaction.installments ?? undefined,
        isRecurring: transaction.isRecurring
      })
    );
    const total = Number(statement.total);
    const totalInterest = transactions
      .filter(({ category }) => category === "Juros e encargos")
      .reduce((sum, { amount }) => sum + amount, 0);
    const totalInstallments = transactions
      .filter(({ installments }) => installments !== undefined)
      .reduce((sum, { amount }) => sum + amount, 0);
    const totalEvitable = transactions
      .filter(({ category }) => EVITABLE_CATEGORIES.has(category))
      .reduce((sum, { amount }) => sum + amount, 0);
    const totalRecurring = transactions
      .filter(({ isRecurring }) => isRecurring)
      .reduce((sum, { amount }) => sum + amount, 0);
    const health = calcHealthScore({
      total,
      totalInterest,
      totalInstallments,
      totalEvitable
    });

    return {
      healthScore: health.score,
      healthLabel: health.label,
      topOffenders: getTopOffenders(transactions),
      subscriptions: detectSubscriptions(transactions),
      installmentsForecast: getInstallmentsForecast(
        transactions,
        statement.referenceMonth
      ),
      totalInterestPaid: totalInterest,
      totalRecurring
    };
  }
}
