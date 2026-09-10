import type { Queue } from "bullmq";
import { Prisma } from "@prisma/client";

import { PlansService } from "../../src/modules/plans/plans.service";
import type { PdfJobData } from "../../src/modules/reports/pdf.processor";
import type { PrismaService } from "../../src/prisma/prisma.service";

describe("PlansService", () => {
  const prisma = {} as unknown as PrismaService;
  const queue = {} as unknown as Queue<PdfJobData>;
  const service = new PlansService(prisma, queue);

  it("marks both strategies infeasible when budget is insufficient", () => {
    const result = service.simulate({
      debts: [
        {
          name: "Cartão",
          type: "CREDIT_CARD",
          balance: 5_000,
          monthlyRate: 0.15,
          minimumPayment: 500
        }
      ],
      monthlyBudget: 400,
      strategies: ["SNOWBALL", "AVALANCHE"]
    });

    expect(result.snowball.infeasible).toBe(true);
    expect(result.avalanche.infeasible).toBe(true);
  });

  it("pays a single debt in one or more months", () => {
    const result = service.simulate({
      debts: [
        {
          name: "Empréstimo",
          type: "LOAN",
          balance: 1_000,
          monthlyRate: 0.02,
          minimumPayment: 100
        }
      ],
      monthlyBudget: 300,
      strategies: ["SNOWBALL", "AVALANCHE"]
    });

    expect(result.snowball.months).toBeGreaterThan(0);
    expect(result.snowball.infeasible).toBe(false);
  });

  it("does not charge more interest with avalanche", () => {
    const result = service.simulate({
      debts: [
        {
          name: "Cartão caro",
          type: "CREDIT_CARD",
          balance: 4_000,
          monthlyRate: 0.18,
          minimumPayment: 400
        },
        {
          name: "Empréstimo barato",
          type: "LOAN",
          balance: 1_000,
          monthlyRate: 0.02,
          minimumPayment: 100
        }
      ],
      monthlyBudget: 800,
      strategies: ["SNOWBALL", "AVALANCHE"]
    });

    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(
      result.snowball.totalInterest
    );
    expect(result.savingsAvalanche).toBeGreaterThanOrEqual(0);
  });

  it("saves a paid plan and enqueues its PDF", async () => {
    const plan = {
      id: "plan-1",
      userId: "user-1",
      strategy: "AVALANCHE",
      monthlyBudget: new Prisma.Decimal(300),
      resultJson: {},
      pdfUrl: null,
      createdAt: new Date()
    };
    const create = jest.fn().mockResolvedValue(plan);
    const add = jest.fn().mockResolvedValue({ id: "plan-1" });
    const createService = new PlansService(
      {
        payoffPlan: { create }
      } as unknown as PrismaService,
      { add } as unknown as Queue<PdfJobData>
    );

    const result = await createService.create("user-1", {
      debts: [
        {
          name: "Cartão",
          type: "CREDIT_CARD",
          balance: 1_000,
          monthlyRate: 0.1,
          minimumPayment: 100
        }
      ],
      monthlyBudget: 300,
      strategies: ["SNOWBALL", "AVALANCHE"],
      chosenStrategy: "AVALANCHE"
    });

    expect(result).toBe(plan);
    expect(add).toHaveBeenCalledWith(
      "generate",
      { planId: "plan-1" },
      expect.objectContaining({ jobId: "plan-1" })
    );
  });
});
