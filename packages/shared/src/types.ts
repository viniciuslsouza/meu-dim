export type BankId =
  | "NUBANK"
  | "INTER"
  | "ITAU"
  | "BRADESCO"
  | "C6"
  | "SANTANDER"
  | "BB"
  | "CAIXA"
  | "GENERIC";

export type Category =
  | "Alimentação fora"
  | "Delivery"
  | "Mercado"
  | "Transporte/App"
  | "Combustível"
  | "Assinaturas/Streaming"
  | "Saúde/Farmácia"
  | "Vestuário"
  | "Casa"
  | "Educação"
  | "Lazer"
  | "Viagem"
  | "Compras online"
  | "Serviços"
  | "Juros e encargos"
  | "Parcelamento"
  | "Outros";

export type DebtType = "CREDIT_CARD" | "LOAN" | "OVERDRAFT" | "OTHER";
export type PayoffStrategy = "SNOWBALL" | "AVALANCHE" | "CUSTOM";
export type PlanTier = "FREE" | "ONE_TIME" | "SUBSCRIBER";
export type PaymentProvider = "MERCADOPAGO" | "STRIPE";
export type PaymentProduct = "ONE_TIME_PLAN" | "SUBSCRIPTION";

export interface RawTransaction {
  date: string;
  description: string;
  merchantKey: string;
  amount: number;
  category: Category;
  installment?: number;
  installments?: number;
  isRecurring: boolean;
}

export interface ParsedStatement {
  bank: BankId;
  referenceMonth: string;
  total?: number;
  minimumPayment?: number;
  dueDate?: string;
  transactions: RawTransaction[];
  warnings: string[];
}

export interface DiagnosisResult {
  healthScore: number;
  healthLabel: "critico" | "alerta" | "atencao" | "bom" | "otimo";
  topOffenders: OffenderItem[];
  subscriptions: SubscriptionItem[];
  installmentsForecast: InstallmentMonth[];
  totalInterestPaid: number;
  totalRecurring: number;
}

export interface OffenderItem {
  category: Category;
  total: number;
  percentage: number;
  topMerchants: { name: string; amount: number }[];
}

export interface SubscriptionItem {
  merchantKey: string;
  displayName: string;
  amount: number;
  isRecurring: boolean;
}

export interface InstallmentMonth {
  month: string;
  total: number;
}

export interface Debt {
  id?: string;
  name: string;
  type: DebtType;
  balance: number;
  monthlyRate: number;
  minimumPayment: number;
}

export interface MonthRow {
  month: number;
  debts: {
    id: string;
    balance: number;
    payment: number;
    interest: number;
  }[];
  totalPayment: number;
  totalInterest: number;
}

export interface PayoffResult {
  strategy: PayoffStrategy;
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  schedule: MonthRow[];
  debtOrder: string[];
  infeasible: boolean;
}

export interface RefinanceComparison {
  currentCardCost: number;
  loanCost: number;
  savings: number;
  loanMonthlyPayment: number;
  affordsLoan: boolean;
}
