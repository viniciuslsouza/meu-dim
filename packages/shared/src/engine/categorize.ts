import type { Category, RawTransaction } from "../types";

import { dictionary } from "./dictionary";
import { normalize } from "./normalize";

const dictionaryTerms = Object.entries(dictionary).sort(
  ([left], [right]) => right.length - left.length
);

function containsTerm(key: string, term: string): boolean {
  if (term.length > 3) {
    return key.includes(term);
  }

  return key.split(" ").includes(term);
}

export function categorize(
  description: string,
  userRules?: Record<string, Category>
): Category {
  const key = normalize(description);
  const userCategory = userRules?.[key];

  if (userCategory) {
    return userCategory;
  }

  const exactCategory = dictionary[key];

  if (exactCategory) {
    return exactCategory;
  }

  for (const [term, category] of dictionaryTerms) {
    if (containsTerm(key, term)) {
      return category;
    }
  }

  if (/pag(amento)?/.test(key)) {
    return "Serviços";
  }

  if (/iof|juros|encargo|rotativo/.test(key)) {
    return "Juros e encargos";
  }

  if (/parc(?:ela)?/i.test(description)) {
    return "Parcelamento";
  }

  return "Outros";
}

export function categorizeAll(
  transactions: Omit<RawTransaction, "category" | "merchantKey">[],
  userRules?: Record<string, Category>
): RawTransaction[] {
  return transactions.map((transaction) => ({
    ...transaction,
    merchantKey: normalize(transaction.description),
    category: categorize(transaction.description, userRules),
    isRecurring: false
  }));
}
