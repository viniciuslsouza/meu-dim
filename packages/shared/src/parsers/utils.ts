import type { BankId, ParsedStatement, RawTransaction } from "../types";
import { categorize, normalize } from "../engine";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const CURRENCY_PATTERN =
  /(?:R\$\s*)?[−-]?\s*\d+(?:\.\d{3})*,\d{2}|(?:R\$\s*)?[−-]?\s*\d+\.\d{2}/g;

const MONTHS: Record<string, number> = {
  JAN: 1,
  FEV: 2,
  MAR: 3,
  ABR: 4,
  MAI: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SET: 9,
  OUT: 10,
  NOV: 11,
  DEZ: 12
};

export function parseCurrency(value: string | number): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const isNegative =
    /[−-]\s*(?:R\$\s*)?\d/.test(trimmed) || /-\s*$/.test(trimmed);
  let numeric = trimmed
    .replace(/[R$\s−-]/g, "")
    .replace(/[^\d.,]/g, "");

  if (numeric.includes(",")) {
    numeric = numeric.replace(/\./g, "").replace(",", ".");
  } else {
    const dots = numeric.match(/\./g)?.length ?? 0;

    if (dots > 1) {
      numeric = numeric.replace(/\./g, "");
    }
  }

  if (!numeric || !/\d/.test(numeric)) {
    return undefined;
  }

  const parsed = Number(numeric);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return isNegative ? -parsed : parsed;
}

export function extractLastCurrency(text: string): number | undefined {
  const matches = [...text.matchAll(CURRENCY_PATTERN)];
  const lastMatch = matches.at(-1)?.[0];

  return lastMatch === undefined ? undefined : parseCurrency(lastMatch);
}

export function extractFirstCurrency(text: string): number | undefined {
  const firstMatch = [...text.matchAll(CURRENCY_PATTERN)][0]?.[0];

  return firstMatch === undefined ? undefined : parseCurrency(firstMatch);
}

export function parseDate(
  value: string | Date,
  fallbackYear?: number
): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }

    return [
      value.getUTCFullYear(),
      String(value.getUTCMonth() + 1).padStart(2, "0"),
      String(value.getUTCDate()).padStart(2, "0")
    ].join("-");
  }

  const trimmed = value.trim();

  if (ISO_DATE.test(trimmed)) {
    return trimmed;
  }

  const brDate = BR_DATE.exec(trimmed);

  if (brDate) {
    return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  }

  const shortBrDate = /^(\d{2})\/(\d{2})$/.exec(trimmed);

  if (shortBrDate && fallbackYear !== undefined) {
    return `${fallbackYear}-${shortBrDate[2]}-${shortBrDate[1]}`;
  }

  const shortDate =
    /^(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)$/i.exec(
      trimmed
    );

  if (!shortDate || fallbackYear === undefined) {
    return undefined;
  }

  const month = MONTHS[shortDate[2]?.toUpperCase() ?? ""];

  if (month === undefined) {
    return undefined;
  }

  return `${fallbackYear}-${String(month).padStart(2, "0")}-${String(
    Number(shortDate[1])
  ).padStart(2, "0")}`;
}

export function extractInstallment(description: string): {
  installment?: number;
  installments?: number;
} {
  const match = /(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/i.exec(description);

  if (!match) {
    return {};
  }

  return {
    installment: Number(match[1]),
    installments: Number(match[2])
  };
}

export function createTransaction(
  date: string,
  description: string,
  amount: number
): RawTransaction {
  return {
    date,
    description: description.trim(),
    merchantKey: normalize(description),
    amount,
    category: categorize(description),
    ...extractInstallment(description),
    isRecurring: false
  };
}

export function getReferenceMonth(
  transactions: RawTransaction[],
  fallback = ""
): string {
  return transactions[0]?.date.slice(0, 7) ?? fallback;
}

export function createStatement(
  bank: BankId,
  transactions: RawTransaction[],
  warnings: string[],
  metadata: {
    referenceMonth?: string;
    total?: number;
    minimumPayment?: number;
    dueDate?: string;
  } = {}
): ParsedStatement {
  const calculatedTotal = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return {
    bank,
    referenceMonth:
      metadata.referenceMonth ?? getReferenceMonth(transactions),
    total:
      metadata.total ??
      Math.round((calculatedTotal + Number.EPSILON) * 100) / 100,
    ...(metadata.minimumPayment === undefined
      ? {}
      : { minimumPayment: metadata.minimumPayment }),
    ...(metadata.dueDate === undefined ? {} : { dueDate: metadata.dueDate }),
    transactions,
    warnings
  };
}

export function splitLines(pages: string[]): string[] {
  return pages
    .flatMap((page) => page.split(/\r?\n/))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function getStatementYear(lines: string[]): number {
  for (const line of lines) {
    const match = /\b(20\d{2})\b/.exec(line);

    if (match) {
      return Number(match[1]);
    }
  }

  return new Date().getUTCFullYear();
}
