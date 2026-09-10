import { BadRequestException } from "@nestjs/common";

import { DebtsService } from "../../src/modules/debts/debts.service";
import type { PrismaService } from "../../src/prisma/prisma.service";

describe("DebtsService", () => {
  it("rejects a monthly rate above thirty percent", async () => {
    const create = jest.fn();
    const service = new DebtsService({
      debt: { create }
    } as unknown as PrismaService);

    await expect(
      service.create("user-1", {
        name: "Cartão",
        type: "CREDIT_CARD",
        balance: 1_000,
        monthlyRate: 0.31,
        minimumPayment: 100
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it("filters the debt list by its owner", async () => {
    const ownDebt = { id: "debt-1", userId: "user-1" };
    const findMany = jest.fn().mockResolvedValue([ownDebt]);
    const service = new DebtsService({
      debt: { findMany }
    } as unknown as PrismaService);

    const result = await service.findAll("user-1");

    expect(result).toEqual([ownDebt]);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" }
    });
  });
});
