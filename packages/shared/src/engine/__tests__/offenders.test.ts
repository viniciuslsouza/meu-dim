import type { Category, RawTransaction } from "../../types";
import {
  calcHealthScore,
  detectSubscriptions,
  getInstallmentsForecast,
  getTopOffenders
} from "../offenders";

function transaction(
  overrides: Partial<RawTransaction> = {}
): RawTransaction {
  return {
    date: "2026-09-10",
    description: "Compra",
    merchantKey: "loja",
    amount: 10,
    category: "Outros",
    isRecurring: false,
    ...overrides
  };
}

describe("getTopOffenders", () => {
  it("retorna as cinco maiores categorias em ordem decrescente", () => {
    const categories: Category[] = [
      "Mercado",
      "Delivery",
      "Lazer",
      "Casa",
      "Educação",
      "Viagem",
      "Serviços",
      "Vestuário",
      "Combustível",
      "Outros"
    ];
    const transactions = categories.map((category, index) =>
      transaction({
        category,
        merchantKey: `merchant-${index}`,
        amount: (index + 1) * 10
      })
    );

    const offenders = getTopOffenders(transactions);

    expect(offenders).toHaveLength(5);
    expect(offenders.map(({ category }) => category)).toEqual([
      "Outros",
      "Combustível",
      "Vestuário",
      "Serviços",
      "Viagem"
    ]);
    expect(offenders[0]?.percentage).toBeCloseTo((100 / 550) * 100);
  });

  it("agrega estabelecimentos e limita aos três maiores", () => {
    const offenders = getTopOffenders([
      transaction({ merchantKey: "a", amount: 10 }),
      transaction({ merchantKey: "a", amount: 15 }),
      transaction({ merchantKey: "b", amount: 50 }),
      transaction({ merchantKey: "c", amount: 20 }),
      transaction({ merchantKey: "d", amount: 5 })
    ]);

    expect(offenders[0]?.topMerchants).toEqual([
      { name: "b", amount: 50 },
      { name: "a", amount: 25 },
      { name: "c", amount: 20 }
    ]);
  });

  it("lida com totais zerados e topN negativo", () => {
    expect(
      getTopOffenders([transaction({ amount: 0 })], 1)[0]?.percentage
    ).toBe(0);
    expect(getTopOffenders([transaction()], -1)).toEqual([]);
  });
});

describe("detectSubscriptions", () => {
  it("detecta serviços conhecidos mesmo com apenas um mês", () => {
    expect(
      detectSubscriptions([
        transaction({
          merchantKey: "netflix",
          amount: 39.9,
          category: "Assinaturas/Streaming"
        })
      ])
    ).toEqual([
      {
        merchantKey: "netflix",
        displayName: "netflix",
        amount: 39.9,
        isRecurring: true
      }
    ]);
  });

  it("detecta valores estáveis em meses diferentes e ignora variações altas", () => {
    const current = [
      transaction({ merchantKey: "academia bairro", amount: 110 }),
      transaction({ merchantKey: "loja eventual", amount: 200 })
    ];
    const previous = [
      transaction({ merchantKey: "academia bairro", amount: 100 }),
      transaction({ merchantKey: "loja eventual", amount: 100 })
    ];

    expect(detectSubscriptions(current, [previous, current])).toEqual([
      {
        merchantKey: "academia bairro",
        displayName: "academia bairro",
        amount: 110,
        isRecurring: true
      }
    ]);
  });

  it("soma cobranças do mesmo estabelecimento no mês atual", () => {
    const current = [
      transaction({ merchantKey: "clube local", amount: 40 }),
      transaction({ merchantKey: "clube local", amount: 60 })
    ];
    const previous = [
      transaction({ merchantKey: "clube local", amount: 100 })
    ];

    expect(detectSubscriptions(current, [previous, current])[0]?.amount).toBe(
      100
    );
  });
});

describe("getInstallmentsForecast", () => {
  it("projeta parcelas restantes pelos próximos doze meses", () => {
    const forecast = getInstallmentsForecast(
      [
        transaction({ amount: 10.1, installment: 1, installments: 3 }),
        transaction({ amount: 5, installment: 11, installments: 24 }),
        transaction({ amount: 99 }),
        transaction({ amount: 50, installment: 3, installments: 3 })
      ],
      "2026-11"
    );

    expect(forecast).toHaveLength(12);
    expect(forecast[0]).toEqual({ month: "2026-12", total: 15.1 });
    expect(forecast[1]).toEqual({ month: "2027-01", total: 15.1 });
    expect(forecast[2]).toEqual({ month: "2027-02", total: 5 });
    expect(forecast[11]).toEqual({ month: "2027-11", total: 5 });
  });

  it("rejeita mês-base fora do formato ou intervalo válido", () => {
    expect(() => getInstallmentsForecast([], "setembro")).toThrow(RangeError);
    expect(() => getInstallmentsForecast([], "2026-13")).toThrow(RangeError);
  });
});

describe("calcHealthScore", () => {
  it("fica abaixo de 50 com juros altos", () => {
    const result = calcHealthScore({
      total: 1000,
      income: 1000,
      totalInterest: 250,
      totalInstallments: 600,
      totalEvitable: 500
    });

    expect(result.score).toBeLessThan(50);
    expect(result.label).toBe("critico");
  });

  it("fica acima de 75 sem juros e com renda confortável", () => {
    const result = calcHealthScore({
      total: 1000,
      income: 10000,
      totalInterest: 0,
      totalInstallments: 0,
      totalEvitable: 50
    });

    expect(result.score).toBeGreaterThan(75);
    expect(result.label).toBe("otimo");
  });

  it.each([
    {
      expected: "alerta",
      params: {
        total: 1000,
        income: 1000,
        totalInterest: 100,
        totalInstallments: 250,
        totalEvitable: 100
      }
    },
    {
      expected: "atencao",
      params: {
        total: 1000,
        income: 2000,
        totalInterest: 100,
        totalInstallments: 0,
        totalEvitable: 250
      }
    },
    {
      expected: "bom",
      params: {
        total: 1000,
        income: 2000,
        totalInterest: 0,
        totalInstallments: 250,
        totalEvitable: 100
      }
    }
  ])("retorna o label $expected", ({ expected, params }) => {
    expect(calcHealthScore(params).label).toBe(expected);
  });

  it("usa pontuação neutra sem renda e aceita total zero", () => {
    expect(
      calcHealthScore({
        total: 1000,
        totalInterest: 0,
        totalInstallments: 0,
        totalEvitable: 0
      })
    ).toEqual({ score: 83, label: "otimo" });

    expect(
      calcHealthScore({
        total: 0,
        income: 0,
        totalInterest: 0,
        totalInstallments: 0,
        totalEvitable: 0
      })
    ).toEqual({ score: 83, label: "otimo" });
  });
});
