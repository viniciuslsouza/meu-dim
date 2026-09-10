import { normalize } from "../normalize";

describe("normalize", () => {
  it.each([
    ["IFOOD*RESTAURANTE 01/12", "ifood restaurante"],
    ["UBER   EATS  ", "uber eats"],
    ["NETFLIX.COM", "netflix com"],
    ["DROGASIL FARMÁCIA", "drogasil farmacia"],
    ["LOJA PARC 1", "loja"],
    ["LOJA PARCELA 10", "loja"],
    ["Compra 1/3", "compra"]
  ])("normaliza %s", (description, expected) => {
    expect(normalize(description)).toBe(expected);
  });

  it("retorna vazio para uma descrição sem caracteres alfanuméricos", () => {
    expect(normalize("***")).toBe("");
  });
});
