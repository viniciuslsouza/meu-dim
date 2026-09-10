import type { Debt } from "../../types";
import {
  MAX_MONTHS,
  simulateBoth,
  simulatePayoff
} from "../payoff";

const avalancheFixture: Debt[] = [
  {
    id: "a",
    name: "Dívida menor",
    type: "CREDIT_CARD",
    balance: 2000,
    monthlyRate: 0.08,
    minimumPayment: 200
  },
  {
    id: "b",
    name: "Dívida mais cara",
    type: "CREDIT_CARD",
    balance: 3000,
    monthlyRate: 0.12,
    minimumPayment: 300
  }
];

describe("simulatePayoff", () => {
  it("marca como inviável quando o orçamento não cobre os mínimos", () => {
    const result = simulatePayoff(
      [
        {
          name: "Cartão",
          type: "CREDIT_CARD",
          balance: 5000,
          monthlyRate: 0.14,
          minimumPayment: 500
        }
      ],
      499,
      "AVALANCHE"
    );

    expect(result).toMatchObject({
      months: MAX_MONTHS,
      totalInterest: 0,
      totalPaid: 0,
      payoffDate: "",
      schedule: [],
      debtOrder: [],
      infeasible: true
    });
  });

  it("faz Avalanche economizar juros quando as estratégias divergem", () => {
    const { snowball, avalanche } = simulateBoth(avalancheFixture, 800);

    expect(avalanche.totalInterest).toBeLessThan(
      snowball.totalInterest
    );
    expect(snowball.debtOrder[0]).toBe("a");
    expect(avalanche.debtOrder[0]).toBe("b");
  });

  it("quita uma dívida em um mês quando o orçamento cobre juros e saldo", () => {
    const result = simulatePayoff(
      [
        {
          name: "Empréstimo",
          type: "LOAN",
          balance: 1000,
          monthlyRate: 0.05,
          minimumPayment: 50
        }
      ],
      1100,
      "SNOWBALL"
    );

    expect(result.months).toBe(1);
    expect(result.totalInterest).toBe(50);
    expect(result.totalPaid).toBe(1050);
    expect(result.schedule[0]).toMatchObject({
      totalInterest: 50,
      totalPayment: 1050
    });
    expect(result.schedule[0]?.debts[0]).toMatchObject({
      id: "debt-0",
      balance: 0,
      payment: 1050,
      interest: 50
    });
    expect(result.payoffDate).toMatch(/^\d{4}-\d{2}$/);
    expect(result.infeasible).toBe(false);
  });

  it("respeita a ordem original na estratégia CUSTOM", () => {
    const result = simulatePayoff(
      [
        {
          id: "primeira",
          name: "Primeira",
          type: "OTHER",
          balance: 200,
          monthlyRate: 0,
          minimumPayment: 10
        },
        {
          id: "segunda",
          name: "Segunda",
          type: "OTHER",
          balance: 100,
          monthlyRate: 0,
          minimumPayment: 10
        }
      ],
      210,
      "CUSTOM"
    );

    expect(result.debtOrder[0]).toBe("primeira");
  });

  it("não altera as dívidas recebidas", () => {
    const debts: Debt[] = [
      {
        name: "Original",
        type: "OTHER",
        balance: 100,
        monthlyRate: 0,
        minimumPayment: 10
      }
    ];

    simulatePayoff(debts, 100, "SNOWBALL");

    expect(debts[0]).toEqual({
      name: "Original",
      type: "OTHER",
      balance: 100,
      monthlyRate: 0,
      minimumPayment: 10
    });
  });

  it("retorna resultado vazio quando não há dívidas ativas", () => {
    const result = simulatePayoff([], 0, "AVALANCHE");

    expect(result).toMatchObject({
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      schedule: [],
      debtOrder: [],
      infeasible: false
    });
  });

  it("encerra como inviável quando a dívida não amortiza em 600 meses", () => {
    const result = simulatePayoff(
      [
        {
          name: "Rotativo",
          type: "CREDIT_CARD",
          balance: 5000,
          monthlyRate: 0.14,
          minimumPayment: 500
        }
      ],
      500,
      "AVALANCHE"
    );

    expect(result.months).toBe(MAX_MONTHS);
    expect(result.schedule).toHaveLength(MAX_MONTHS);
    expect(result.totalInterest).toBeGreaterThan(result.totalPaid);
    expect(result.payoffDate).toBe("");
    expect(result.infeasible).toBe(true);
  });
});
