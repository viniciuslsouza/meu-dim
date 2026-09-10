import type { BankId, ParsedStatement } from "../types";

export type SpreadsheetCell = string | number | boolean | Date | null;
export type SpreadsheetRow = SpreadsheetCell[];

export interface BankParser {
  id: BankId;
  name: string;
  detect(text: string, filename: string): number;
  parseCsv?(text: string): ParsedStatement;
  parseSpreadsheet?(rows: SpreadsheetRow[]): ParsedStatement;
  parsePdfText?(pages: string[]): ParsedStatement;
}

export interface ParseStatementOptions {
  extractPdfText?: (file: File) => Promise<string[]>;
}
