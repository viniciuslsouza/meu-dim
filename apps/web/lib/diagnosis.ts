import {
  calcHealthScore,
  detectSubscriptions,
  getInstallmentsForecast,
  getTopOffenders,
  type DiagnosisResult,
  type ParsedStatement
} from "@meudim/shared";

const EVITABLE_CATEGORIES = new Set([
  "Alimentação fora",
  "Delivery",
  "Assinaturas/Streaming",
  "Vestuário",
  "Lazer",
  "Viagem",
  "Compras online"
]);

export function calculateDiagnosis(
  statement: ParsedStatement
): DiagnosisResult {
  const transactions = statement.transactions;
  const calculatedTotal = transactions.reduce(
    (sum, transaction) => sum + Math.max(0, transaction.amount),
    0
  );
  const total = statement.total ?? calculatedTotal;
  const totalInterestPaid = transactions
    .filter(({ category }) => category === "Juros e encargos")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalInstallments = transactions
    .filter(({ installments }) => (installments ?? 0) > 1)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalEvitable = transactions
    .filter(({ category }) => EVITABLE_CATEGORIES.has(category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const subscriptions = detectSubscriptions(transactions);
  const health = calcHealthScore({
    total,
    totalInterest: totalInterestPaid,
    totalInstallments,
    totalEvitable
  });

  return {
    healthScore: health.score,
    healthLabel: health.label,
    topOffenders: getTopOffenders(transactions),
    subscriptions,
    installmentsForecast: getInstallmentsForecast(
      transactions,
      statement.referenceMonth
    ),
    totalInterestPaid,
    totalRecurring: subscriptions.reduce(
      (sum, subscription) => sum + subscription.amount,
      0
    )
  };
}
