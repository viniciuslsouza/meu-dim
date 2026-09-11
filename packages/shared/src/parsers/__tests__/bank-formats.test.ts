import { bradesco } from "../bradesco";
import { itau } from "../itau";
import { nubank } from "../nubank";
import type { SpreadsheetRow } from "../types";

function requirePdfParser(
  parser: typeof nubank | typeof bradesco | typeof itau
) {
  if (!parser.parsePdfText) {
    throw new Error(`Parser PDF ${parser.name} indisponível.`);
  }

  return parser.parsePdfText;
}

describe("Nubank PDF", () => {
  it("extrai metadados, compras e parcelas", () => {
    const statement = requirePdfParser(nubank)([
      [
        "Esta é a sua fatura de setembro, no valor de R$ 495,17",
        "Data de vencimento: 14 SET 2026",
        "Pagamento mínimo de R$ 100,00",
        "TRANSAÇÕES DE 07 AGO A 07 SET",
        "17 AGO NETFLIX.COM R$ 47,90",
        "24 AGO Pagamento em 24 AGO −R$ 100,00",
        "07 AGO LOJA EXEMPLO - Parcela 2/3",
        "R$ 50,00"
      ].join("\n")
    ]);

    expect(statement).toMatchObject({
      bank: "NUBANK",
      referenceMonth: "2026-09",
      total: 495.17,
      minimumPayment: 100,
      dueDate: "2026-09-14"
    });
    expect(statement.transactions).toHaveLength(2);
    expect(statement.transactions[1]).toMatchObject({
      amount: 50,
      installment: 2,
      installments: 3
    });
  });
});

describe("Itaú XLSX", () => {
  it("interpreta a estrutura observada na planilha Personnalité", () => {
    const rows: SpreadsheetRow[] = [
      [null, "Fatura Fechada - Setembro/2026"],
      [
        null,
        "Cartão",
        null,
        null,
        null,
        null,
        "Valor",
        null,
        "Vencimento"
      ],
      [
        null,
        "Personnalite Platinum",
        null,
        null,
        null,
        null,
        9249.4,
        null,
        new Date("2026-09-10T00:00:00.000Z")
      ],
      [
        null,
        "Data",
        "Lançamento",
        "Parcelamento",
        "Valor",
        null,
        "Titularidade"
      ],
      [
        null,
        new Date("2026-08-10T00:00:00.000Z"),
        "Pagamento Efetuado",
        null,
        -1000
      ],
      [
        null,
        new Date("2026-08-24T00:00:00.000Z"),
        "Mercado Exemplo",
        "Parcela 1 de 2",
        37.24
      ]
    ];

    if (!itau.parseSpreadsheet) {
      throw new Error("Parser XLSX Itaú indisponível.");
    }

    const statement = itau.parseSpreadsheet(rows);

    expect(statement).toMatchObject({
      bank: "ITAU",
      referenceMonth: "2026-09",
      total: 9249.4,
      dueDate: "2026-09-10"
    });
    expect(statement.transactions).toHaveLength(1);
    expect(statement.transactions[0]).toMatchObject({
      amount: 37.24,
      installment: 1,
      installments: 2
    });
  });
});

describe("Itaú PDF", () => {
  it("interpreta lançamentos em texto extraído", () => {
    const statement = requirePdfParser(itau)([
      [
        "Banco Itaú",
        "Total desta fatura 9.249,40",
        "Pagamento mínimo: R$ 924,94",
        "Vencimento: 10/09/2026",
        "Continua...",
        "02/01 MERCADO*MERCADOLIV 09/12 123,09",
        "04/08 NETFLIX.COM 59,90",
        "Limite total de crédito"
      ].join("\n")
    ]);

    expect(statement).toMatchObject({
      bank: "ITAU",
      total: 9249.4,
      minimumPayment: 924.94,
      dueDate: "2026-09-10"
    });
    expect(statement.transactions).toHaveLength(2);
    expect(statement.transactions[0]).toMatchObject({
      installment: 9,
      installments: 12
    });
  });
});

