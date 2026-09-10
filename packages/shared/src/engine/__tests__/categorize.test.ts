import type { Category } from "../../types";
import { categorize, categorizeAll } from "../categorize";
import { dictionary } from "../dictionary";

describe("categorize", () => {
  it.each<[string, Category]>([
    ["IFOOD*PIZZA HOLIC", "Delivery"],
    ["NETFLIX.COM", "Assinaturas/Streaming"],
    ["DROGASIL FARMÁCIA", "Saúde/Farmácia"],
    ["ESTORNO COMPRA AMAZON", "Compras online"],
    ["POSTO SHELL", "Combustível"],
    ["C&A MODAS", "Vestuário"]
  ])("categoriza %s", (description, expected) => {
    expect(categorize(description)).toBe(expected);
  });

  it("prioriza a regra exata aprendida do usuário", () => {
    expect(
      categorize("IFOOD*PIZZA", {
        "ifood pizza": "Lazer"
      })
    ).toBe("Lazer");
  });

  it("usa heurísticas para pagamentos, encargos e parcelas", () => {
    expect(categorize("PAG BOLETO DESCONHECIDO")).toBe("Serviços");
    expect(categorize("COBRANCA IOF INTERNACIONAL")).toBe(
      "Juros e encargos"
    );
    expect(categorize("COMPRA XYZ PARC 2")).toBe("Parcelamento");
  });

  it("retorna Outros quando nenhuma regra é encontrada", () => {
    expect(categorize("XPTO DESCONHECIDO")).toBe("Outros");
  });

  it("contém mais de 300 termos normalizados", () => {
    expect(Object.keys(dictionary).length).toBeGreaterThanOrEqual(300);
  });
});

describe("categorizeAll", () => {
  it("categoriza em lote e cria merchantKey", () => {
    const [transaction] = categorizeAll([
      {
        date: "2026-09-10",
        description: "NETFLIX.COM",
        amount: 39.9,
        isRecurring: true
      }
    ]);

    expect(transaction).toEqual({
      date: "2026-09-10",
      description: "NETFLIX.COM",
      merchantKey: "netflix com",
      amount: 39.9,
      category: "Assinaturas/Streaming",
      isRecurring: false
    });
  });

  it("aplica regras do usuário durante a categorização em lote", () => {
    const [transaction] = categorizeAll(
      [
        {
          date: "2026-09-10",
          description: "LOJA DA ESQUINA",
          amount: 25,
          isRecurring: false
        }
      ],
      { "loja da esquina": "Mercado" }
    );

    expect(transaction?.category).toBe("Mercado");
  });
});
