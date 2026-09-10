import type { Debt } from "../../types";
import {
  calcPMT,
  compareRefinance,
  simulateCutImpact
} from "../refinance";

const cardDebt: Debt = {
  id: "card",
  name: "Cartão",
  type: "CREDIT_CARD",
  balance: 5000,
  monthlyRate: 0.05,
  minimumPayment: 250
};

describe("calcPMT", () => {
  it("divide o principal quando a taxa é zero", () => {
    expect(calcPMT(1200, 0, 12)).toBe(100);
  });

  it("calcula a prestação pela Tabela Price", () => {
    expect(calcPMT(1000, 0.01, 12)).toBeCloseTo(88.85, 2);
  });

  it("retorna zero para principal zerado", () => {
    expect(calcPMT(0, 0.03, 12)).toBe(0);
  });

  it.each([
    [1000, 0.01, 0],
    [1000, 0.01, 1.5],
    [-1, 0.01, 12],
    [1000, -0.01, 12]
  ])("rejeita parâmetros financeiros inválidos", (pv, rate, months) => {
    expect(() => calcPMT(pv, rate, months)).toThrow(RangeError);
  });
});

describe("compareRefinance", () => {
  it("retorna economia negativa quando o empréstimo é mais caro", () => {
    const comparison = compareRefinance(
      [{ ...cardDebt, balance: 1000, monthlyRate: 0.02 }],
      200,
      0.2,
      12
    );

    expect(comparison.savings).toBeLessThan(0);
    expect(comparison.loanCost).toBeGreaterThan(
      comparison.currentCardCost
    );
    expect(comparison.affordsLoan).toBe(false);
  });

  it("identifica uma prestação que cabe no orçamento", () => {
    const comparison = compareRefinance(
      [cardDebt],
      1000,
      0.01,
      24
    );

    expect(comparison.loanMonthlyPayment).toBeLessThan(1000);
    expect(comparison.affordsLoan).toBe(true);
  });

  it("lida com uma lista vazia de dívidas", () => {
    expect(compareRefinance([], 0, 0.03, 12)).toEqual({
      currentCardCost: 0,
      loanCost: 0,
      savings: 0,
      loanMonthlyPayment: 0,
      affordsLoan: true
    });
  });
});

describe("simulateCutImpact", () => {
  it("reduz prazo e juros ao liberar orçamento mensal", () => {
    const result = simulateCutImpact([cardDebt], 500, 200);

    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.newMonths).toBeGreaterThan(0);
  });

  it("rejeita valor de corte negativo", () => {
    expect(() => simulateCutImpact([cardDebt], 500, -1)).toThrow(
      RangeError
    );
  });
});
