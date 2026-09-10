import Papa from "papaparse";

import type { RawTransaction } from "../types";
import type {
  BankParser,
  SpreadsheetCell,
  SpreadsheetRow
} from "./types";
import {
  createStatement,
  createTransaction,
  extractLastCurrency,
  getStatementYear,
  parseCurrency,
  parseDate,
  splitLines
} from "./utils";

function normalizeHeader(cell: SpreadsheetCell): string {
  return String(cell ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findHeaderColumn(
  header: SpreadsheetRow,
  candidates: string[]
): number {
  return header.findIndex((cell) =>
    candidates.some((candidate) => normalizeHeader(cell).includes(candidate))
  );
}

function bestColumn(
  rows: SpreadsheetRow[],
  score: (cell: SpreadsheetCell) => number,
  excluded: number[] = []
): number {
  let bestIndex = -1;
  let bestScore = -1;
  const columnCount = Math.max(0, ...rows.map((row) => row.length));

  for (let column = 0; column < columnCount; column += 1) {
    if (excluded.includes(column)) {
      continue;
    }

    const columnScore = rows.reduce(
      (sum, row) => sum + score(row[column] ?? null),
      0
    );

    if (columnScore > bestScore) {
      bestIndex = column;
      bestScore = columnScore;
    }
  }

  return bestIndex;
}

function parseRows(rows: SpreadsheetRow[]) {
  if (rows.length === 0) {
    return createStatement("GENERIC", [], ["O arquivo está vazio."]);
  }

  const header = rows[0] ?? [];
  let dateColumn = findHeaderColumn(header, ["data", "date"]);
  let amountColumn = findHeaderColumn(header, ["valor", "amount", "total"]);
  let descriptionColumn = findHeaderColumn(header, [
    "descricao",
    "lancamento",
    "historico",
    "title",
    "estabelecimento"
  ]);
  const hasRecognizedHeader =
    dateColumn >= 0 || amountColumn >= 0 || descriptionColumn >= 0;
  const dataRows = hasRecognizedHeader ? rows.slice(1) : rows;
  const sample = dataRows.slice(0, 20);

  if (dateColumn < 0) {
    dateColumn = bestColumn(sample, (cell) => {
      if (cell instanceof Date) {
        return 2;
      }

      return typeof cell === "string" && parseDate(cell) ? 1 : 0;
    });
  }

  if (amountColumn < 0) {
    amountColumn = bestColumn(
      sample,
      (cell) =>
        typeof cell === "number" ||
        (typeof cell === "string" && parseCurrency(cell) !== undefined)
          ? 1
          : 0,
      [dateColumn]
    );
  }

  if (descriptionColumn < 0) {
    descriptionColumn = bestColumn(
      sample,
      (cell) =>
        typeof cell === "string" && parseCurrency(cell) === undefined
          ? cell.length
          : 0,
      [dateColumn, amountColumn]
    );
  }

  const warnings: string[] = [
    "Parser genérico utilizado; confira datas, valores e descrições."
  ];
  const transactions: RawTransaction[] = [];

  dataRows.forEach((row, index) => {
    const rawDate = row[dateColumn];
    const rawAmount = row[amountColumn];
    const rawDescription = row[descriptionColumn];
    const date =
      rawDate instanceof Date || typeof rawDate === "string"
        ? parseDate(rawDate)
        : undefined;
    const amount =
      typeof rawAmount === "number" || typeof rawAmount === "string"
        ? parseCurrency(rawAmount)
        : undefined;
    const description = String(rawDescription ?? "").trim();

    if (!date || amount === undefined || amount <= 0 || !description) {
      if (row.some((cell) => cell !== null && cell !== "")) {
        warnings.push(
          `Linha ${index + (hasRecognizedHeader ? 2 : 1)} não reconhecida.`
        );
      }
      return;
    }

    transactions.push(createTransaction(date, description, amount));
  });

  return createStatement("GENERIC", transactions, warnings);
}

function parseCsv(text: string) {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: "greedy"
  });
  const statement = parseRows(result.data);

  statement.warnings.push(
    ...result.errors.map(
      (error) => `Linha ${(error.row ?? 0) + 1}: ${error.message}`
    )
  );

  return statement;
}

function parsePdfText(pages: string[]) {
  const lines = splitLines(pages);
  const year = getStatementYear(lines);
  const rows: SpreadsheetRow[] = [];

  for (const line of lines) {
    const match =
      /^(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const amount = extractLastCurrency(match[2] ?? "");
    const description = (match[2] ?? "")
      .replace(/\s+(?:R\$\s*)?[\d.]+,\d{2}\s*$/, "")
      .trim();
    const date =
      parseDate(match[1] ?? "") ??
      parseDate(match[1] ?? "", year);

    rows.push([date ?? "", description, amount ?? ""]);
  }

  return parseRows([["data", "descrição", "valor"], ...rows]);
}

export const generic: BankParser = {
  id: "GENERIC",
  name: "Genérico",
  detect() {
    return 0.1;
  },
  parseCsv,
  parseSpreadsheet: parseRows,
  parsePdfText
};
