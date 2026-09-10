import Papa from "papaparse";

import type { RawTransaction } from "../types";
import type { BankParser } from "./types";
import {
  createStatement,
  createTransaction,
  extractLastCurrency,
  parseCurrency,
  parseDate,
  splitLines
} from "./utils";

type InterCsvRow = Record<string, string | undefined>;

function findValue(
  row: InterCsvRow,
  candidates: string[]
): string | undefined {
  for (const [header, value] of Object.entries(row)) {
    const normalized = header
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

    if (candidates.includes(normalized)) {
      return value;
    }
  }

  return undefined;
}

function parseCsv(text: string) {
  const delimiter =
    (text.split("\n", 1)[0]?.match(/;/g)?.length ?? 0) >
    (text.split("\n", 1)[0]?.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const result = Papa.parse<InterCsvRow>(text, {
    delimiter,
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim()
  });
  const warnings = result.errors.map(
    (error) => `Linha ${(error.row ?? 0) + 2}: ${error.message}`
  );
  const transactions: RawTransaction[] = [];
  let ignoredCredits = 0;

  result.data.forEach((row, index) => {
    const rawDate = findValue(row, ["data", "date"]);
    const description = findValue(row, [
      "lancamento",
      "descricao",
      "description"
    ])?.trim();
    const type = findValue(row, ["tipo", "type"]) ?? "";
    const rawAmount = findValue(row, ["valor", "amount"]);
    const date = rawDate ? parseDate(rawDate) : undefined;
    const amount =
      rawAmount === undefined ? undefined : parseCurrency(rawAmount);

    if (/cr[eé]dito|pagamento/i.test(type)) {
      ignoredCredits += 1;
      return;
    }

    if (!date || !description || amount === undefined || amount <= 0) {
      warnings.push(`Linha ${index + 2}: lançamento inválido ignorado.`);
      return;
    }

    transactions.push(createTransaction(date, description, amount));
  });

  if (ignoredCredits > 0) {
    warnings.push(
      `${ignoredCredits} crédito(s) ou pagamento(s) foram ignorados.`
    );
  }

  return createStatement("INTER", transactions, warnings);
}

function parsePdfText(pages: string[]) {
  const lines = splitLines(pages);
  const transactions: RawTransaction[] = [];
  const warnings: string[] = [];

  for (const line of lines) {
    const match = /^(\d{2}\/\d{2}\/\d{4})\s+(.+)$/.exec(line);

    if (!match || /cr[eé]dito|pagamento/i.test(match[2] ?? "")) {
      continue;
    }

    const date = parseDate(match[1] ?? "");
    const amount = extractLastCurrency(match[2] ?? "");
    const description = (match[2] ?? "")
      .replace(/\s+(?:R\$\s*)?[\d.]+,\d{2}\s*$/, "")
      .trim();

    if (date && amount !== undefined && amount > 0 && description) {
      transactions.push(createTransaction(date, description, amount));
    }
  }

  if (transactions.length === 0) {
    warnings.push(
      "Nenhuma transação foi identificada; o layout do PDF Inter pode ter mudado."
    );
  }

  return createStatement("INTER", transactions, warnings);
}

export const inter: BankParser = {
  id: "INTER",
  name: "Banco Inter",
  detect(text, filename) {
    if (/(?:^|[^a-z])inter(?:[^a-z]|$)/i.test(filename)) {
      return 0.95;
    }

    if (/Banco Inter|inter\.csv|Lan[çc]amento/i.test(text)) {
      return 0.85;
    }

    return 0;
  },
  parseCsv,
  parsePdfText
};
