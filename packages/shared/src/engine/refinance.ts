import type { Debt, RefinanceComparison } from "../types";

import { simulatePayoff } from "./payoff";

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calcPMT(
  pv: number,
  monthlyRate: number,
  months: number
): number {
  if (!Number.isInteger(months) || months <= 0) {
    throw new RangeError("months must be a positive integer");
  }

  if (pv < 0 || monthlyRate < 0) {
    throw new RangeError("pv and monthlyRate cannot be negative");
  }

  if (pv === 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return pv / months;
  }

  return (
    (pv * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -months))
  );
}

export function compareRefinance(
  debts: Debt[],
  monthlyBudget: number,
  loanRate: number,
  loanMonths: number
): RefinanceComparison {
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const currentResult = simulatePayoff(
    debts,
    monthlyBudget,
    "AVALANCHE"
  );
  const payment = calcPMT(totalDebt, loanRate, loanMonths);
  const currentCardCost = currentResult.totalInterest;
  const loanCost = payment * loanMonths - totalDebt;

  return {
    currentCardCost: roundCurrency(currentCardCost),
    loanCost: roundCurrency(loanCost),
    savings: roundCurrency(currentCardCost - loanCost),
    loanMonthlyPayment: roundCurrency(payment),
    affordsLoan: payment <= monthlyBudget
  };
}

export function simulateCutImpact(
  debts: Debt[],
  currentBudget: number,
  cutAmount: number
): { newMonths: number; monthsSaved: number; interestSaved: number } {
  if (cutAmount < 0) {
    throw new RangeError("cutAmount cannot be negative");
  }

  const current = simulatePayoff(debts, currentBudget, "AVALANCHE");
  const improved = simulatePayoff(
    debts,
    currentBudget + cutAmount,
    "AVALANCHE"
  );

  return {
    newMonths: improved.months,
    monthsSaved: current.months - improved.months,
    interestSaved: roundCurrency(
      current.totalInterest - improved.totalInterest
    )
  };
}
