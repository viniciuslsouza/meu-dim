import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ParsedStatementSchema } from "../../schemas";
import { nubank } from "../nubank";

function parseCsv(text: string) {
  if (!nubank.parseCsv) {
    throw new Error("Parser CSV Nubank indisponível.");
  }

  return nubank.parseCsv(text);
}

describe("Nubank CSV", () => {
  const fixture = readFileSync(
    join(__dirname, "..", "__fixtures__", "nubank-sample.csv"),
    "utf8"
  );

  it("converte o fixture em um ParsedStatement válido", () => {
    const statement = parseCsv(fixture);

    expect(ParsedStatementSchema.safeParse(statement).success).toBe(true);
    expect(statement.bank).toBe("NUBANK");
    expect(statement.referenceMonth).toBe("2026-08");
    expect(statement.transactions).toHaveLength(10);
    expect(statement.total).toBeGreaterThan(0);
  });

  it("detecta parcelas no título", () => {
    const statement = parseCsv(fixture);
    const installment = statement.transactions.find(
      ({ description }) => description.includes("01/03")
    );

    expect(installment).toMatchObject({
      installment: 1,
      installments: 3
    });
  });

  it("ignora pagamentos e informa linhas inválidas", () => {
    const statement = parseCsv(
      [
        "date,title,amount",
        '2026-08-01,Compra válida,"10,00"',
        '2026-08-02,Pagamento recebido,"- 10,00"',
        'inválida,Sem data,"20,00"'
      ].join("\n")
    );

    expect(statement.transactions).toHaveLength(1);
    expect(statement.warnings.join(" ")).toContain("pagamento");
    expect(statement.warnings.join(" ")).toContain("inválido");
  });
});
