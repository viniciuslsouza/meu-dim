import type { RawTransaction } from "../types";
import type { BankParser } from "./types";
import {
  createStatement,
  createTransaction,
  extractInstallment,
  extractLastCurrency,
  getStatementYear,
  parseDate,
  splitLines
} from "./utils";

function parsePdfText(pages: string[]) {
  const lines = splitLines(pages);
  const text = lines.join(" ");
  const year = getStatementYear(lines);
  const total = extractLastCurrency(
    /Total de fatura\s+R\$\s*[\d.,]+/i.exec(text)?.[0] ??
      /Total da fatura em real\s+[\d.,]+/i.exec(text)?.[0] ??
      ""
  );
  const minimumPayment = extractLastCurrency(
    /Pagamento mínimo\s+R\$\s*[\d.,]+/i.exec(text)?.[0] ?? ""
  );
  const dueMatch =
    /Vencimento\s*:?\s*(\d{2}\/\d{2}\/20\d{2})/i.exec(text);
  const dueDate = dueMatch ? parseDate(dueMatch[1] ?? "") : undefined;
  const start = lines.findIndex((line) =>
    /^Data Histórico de Lançamentos/i.test(line)
  );
  const transactionLines = start >= 0 ? lines.slice(start + 1) : lines;
  const transactions: RawTransaction[] = [];
  const warnings: string[] = [];

  for (let index = 0; index < transactionLines.length; index += 1) {
    const line = transactionLines[index] ?? "";

    if (/^Total para /i.test(line)) {
      break;
    }

    const match = /^(\d{2}\/\d{2})\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const block = [line];
    let nextIndex = index + 1;

    while (
      nextIndex < transactionLines.length &&
      !/^\d{2}\/\d{2}\s+/.test(transactionLines[nextIndex] ?? "") &&
      !/^Total para /i.test(transactionLines[nextIndex] ?? "")
    ) {
      block.push(transactionLines[nextIndex] ?? "");
      nextIndex += 1;
    }

    const description = (match[2] ?? "")
      .replace(/\s+(?:R\$\s*)?[\d.]+,\d{2}(?:\s+-)?\s*$/, "")
      .trim();
    const amount = extractLastCurrency(block.join(" "));
    const date = parseDate(match[1] ?? "", year);

    if (
      !date ||
      !description ||
      amount === undefined ||
      amount <= 0 ||
      /pag(?:amento)?\s+boleto|cr[eé]dito/i.test(description)
    ) {
      index = nextIndex - 1;
      continue;
    }

    const parsed = createTransaction(date, description, amount);
    const installment = extractInstallment(
      block.join(" ").replace(/^\d{2}\/\d{2}\s+/, "")
    );

    transactions.push({ ...parsed, ...installment });
    index = nextIndex - 1;
  }

  if (start < 0) {
    warnings.push(
      "Tabela de lançamentos não identificada; foi feita uma leitura aproximada."
    );
  }

  if (transactions.length === 0) {
    warnings.push("Nenhuma transação foi identificada no PDF Bradesco.");
  }

  return createStatement("BRADESCO", transactions, warnings, {
    ...(total === undefined ? {} : { total }),
    ...(minimumPayment === undefined ? {} : { minimumPayment }),
    ...(dueDate === undefined ? {} : { dueDate }),
    ...(dueDate === undefined
      ? {}
      : { referenceMonth: dueDate.slice(0, 7) })
  });
}

export const bradesco: BankParser = {
  id: "BRADESCO",
  name: "Bradesco",
  detect(text, filename) {
    if (/bradesco/i.test(filename)) {
      return 0.95;
    }

    if (/Banco Bradesco|Bradesco Cart[oõ]es/i.test(text)) {
      return 0.9;
    }

    return 0;
  },
  parsePdfText
};