describe("Bradesco PDF", () => {
  it("reconstrói valores quebrados em mais de uma linha", () => {
    const statement = requirePdfParser(bradesco)([
      [
        "Banco Bradesco S/A",
        "Total de fatura R$ 2.332,29",
        "Pagamento mínimo R$ 397,91",
        "Vencimento 11/09/2026",
        "Data Histórico de Lançamentos Cidade US$ Cotação do Dólar R$",
        "10/08 PAG BOLETO BANCARIO 2.136,85 -",
        "04/06 BRS*SHEINCOM 03/03 Sao Paulo 84,19",
        "20/08 CENTAURO COM BR 01/02 PRESIDENTE",
        "PR",
        "100,00",
        "Total para CLIENTE 184,19"
      ].join("\n")
    ]);

    expect(statement).toMatchObject({
      bank: "BRADESCO",
      referenceMonth: "2026-09",
      total: 2332.29,
      minimumPayment: 397.91,
      dueDate: "2026-09-11"
    });
    expect(statement.transactions).toHaveLength(2);
    expect(statement.transactions[1]).toMatchObject({
      amount: 100,
      installment: 1,
      installments: 2
    });
  });

  it("ignora limites e taxas misturados na coluna de lançamentos", () => {
    const statement = requirePdfParser(bradesco)([
      [
        "Banco Bradesco S/A",
        "Total da fatura em real 2.332,29",
        "Pagamento mínimo R$ 397,91",
        "Vencimento 11/09/2026",
        "Data Histórico de Lançamentos Cidade US$ Cotação do Dólar R$",
        "10/08 PAG BOLETO BANCARIO 2.136,85 -",
        "28/08 CUSTO TRANS. EXTERIOR-IOF 11,26",
        "VINICIUS SOUZA Cartão 4004 XXXX XXXX 9548",
        "Compras R$ 7.500,00 R$ 2.921,98 R$ 4.578,02",
        "04/06 BRS*SHEINCOM 03/03 Sao Paulo 84,19",
        "04/07 ZP *ABBA JOIAS 02/02 Guarulhos 170,37 Saque R$ 3.000,00 R$ 0,00 R$ 3.000,00",
        "02/08 99Food *Jet Pizzas Guarul Sao Paulo 134,82",
        "Taxas mensais",
        "06/08 APPLE.COM/BILL SAO PAULO 5,90 Taxa ao Taxa ao CET Taxas Máx. p/",
        "Mês (%) Ano (%) (Ano) Próx. Período",
        "07/08 CURSOR, AI POWERED IDE USD 60,00 CURSOR.COM 60,00 5,3600 321,60",
        "Pagamento de Contas 1,99% 26,67% 55,72% 2,99%",
        "20/08 CENTAURO COM BR 01/02 PRESIDENTE 100,00 Crediário 4,99% 79,38% 85,94% 6,99%",
        "Total para VINICIUS SOUZA 2.321,03"
      ].join("\n")
    ]);

    expect(statement.total).toBe(2332.29);
    expect(statement.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.stringContaining("CUSTO TRANS. EXTERIOR-IOF"),
          amount: 11.26
        }),
        expect.objectContaining({
          description: expect.stringContaining("ABBA JOIAS"),
          amount: 170.37
        }),
        expect.objectContaining({
          description: expect.stringContaining("APPLE.COM/BILL"),
          amount: 5.9
        }),
        expect.objectContaining({
          description: expect.stringContaining("CURSOR"),
          amount: 321.6
        }),
        expect.objectContaining({
          description: expect.stringContaining("CENTAURO"),
          amount: 100
        })
      ])
    );
    expect(
      statement.transactions.some((transaction) => transaction.amount === 4578.02)
    ).toBe(false);
    expect(
      statement.transactions.some((transaction) => transaction.amount === 3000)
    ).toBe(false);
  });
});
