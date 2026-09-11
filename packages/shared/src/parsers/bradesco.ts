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

const SIDEBAR_CUTOFF =
  /\s+(?:Saque|Taxa ao|Compras Parceladas|Crediário|com Juros|Parcelamento Fatura|Rotativo|Pagamento de Contas)\b.*$/i;

const NOISE_LINE =
  /^(?:Compras\s+R\$|Saque\s+R\$|Taxas mensais|Pagamento de Contas|Parcelamento Fatura|Rotativo|Total Utilizado|Limites|Cotação|Novo teto|Valor em R\$|Crédito Rotativo|\*\s*Sobre as operações|e IOF Adicional|Válido para o vencimento|Mês\s*\(%\)|Total parcelados|Total para as próximas)/i;

const CARDHOLDER_LINE = /Cartão\s+\d{4}/i;
const RATE_TABLE_LINE = /^\d+,\d{2}%|\bCET\b|\bMáx\.?\s*p\//i;

function stripBradescoNoise(line: string): string {
  return line
    .replace(SIDEBAR_CUTOFF, "")
    .replace(/\s+\d+,\d{2}%.*$/i, "")
    .trim();
}

function isBradescoNoiseLine(line: string): boolean {
  // Linhas de lançamento (começam com data) podem ter a sidebar misturada;
  // limpeza via stripBradescoNoise, não descarte.
  if (/^\d{2}\/\d{2}\s+/.test(line)) {
    return false;
  }

  return (
    NOISE_LINE.test(line) ||
    CARDHOLDER_LINE.test(line) ||
    RATE_TABLE_LINE.test(line) ||
    /^PR\s+(?:Rotativo|Saque)/i.test(line)
  );
}

function isContinuationLine(line: string): boolean {
  if (isBradescoNoiseLine(line)) {
    return false;
  }

  if (/^(?:R\$\s*)?[\d.]+,\d{2}(?:\s+-)?$/.test(line)) {
    return true;
  }

  if (/^[A-Z]{2}$/.test(line)) {
    return true;
  }

  return false;
}

function extractBradescoAmount(text: string): number | undefined {
  const cleaned = stripBradescoNoise(text)
    // Cotação do dólar (4 casas) não é valor da compra.
    .replace(/\b\d+,\d{3,}\b/g, " ");

  return extractLastCurrency(cleaned);
}

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
    /Pagamento mínimo\s+R\$\s*[\d.,]+/i.exec(text)?.[0] ??
      /Pagamento mínimo[\s\S]{0,80}?R\$\s*[\d.,]+/i.exec(text)?.[0] ??
      ""
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
    const rawLine = transactionLines[index] ?? "";

    if (/^Total para /i.test(rawLine) || /^Total da fatura em real/i.test(rawLine)) {
      break;
    }

    if (isBradescoNoiseLine(rawLine)) {
      continue;
    }

    const line = stripBradescoNoise(rawLine);
    const match = /^(\d{2}\/\d{2})\s+(.+)$/.exec(line);

    if (!match) {
      continue;
    }

    const block = [line];
    let nextIndex = index + 1;

    while (nextIndex < transactionLines.length) {
      const nextRaw = transactionLines[nextIndex] ?? "";

      if (
        /^\d{2}\/\d{2}\s+/.test(nextRaw) ||
        /^Total para /i.test(nextRaw) ||
        /^Total da fatura em real/i.test(nextRaw)
      ) {
        break;
      }

      if (isBradescoNoiseLine(nextRaw)) {
        nextIndex += 1;
        continue;
      }

      if (!isContinuationLine(nextRaw) && extractBradescoAmount(line) !== undefined) {
        break;
      }

      if (!isContinuationLine(nextRaw)) {
        break;
      }

      block.push(stripBradescoNoise(nextRaw));
      nextIndex += 1;
    }

    const blockText = block.join(" ");
    const description = (match[2] ?? "")
      .replace(/\s+(?:R\$\s*)?[\d.]+,\d{2}(?:\s+-)?\s*$/, "")
      .replace(/\s+USD\s+[\d.,]+/i, "")
      .replace(/\s+\d+,\d{3,}\b/g, "")
      .trim();
    const amount = extractBradescoAmount(blockText);
    const date = parseDate(match[1] ?? "", year);

    if (
      !date ||
      !description ||
      amount === undefined ||
      amount <= 0 ||
      /pag(?:amento)?\s+boleto|cr[eé]dito/i.test(description)
    ) {
      index = Math.max(index, nextIndex - 1);
      continue;
    }

    const parsed = createTransaction(date, description, amount);
    const installment = extractInstallment(
      blockText.replace(/^\d{2}\/\d{2}\s+/, "")
    );

    transactions.push({ ...parsed, ...installment });
    index = Math.max(index, nextIndex - 1);
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
