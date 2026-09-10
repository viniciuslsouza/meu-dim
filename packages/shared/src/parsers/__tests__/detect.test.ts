import { readFileSync } from "node:fs";
import { join } from "node:path";

import { detectBank, parsePdfPages } from "../detect";
import { inter } from "../inter";

describe("detectBank", () => {
  it.each([
    ["date,title,amount\n...", "fatura-nubank.csv", "NUBANK"],
    ["...", "inter-cartao.csv", "INTER"],
    ["Banco Itaú", "fatura-personalite.pdf", "ITAU"],
    ["Banco Bradesco", "cartao.pdf", "BRADESCO"],
    ["...", "desconhecido.csv", "GENERIC"]
  ])("detecta %s em %s", (text, filename, expected) => {
    expect(detectBank(text, filename).id).toBe(expected);
  });

  it("detecta bancos pelo conteúdo sem depender do nome", () => {
    expect(detectBank("Esta é a sua fatura Nu Pagamentos", "fatura.pdf").id)
      .toBe("NUBANK");
    expect(detectBank("Banco Inter Lançamento", "fatura.csv").id).toBe(
      "INTER"
    );
    expect(detectBank("ITAU UNIBANCO", "fatura.pdf").id).toBe("ITAU");
    expect(detectBank("Banco Bradesco S/A", "fatura.pdf").id).toBe(
      "BRADESCO"
    );
  });
});

describe("Inter CSV", () => {
  it("interpreta ponto-e-vírgula, moeda brasileira e créditos", () => {
    const fixture = readFileSync(
      join(__dirname, "..", "__fixtures__", "inter-sample.csv"),
      "utf8"
    );

    if (!inter.parseCsv) {
      throw new Error("Parser CSV Inter indisponível.");
    }

    const statement = inter.parseCsv(fixture);

    expect(statement.bank).toBe("INTER");
    expect(statement.referenceMonth).toBe("2026-08");
    expect(statement.transactions).toHaveLength(9);
    expect(statement.transactions[0]?.amount).toBe(150);
    expect(statement.warnings.join(" ")).toContain("crédito");
  });
});

describe("parsePdfPages", () => {
  it("encaminha as páginas ao parser detectado", () => {
    const statement = parsePdfPages(
      [
        [
          "Banco Inter",
          "01/08/2026 IFOOD RESTAURANTE R$ 50,00",
          "02/08/2026 Pagamento da fatura R$ 50,00"
        ].join("\n")
      ],
      "inter.pdf"
    );

    expect(statement.bank).toBe("INTER");
    expect(statement.transactions).toHaveLength(1);
  });
});
