import type {
  InstallmentMonth,
  OffenderItem,
  RawTransaction,
  SubscriptionItem
} from "../types";

import { categorize } from "./categorize";

type HealthLabel = "critico" | "alerta" | "atencao" | "bom" | "otimo";

interface HealthScoreParams {
  total: number;
  income?: number;
  totalInterest: number;
  totalInstallments: number;
  totalEvitable: number;
}

function clamp(value: number, minimum = 0, maximum = 100): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getTopOffenders(
  transactions: RawTransaction[],
  topN = 5
): OffenderItem[] {
  const total = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const categories = new Map<
    RawTransaction["category"],
    { total: number; merchants: Map<string, number> }
  >();

  for (const transaction of transactions) {
    const category = categories.get(transaction.category) ?? {
      total: 0,
      merchants: new Map<string, number>()
    };

    category.total += transaction.amount;
    category.merchants.set(
      transaction.merchantKey,
      (category.merchants.get(transaction.merchantKey) ?? 0) +
        transaction.amount
    );
    categories.set(transaction.category, category);
  }

  return [...categories.entries()]
    .map(([category, values]) => ({
      category,
      total: values.total,
      percentage: total > 0 ? (values.total / total) * 100 : 0,
      topMerchants: [...values.merchants.entries()]
        .map(([name, amount]) => ({ name, amount }))
        .sort((left, right) => right.amount - left.amount)
        .slice(0, 3)
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, Math.max(0, topN));
}

function getMonthlyAmount(
  transactions: RawTransaction[],
  merchantKey: string
): number | undefined {
  const matching = transactions.filter(
    (transaction) => transaction.merchantKey === merchantKey
  );

  if (matching.length === 0) {
    return undefined;
  }

  return matching.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
}

function hasStableMonthlyValues(amounts: number[]): boolean {
  if (amounts.length < 2) {
    return false;
  }

  const average =
    amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;

  if (average === 0) {
    return amounts.every((amount) => amount === 0);
  }

  return amounts.every(
    (amount) => Math.abs(amount - average) / average <= 0.15
  );
}

export function detectSubscriptions(
  transactions: RawTransaction[],
  allMonths: RawTransaction[][] = [transactions]
): SubscriptionItem[] {
  const merchantKeys = new Set(
    transactions.map((transaction) => transaction.merchantKey)
  );
  const subscriptions: SubscriptionItem[] = [];

  for (const merchantKey of merchantKeys) {
    const monthlyAmounts = allMonths
      .map((month) => getMonthlyAmount(month, merchantKey))
      .filter((amount): amount is number => amount !== undefined);
    const isKnownSubscription =
      categorize(merchantKey) === "Assinaturas/Streaming";
    const isRecurring = hasStableMonthlyValues(monthlyAmounts);

    if (!isKnownSubscription && !isRecurring) {
      continue;
    }

    const currentAmount =
      getMonthlyAmount(transactions, merchantKey) ?? monthlyAmounts.at(-1) ?? 0;

    subscriptions.push({
      merchantKey,
      displayName: merchantKey,
      amount: currentAmount,
      isRecurring: true
    });
  }

  return subscriptions.sort((left, right) => right.amount - left.amount);
}

function addMonths(baseMonth: string, amount: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(baseMonth);

  if (!match) {
    throw new RangeError("baseMonth must use the YYYY-MM format");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    throw new RangeError("baseMonth must contain a valid month");
  }

  const date = new Date(Date.UTC(year, month - 1 + amount, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function getInstallmentsForecast(
  transactions: RawTransaction[],
  baseMonth: string
): InstallmentMonth[] {
  const forecast = Array.from({ length: 12 }, (_, index) => ({
    month: addMonths(baseMonth, index + 1),
    total: 0
  }));

  for (const transaction of transactions) {
    if (
      transaction.installment === undefined ||
      transaction.installments === undefined
    ) {
      continue;
    }

    const remainingInstallments = Math.max(
      0,
      transaction.installments - transaction.installment
    );

    for (
      let index = 0;
      index < Math.min(remainingInstallments, forecast.length);
      index += 1
    ) {
      const month = forecast[index];

      if (month) {
        month.total += transaction.amount;
      }
    }
  }

  return forecast.map((month) => ({
    ...month,
    total: Number(month.total.toFixed(2))
  }));
}

function getHealthLabel(score: number): HealthLabel {
  if (score <= 30) {
    return "critico";
  }

  if (score <= 50) {
    return "alerta";
  }

  if (score <= 65) {
    return "atencao";
  }

  if (score <= 80) {
    return "bom";
  }

  return "otimo";
}

export function calcHealthScore({
  total,
  income,
  totalInterest,
  totalInstallments,
  totalEvitable
}: HealthScoreParams): { score: number; label: HealthLabel } {
  const safeTotal = Math.max(0, total);
  const commitmentScore =
    income === undefined || income <= 0
      ? 50
      : clamp(100 - (safeTotal / income) * 100);
  const interestRatio = safeTotal > 0 ? totalInterest / safeTotal : 0;
  const installmentRatio = safeTotal > 0 ? totalInstallments / safeTotal : 0;
  const evitableRatio = safeTotal > 0 ? totalEvitable / safeTotal : 0;
  const interestScore = clamp(100 - (interestRatio / 0.2) * 100);
  const installmentScore = clamp(100 - (installmentRatio / 0.5) * 100);
  const evitableScore =
    evitableRatio <= 0.1
      ? 100
      : clamp(100 - ((evitableRatio - 0.1) / 0.3) * 100);
  const score = Math.round(
    commitmentScore * 0.35 +
      interestScore * 0.25 +
      installmentScore * 0.2 +
      evitableScore * 0.2
  );

  return {
    score,
    label: getHealthLabel(score)
  };
}
