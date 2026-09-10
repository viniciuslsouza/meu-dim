import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional()
);

const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  DATABASE_URL: z
    .url()
    .refine((value) => /^postgres(?:ql)?:\/\//.test(value), {
      message: "DATABASE_URL deve usar o protocolo PostgreSQL"
    }),
  REDIS_URL: z
    .url()
    .refine((value) => /^rediss?:\/\//.test(value), {
      message: "REDIS_URL deve usar o protocolo Redis"
    })
    .default("redis://localhost:6379"),

  JWT_SECRET: z
    .string()
    .min(32)
    .default("development-jwt-secret-change-me-32chars"),
  JWT_EXPIRES: z.string().default("15m"),
  REFRESH_SECRET: z
    .string()
    .min(32)
    .default("development-refresh-secret-change-me-32chars"),
  REFRESH_EXPIRES: z.string().default("30d"),

  APP_URL: z.url().default("http://localhost:3000"),
  API_URL: z.url().default("http://localhost:3001"),

  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.email().default("noreply@meudim.com.br"),

  PAYMENT_PROVIDER_MODE: z.literal("mock").default("mock"),
  PAYMENTS_MOCK_WEBHOOK_SECRET: z
    .string()
    .min(16)
    .default("development-mock-payments-secret"),
  ONE_TIME_PRICE_BRL_CENTS: z.coerce.number().int().positive().default(3900),
  SUBSCRIPTION_PRICE_BRL_CENTS: z.coerce
    .number()
    .int()
    .positive()
    .default(990),

  MP_ACCESS_TOKEN: optionalSecret,
  MP_WEBHOOK_SECRET: optionalSecret,
  STRIPE_SECRET: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  SENTRY_DSN: optionalSecret
});

export const envSchema = baseEnvSchema.superRefine((env, context) => {
  if (env.NODE_ENV === "development") {
    return;
  }

  const requiredProductionValues: [keyof typeof env, string][] = [
    ["RESEND_API_KEY", env.RESEND_API_KEY],
    ["JWT_SECRET", env.JWT_SECRET],
    ["REFRESH_SECRET", env.REFRESH_SECRET],
    ["PAYMENTS_MOCK_WEBHOOK_SECRET", env.PAYMENTS_MOCK_WEBHOOK_SECRET]
  ];

  for (const [key, value] of requiredProductionValues) {
    if (!value || value.startsWith("development-")) {
      context.addIssue({
        code: "custom",
        path: [key],
        message: `${key} deve ser configurada fora do ambiente de desenvolvimento`
      });
    }
  }

  if (env.REDIS_URL === "redis://localhost:6379") {
    context.addIssue({
      code: "custom",
      path: ["REDIS_URL"],
      message: "REDIS_URL deve apontar para o Redis de produção"
    });
  }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = z.prettifyError(result.error);

    throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
  }

  return result.data;
}
