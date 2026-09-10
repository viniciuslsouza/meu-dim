import Papa from "papaparse";

import type { RawTransaction } from "../types";
import type { BankParser } from "./types";
import {
  createStatement,
  createTransaction,
  extractLastCurrency,
  getStatementYear,
  parseCurrency,
  parseDate,
  splitLines
} from "./utils";

interface NubankCsvRow {
  date?: string;
  title?: string;
  amount?: string;
}

const MONTH_NUMBER: Record<string, number> = {
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

function parseCsv(text: string) {
  const result = Papa.parse<NubankCsvRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) =>
      header.replace(/^\uFEFF/, "").trim().toLowerCase()
  });
  const warnings = result.errors.map(
    (error) => `Linha ${(error.row ?? 0) + 2}: ${error.message}`
  );
  const transactions: RawTransaction[] = [];
  let ignoredCredits = 0;

  result.data.forEach((row, index) => {
    const date = row.date ? parseDate(row.date) : undefined;
    const description = row.title?.trim();
    const amount =
      row.amount === undefined ? undefined : parseCurrency(row.amount);

    if (!date || !description || amount === undefined) {
      warnings.push(`Linha ${index + 2}: lançamento inválido ignorado.`);
      return;
    }

    if (amount <= 0) {
      ignoredCredits += 1;
      return;
    }

    transactions.push(createTransaction(date, description, amount));
  });

  if (ignoredCredits > 0) {
    warnings.push(
      `${ignoredCredits} crédito(s) ou pagamento(s) foram ignorados.`
    );
  }

  return createStatement("NUBANK", transactions, warnings);
}

function getMetadata(lines: string[]) {
  const text = lines.join(" ");
  const total = extractLastCurrency(
    /fatura[^.]{0,100}?valor de\s+(R\$\s*[\d.,]+)/i.exec(text)?.[1] ??
      /total a pagar\s+(R\$\s*[\d.,]+)/i.exec(text)?.[1] ??
      ""
  );
  const minimumPayment = extractLastCurrency(
    /pagamento mínimo(?: de)?\s+(R\$\s*[\d.,]+)/i.exec(text)?.[1] ?? ""
  );
  const dueMatch =
    /data de vencimento:\s*(\d{1,2})\s+([A-ZÇ]{3})\s+(20\d{2})/i.exec(
      text
    );
  const dueDate = dueMatch
    ? parseDate(
        `${dueMatch[1]} ${dueMatch[2]}`,
        Number(dueMatch[3])
      )
    : undefined;

  return {
    ...(total === undefined ? {} : { total }),
    ...(minimumPayment === undefined ? {} : { minimumPayment }),
    ...(dueDate === undefined ? {} : { dueDate }),
    ...(dueDate === undefined
      ? {}
      : { referenceMonth: dueDate.slice(0, 7) })
  };
}

function parsePdfText(pages: string[]) {
  const lines = splitLines(pages);
  const warnings: string[] = [];
  const metadata = getMetadata(lines);
  const statementYear = getStatementYear(lines);
  const referenceMonth = Number(metadata.referenceMonth?.slice(5, 7));
  const sectionStart = lines.findIndex((line) =>
    line.startsWith("TRANSAÇÕES DE")
  );
  const transactionLines =
    sectionStart >= 0 ? lines.slice(sectionStart + 1) : lines;
  const transactions: RawTransaction[] = [];

  for (let index = 0; index < transactionLines.length; index += 1) {
    const line = transactionLines[index] ?? "";
    const match =
      /^(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(.+)$/i.exec(
        line
      );

    if (!match) {
      continue;
    }

    const block = [line];
    let nextIndex = index + 1;

    while (
      nextIndex < transactionLines.length &&
      !/^\d{1,2}\s+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+/i.test(
        transactionLines[nextIndex] ?? ""
      )
    ) {
      const nextLine = transactionLines[nextIndex] ?? "";

      if (/^(?:Em cumprimento|Como assegurado)/i.test(nextLine)) {
        break;
      }

      block.push(nextLine);
      nextIndex += 1;
    }

    const transactionMonth = MONTH_NUMBER[match[2]?.toUpperCase() ?? ""];
    const year =
      transactionMonth !== undefined &&
      Number.isFinite(referenceMonth) &&
      transactionMonth > referenceMonth
        ? statementYear - 1
        : statementYear;
    const date = parseDate(`${match[1]} ${match[2]}`, year);
    const amount = extractLastCurrency(block.join(" "));
    const description = (match[3] ?? "")
      .replace(/\s+[−-]?R\$\s*[\d.,]+\s*$/, "")
      .trim();

    if (
      !date ||
      amount === undefined ||
      amount <= 0 ||
      /pagamento|crédito|credito|encerramento de dívida/i.test(description)
    ) {
      index = nextIndex - 1;
      continue;
    }

    transactions.push(createTransaction(date, description, amount));
    index = nextIndex - 1;
  }

  if (sectionStart < 0) {
    warnings.push(
      "Seção de transações não identificada; foi feita uma leitura aproximada."
    );
  }

  if (transactions.length === 0) {
    warnings.push("Nenhuma transação de compra foi identificada no PDF.");
  }

  return createStatement("NUBANK", transactions, warnings, metadata);
}

export const nubank: BankParser = {
  id: "NUBANK",
  name: "Nubank",
  detect(text, filename) {
    if (/nubank/i.test(filename)) {
      return 0.95;
    }

    if (/^\uFEFF?date\s*,\s*title\s*,\s*amount/i.test(text.trimStart())) {
      return 0.85;
    }

    if (/Nu Pagamentos|Esta é a sua fatura/i.test(text)) {
      return 0.85;
    }

    return 0;
  },
  parseCsv,
  parsePdfText
};
