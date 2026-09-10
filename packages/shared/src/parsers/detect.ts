import { readSheet } from "read-excel-file/browser";

import type { ParsedStatement } from "../types";
import { bradesco } from "./bradesco";
import { generic } from "./generic";
import { inter } from "./inter";
import { itau } from "./itau";
import { nubank } from "./nubank";
import type {
  BankParser,
  ParseStatementOptions,
  SpreadsheetRow
} from "./types";

export const parsers: BankParser[] = [
  nubank,
  inter,
  itau,
  bradesco,
  generic
];

export function detectBank(text: string, filename: string): BankParser {
  let best: BankParser = generic;
  let bestScore = 0;

  for (const parser of parsers) {
    const score = parser.detect(text, filename);

    if (score > bestScore) {
      bestScore = score;
      best = parser;
    }
  }

  return best;
}

export function parsePdfPages(
  pages: string[],
  filename: string
): ParsedStatement {
  const parser = detectBank(pages.join("\n"), filename);
  const parse = parser.parsePdfText ?? generic.parsePdfText;

  if (!parse) {
    throw new Error("Nenhum parser de PDF está disponível.");
  }

  return parse(pages);
}

export function parseSpreadsheetRows(
  rows: SpreadsheetRow[],
  filename: string
): ParsedStatement {
  const parser = detectBank("", filename);
  const parse = parser.parseSpreadsheet ?? generic.parseSpreadsheet;

  if (!parse) {
    throw new Error("Nenhum parser de planilha está disponível.");
  }

  return parse(rows);
}

export async function parseStatement(
  file: File,
  options: ParseStatementOptions = {}
): Promise<ParsedStatement> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith(".csv")) {
    const text = await file.text();
    const parser = detectBank(text, file.name);
    const parse = parser.parseCsv ?? generic.parseCsv;

    if (!parse) {
      throw new Error("Nenhum parser CSV está disponível.");
    }

    return parse(text);
  }

  if (filename.endsWith(".xlsx")) {
    const rows = (await readSheet(file)) as SpreadsheetRow[];

    return parseSpreadsheetRows(rows, file.name);
  }

  if (filename.endsWith(".pdf")) {
    if (!options.extractPdfText) {
      throw new Error(
        "O extrator PDF do navegador não foi configurado."
      );
    }

    return parsePdfPages(await options.extractPdfText(file), file.name);
  }

  throw new Error(
    "Formato não suportado. Use arquivos CSV, XLSX ou PDF."
  );
}
