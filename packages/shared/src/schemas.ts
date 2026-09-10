import { z } from "zod";

export const BankIdSchema = z.enum([
  "NUBANK",
  "INTER",
  "ITAU",
  "BRADESCO",
  "C6",
  "SANTANDER",
  "BB",
  "CAIXA",
  "GENERIC"
]);

export const CategorySchema = z.enum([
  "Alimentação fora",
  "Delivery",
  "Mercado",
  "Transporte/App",
  "Combustível",
  "Assinaturas/Streaming",
  "Saúde/Farmácia",
  "Vestuário",
  "Casa",
  "Educação",
  "Lazer",
  "Viagem",
  "Compras online",
  "Serviços",
  "Juros e encargos",
  "Parcelamento",
  "Outros"
]);

export const DebtTypeSchema = z.enum([
  "CREDIT_CARD",
  "LOAN",
  "OVERDRAFT",
  "OTHER"
]);

export const PayoffStrategySchema = z.enum([
  "SNOWBALL",
  "AVALANCHE",
  "CUSTOM"
]);

export const RawTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  merchantKey: z.string().min(1),
  amount: z.number(),
  category: CategorySchema,
  installment: z.number().int().positive().optional(),
  installments: z.number().int().positive().optional(),
  isRecurring: z.boolean()
});

export const ParsedStatementSchema = z.object({
  bank: BankIdSchema,
  referenceMonth: z.string().regex(/^\d{4}-\d{2}$/),
  total: z.number().positive().optional(),
  minimumPayment: z.number().positive().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  transactions: z.array(RawTransactionSchema),
  warnings: z.array(z.string())
});

export const StatementInputSchema = ParsedStatementSchema;

export const DebtSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  type: DebtTypeSchema,
  balance: z.number().positive(),
  monthlyRate: z.number().min(0).max(0.3),
  minimumPayment: z.number().positive()
}).refine((debt) => debt.minimumPayment <= debt.balance, {
  path: ["minimumPayment"],
  message: "minimumPayment cannot be greater than balance"
});

export const SimulateInputSchema = z.object({
  debts: z.array(DebtSchema).min(1),
  monthlyBudget: z.number().positive(),
  strategies: z
    .array(PayoffStrategySchema)
    .default(["SNOWBALL", "AVALANCHE"])
});

export const CreatePlanSchema = SimulateInputSchema.extend({
  chosenStrategy: PayoffStrategySchema
});
