import type { RawTransaction } from "../types";
import { normalize } from "../engine";
import type {
  BankParser,
  SpreadsheetCell,
  SpreadsheetRow
} from "./types";
import {
  createStatement,
  createTransaction,
  extractFirstCurrency,
  extractInstallment,
  extractLastCurrency,
  getStatementYear,
  parseCurrency,
  parseDate,
  splitLines
} from "./utils";

function cellText(cell: SpreadsheetCell): string {
  return cell instanceof Date ? cell.toISOString() : String(cell ?? "").trim();
}

function findColumn(row: SpreadsheetRow, title: string): number {
  return row.findIndex(
    (cell) => cellText(cell).toLocaleLowerCase("pt-BR") === title
  );
}

function splitTransactionColumns(lines: string[]): string[] {
  return lines.flatMap((line) => {
    const candidates = [...line.matchAll(/(?:^|\s)(\d{2}\/\d{2})\s/g)]
      .map((match) => (match.index ?? 0) + (match[0].startsWith(" ") ? 1 : 0));
    const starts: number[] = [];

    for (const candidate of candidates) {
      const previousStart = starts.at(-1);

      if (
        previousStart === undefined ||
        extractFirstCurrency(line.slice(previousStart, candidate)) !==
          undefined
      ) {
        starts.push(candidate);
      }
    }

    if (starts.length <= 1) {
      return [line];
    }

    return starts.map((start, index) =>
      line.slice(start, starts[index + 1] ?? line.length).trim()
    );
  });
}

function parseSpreadsheet(rows: SpreadsheetRow[]) {
  const warnings: string[] = [];
  const headerIndex = rows.findIndex(
    (row) =>
      findColumn(row, "data") >= 0 &&
      findColumn(row, "lançamento") >= 0 &&
      findColumn(row, "valor") >= 0
  );

  if (headerIndex < 0) {
    return createStatement(
      "ITAU",
      [],
      ["Cabeçalho de lançamentos não identificado na planilha."]
    );
  }

  const header = rows[headerIndex] ?? [];
  const dateColumn = findColumn(header, "data");
  const descriptionColumn = findColumn(header, "lançamento");
  const installmentColumn = findColumn(header, "parcelamento");
  const amountColumn = findColumn(header, "valor");
  const transactions: RawTransaction[] = [];
  let ignoredCredits = 0;

  rows.slice(headerIndex + 1).forEach((row, index) => {
    const rawDate = row[dateColumn];
    const rawDescription = row[descriptionColumn];
    const rawAmount = row[amountColumn];
    const date =
      rawDate instanceof Date || typeof rawDate === "string"
        ? parseDate(rawDate)
        : undefined;
    const description = cellText(rawDescription ?? null);
    const amount =
      typeof rawAmount === "string" || typeof rawAmount === "number"
        ? parseCurrency(rawAmount)
        : undefined;

    if (amount !== undefined && amount <= 0) {
      ignoredCredits += 1;
      return;
    }

    if (!date || !description || amount === undefined) {
      const relevantValues = [rawDate, rawDescription, rawAmount].filter(
        (cell) => cell !== null && cell !== undefined && cell !== ""
      );

      if (relevantValues.length >= 2) {
        warnings.push(
          `Linha ${headerIndex + index + 2}: lançamento inválido ignorado.`
        );
      }
      return;
    }

    const parsed = createTransaction(date, description, amount);
    const installment =
      installmentColumn >= 0
        ? extractInstallment(cellText(row[installmentColumn] ?? null))
        : {};

    transactions.push({ ...parsed, ...installment });
  });

  if (ignoredCredits > 0) {
    warnings.push(
      `${ignoredCredits} crédito(s) ou pagamento(s) foram ignorados.`
    );
  }

  const summaryHeaderIndex = rows.findIndex(
    (row) =>
      findColumn(row, "valor") >= 0 && findColumn(row, "vencimento") >= 0
  );
  const summaryHeader = rows[summaryHeaderIndex] ?? [];
  const summaryValues = rows[summaryHeaderIndex + 1] ?? [];
  const totalColumn = findColumn(summaryHeader, "valor");
  const dueDateColumn = findColumn(summaryHeader, "vencimento");
  const total =
    typeof summaryValues[totalColumn] === "number"
      ? summaryValues[totalColumn]
      : undefined;
  const dueDateValue = summaryValues[dueDateColumn];
  const dueDate =
    dueDateValue instanceof Date || typeof dueDateValue === "string"
      ? parseDate(dueDateValue)
      : undefined;

  return createStatement("ITAU", transactions, warnings, {
    ...(total === undefined ? {} : { total }),
    ...(dueDate === undefined ? {} : { dueDate }),
    ...(dueDate === undefined
      ? {}
      : { referenceMonth: dueDate.slice(0, 7) })
  });
}

