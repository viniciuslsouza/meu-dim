import type {
  Debt,
  MonthRow,
  PayoffResult,
  PayoffStrategy
} from "../types";

export const MAX_MONTHS = 600;
const PAID_THRESHOLD = 0.01;

interface InternalDebt extends Omit<Debt, "id"> {
  id: string;
  internalKey: string;
  originalIndex: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getPayoffDate(monthsFromNow: number): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + monthsFromNow);
  return date.toISOString().slice(0, 7);
}

function sortDebts(
  debts: InternalDebt[],
  strategy: PayoffStrategy
): InternalDebt[] {
  if (strategy === "SNOWBALL") {
    return [...debts].sort(
      (left, right) =>
        left.balance - right.balance ||
        left.originalIndex - right.originalIndex
    );
  }

  if (strategy === "AVALANCHE") {
    return [...debts].sort(
      (left, right) =>
        right.monthlyRate - left.monthlyRate ||
        left.originalIndex - right.originalIndex
    );
  }

  return [...debts].sort(
    (left, right) => left.originalIndex - right.originalIndex
  );
}

export function simulatePayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: PayoffStrategy
): PayoffResult {
  let remaining: InternalDebt[] = debts.map((debt, index) => {
    const id = debt.id ?? `debt-${index}`;

    return {
      ...debt,
      id,
      internalKey: `${id}:${index}`,
      originalIndex: index,
      balance: Math.max(0, debt.balance)
    };
  });
  const initiallyActive = remaining.filter(
    (debt) => debt.balance > PAID_THRESHOLD
  );
  const sumMinimums = initiallyActive.reduce(
    (sum, debt) => sum + debt.minimumPayment,
    0
  );

  if (initiallyActive.length > 0 && monthlyBudget < sumMinimums) {
    return {
      strategy,
      months: MAX_MONTHS,
      totalInterest: 0,
      totalPaid: 0,
      payoffDate: "",
      schedule: [],
      debtOrder: [],
      infeasible: true
    };
  }

  const schedule: MonthRow[] = [];
  const debtOrder: string[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (
    remaining.some((debt) => debt.balance > PAID_THRESHOLD) &&
    month < MAX_MONTHS
  ) {
    month += 1;
    const interestByDebt = new Map<string, number>();

    remaining = remaining.map((debt) => {
      const interest =
        debt.balance > PAID_THRESHOLD
          ? debt.balance * Math.max(0, debt.monthlyRate)
          : 0;

      interestByDebt.set(debt.internalKey, interest);
      totalInterest += interest;

      return {
        ...debt,
        balance: debt.balance + interest
      };
    });

    const active = remaining.filter(
      (debt) => debt.balance > PAID_THRESHOLD
    );
    const sorted = sortDebts(active, strategy);
    const payments = new Map<string, number>();
    let surplus = monthlyBudget;

    for (const debt of remaining) {
      if (debt.balance <= PAID_THRESHOLD) {
        payments.set(debt.internalKey, 0);
        continue;
      }

      const minimumPayment = Math.min(
        debt.minimumPayment,
        debt.balance
      );

      payments.set(debt.internalKey, minimumPayment);
      surplus -= minimumPayment;
    }

    for (const debt of sorted) {
      if (surplus <= 0) {
        break;
      }

      const existingPayment = payments.get(debt.internalKey)!;
      const extraPayment = Math.min(
        surplus,
        Math.max(0, debt.balance - existingPayment)
      );

      payments.set(debt.internalKey, existingPayment + extraPayment);
      surplus -= extraPayment;
    }

    const monthRow: MonthRow = {
      month,
      debts: [],
      totalPayment: 0,
      totalInterest: 0
    };

    remaining = remaining.map((debt) => {
      const payment = payments.get(debt.internalKey)!;
      const interest = interestByDebt.get(debt.internalKey)!;
      const newBalance = Math.max(0, debt.balance - payment);

      monthRow.debts.push({
        id: debt.id,
        balance: roundCurrency(newBalance),
        payment: roundCurrency(payment),
        interest: roundCurrency(interest)
      });
      monthRow.totalPayment += payment;
      monthRow.totalInterest += interest;

      if (
        debt.balance > PAID_THRESHOLD &&
        newBalance <= PAID_THRESHOLD &&
        !debtOrder.includes(debt.id)
      ) {
        debtOrder.push(debt.id);
      }

      return {
        ...debt,
        balance: newBalance
      };
    });

    monthRow.totalPayment = roundCurrency(monthRow.totalPayment);
    monthRow.totalInterest = roundCurrency(monthRow.totalInterest);
    totalPaid += monthRow.totalPayment;
    schedule.push(monthRow);
  }

  const hasOutstandingDebt = remaining.some(
    (debt) => debt.balance > PAID_THRESHOLD
  );

  return {
    strategy,
    months: month,
    totalInterest: roundCurrency(totalInterest),
    totalPaid: roundCurrency(totalPaid),
    payoffDate: hasOutstandingDebt ? "" : getPayoffDate(month),
    schedule,
    debtOrder,
    infeasible: hasOutstandingDebt
  };
}

export function simulateBoth(
  debts: Debt[],
  monthlyBudget: number
): { snowball: PayoffResult; avalanche: PayoffResult } {
  return {
    snowball: simulatePayoff(debts, monthlyBudget, "SNOWBALL"),
    avalanche: simulatePayoff(debts, monthlyBudget, "AVALANCHE")
  };
}
