"use client";

import {
  parseStatement as parseSharedStatement,
  type ParsedStatement
} from "@meudim/shared";

import { extractPdfText } from "./pdf-text";

export function parseStatement(file: File): Promise<ParsedStatement> {
  return parseSharedStatement(file, { extractPdfText });
}
