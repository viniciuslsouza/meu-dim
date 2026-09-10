import {
  parseSpreadsheetRows,
  parseStatement
} from "../detect";
import { generic } from "../generic";

describe("parser genérico", () => {
  it("identifica colunas por nomes conhecidos", () => {
    if (!generic.parseCsv) {
      throw new Error("Parser CSV genérico indisponível.");
    }

    const statement = generic.parseCsv(
      [
        "quando,historico,preco",
        "01/08/2026,Loja genérica,\"R$ 10,50\"",
        "02/08/2026,Crédito,\"-5,00\""
      ].join("\n")
    );

    expect(statement.bank).toBe("GENERIC");
    expect(statement.transactions).toHaveLength(1);
    expect(statement.transactions[0]?.amount).toBe(10.5);
    expect(statement.warnings[0]).toContain("genérico");
  });

  it("identifica colunas sem cabeçalho", () => {
    const statement = parseSpreadsheetRows(
      [
        ["01/08/2026", "Mercado do bairro", 25],
        ["02/08/2026", "Farmácia central", 30]
      ],
      "desconhecido.xlsx"
    );

    expect(statement.transactions).toHaveLength(2);
    expect(statement.referenceMonth).toBe("2026-08");
  });
});

describe("parseStatement", () => {
  it("lê CSV diretamente de um File do navegador", async () => {
    const file = new File(
      ["date,title,amount\n2026-08-01,IFOOD,\"15,00\""],
      "fatura-nubank.csv",
      { type: "text/csv" }
    );

    await expect(parseStatement(file)).resolves.toMatchObject({
      bank: "NUBANK",
      total: 15
    });
  });

  it("usa o extrator injetado para arquivos PDF", async () => {
    const file = new File(["pdf"], "fatura-nubank.pdf", {
      type: "application/pdf"
    });

    const statement = await parseStatement(file, {
      extractPdfText: async () => [
        [
          "Esta é a sua fatura de setembro, no valor de R$ 20,00",
          "Data de vencimento: 14 SET 2026",
          "TRANSAÇÕES DE 01 AGO A 01 SET",
          "01 SET IFOOD R$ 20,00"
        ].join("\n")
      ]
    });

    expect(statement.bank).toBe("NUBANK");
    expect(statement.transactions).toHaveLength(1);
  });

  it("rejeita PDF sem extrator e extensões desconhecidas", async () => {
    await expect(
      parseStatement(new File(["pdf"], "fatura.pdf"))
    ).rejects.toThrow("extrator PDF");
    await expect(
      parseStatement(new File(["texto"], "fatura.txt"))
    ).rejects.toThrow("Formato não suportado");
  });
});