function parsePdfText(pages: string[]) {
  const lines = splitLines(pages);
  const text = lines.join(" ");
  const year = getStatementYear(lines);
  const total = extractLastCurrency(
    /Total desta fatura\s+(?:R\$\s*)?[\d.,]+/i.exec(text)?.[0] ?? ""
  );
  const minimumPayment = extractLastCurrency(
    /Pagamento mínimo:\s*(?:R\$\s*)?[\d.,]+/i.exec(text)?.[0] ?? ""
  );
  const dueMatch = /Vencimento:\s*(\d{2}\/\d{2}\/20\d{2})/i.exec(text);
  const dueDate = dueMatch ? parseDate(dueMatch[1] ?? "") : undefined;
  const start = lines.findIndex((line) => /^Continua/i.test(line));
  const transactionLines = splitTransactionColumns(
    start >= 0 ? lines.slice(start + 1) : lines
  );
  const transactions: RawTransaction[] = [];
  const warnings: string[] = [];
  const installmentCandidates = new Map<
    string,
    { index: number; installment: number }
  >();

  for (let index = 0; index < transactionLines.length; index += 1) {
    const line = transactionLines[index] ?? "";
    const match = /^(\d{2}\/\d{2})\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const block = [line];
    let nextIndex = index + 1;

    while (
      nextIndex < transactionLines.length &&
      !/^\d{2}\/\d{2}\s+/.test(transactionLines[nextIndex] ?? "")
    ) {
      const nextLine = transactionLines[nextIndex] ?? "";

      if (/^Limite total de crédito/i.test(nextLine)) {
        break;
      }

      block.push(nextLine);
      nextIndex += 1;
    }

    const description = (match[2] ?? "")
      .replace(
        /\s+[−-]?(?:R\$\s*)?\d+(?:\.\d{3})*,\d{2}.*$/,
        ""
      )
      .trim();
    const amount = extractFirstCurrency(match[2] ?? "");
    const date = parseDate(match[1] ?? "", year);

    if (
      !date ||
      !description ||
      amount === undefined ||
      amount <= 0 ||
      /pagamento efetuado|total|saldo financiado/i.test(description)
    ) {
      index = nextIndex - 1;
      continue;
    }

    const parsed = createTransaction(date, description, amount);

    if (
      parsed.installment !== undefined &&
      parsed.installments !== undefined
    ) {
      const baseDescription = normalize(
        description.replace(/\d{1,2}\s*\/\s*\d{1,2}/, "")
      );
      const key = `${baseDescription}:${amount}:${parsed.installments}`;
      const existing = installmentCandidates.get(key);

      if (existing && existing.installment < parsed.installment) {
        index = nextIndex - 1;
        continue;
      }

      installmentCandidates.set(key, {
        index: transactions.length,
        installment: parsed.installment
      });
    }

    transactions.push(parsed);
    index = nextIndex - 1;
  }

  if (start < 0) {
    warnings.push(
      "Início dos lançamentos não identificado; foi feita uma leitura aproximada."
    );
  }

  if (transactions.length === 0) {
    warnings.push("Nenhuma transação foi identificada no PDF Itaú.");
  }

  const parsedTotal = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  if (
    total !== undefined &&
    Math.abs(parsedTotal - total) > Math.max(1, total * 0.02)
  ) {
    warnings.push(
      "A soma extraída do PDF difere do total da fatura; prefira a planilha XLSX para máxima precisão."
    );
  }

  return createStatement("ITAU", transactions, warnings, {
    ...(total === undefined ? {} : { total }),
    ...(minimumPayment === undefined ? {} : { minimumPayment }),
    ...(dueDate === undefined ? {} : { dueDate }),
    ...(dueDate === undefined
      ? {}
      : { referenceMonth: dueDate.slice(0, 7) })
  });
}

export const itau: BankParser = {
  id: "ITAU",
  name: "Itaú",
  detect(text, filename) {
    if (/ita[uú]|personnalite|fatura-fechada/i.test(filename)) {
      return 0.95;
    }

    if (/Banco Ita[uú]|ITAU UNIBANCO|Personnalite/i.test(text)) {
      return 0.9;
    }

    return 0;
  },
  parseSpreadsheet,
  parsePdfText
};
