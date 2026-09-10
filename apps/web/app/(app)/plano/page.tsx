"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Edit3,
  LockKeyhole,
  Plus,
  QrCode,
  ShieldCheck,
  Trash2,
  WalletCards
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { AuthModal } from "@/components/auth-modal";
import { apiRequest, getAccessToken } from "@/lib/api";
import { formatBRL, formatMonth } from "@/lib/format";
import { usePlanStore } from "@/lib/stores/plan.store";
import { useStatementStore } from "@/lib/stores/statement.store";
import type { Debt, DebtType } from "@meudim/shared";

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "LOAN", label: "Empréstimo" },
  { value: "OVERDRAFT", label: "Cheque especial" },
  { value: "OTHER", label: "Outro" }
];

interface ReferenceRates {
  rates: { type: DebtType; avgRate: number }[];
}

interface PixResponse {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  expiresAt: string;
}

interface StripeResponse {
  paymentId: string;
  url: string;
}

function DebtForm({
  onSave,
  editing
}: {
  onSave: (debt: Debt) => void;
  editing?: Debt | null;
}): React.JSX.Element {
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<DebtType>(
    editing?.type ?? "CREDIT_CARD"
  );
  const [balance, setBalance] = useState(
    editing ? String(editing.balance) : ""
  );
  const [monthlyRate, setMonthlyRate] = useState(
    editing ? String(editing.monthlyRate * 100) : ""
  );
  const [minimumPayment, setMinimumPayment] = useState(
    editing ? String(editing.minimumPayment) : ""
  );
  const [referenceRates, setReferenceRates] =
    useState<ReferenceRates | null>(null);

  useEffect(() => {
    void apiRequest<ReferenceRates>("/debts/reference-rates")
      .then(setReferenceRates)
      .catch(() =>
        setReferenceRates({
          rates: [
            { type: "CREDIT_CARD", avgRate: 0.149 },
            { type: "LOAN", avgRate: 0.035 },
            { type: "OVERDRAFT", avgRate: 0.18 },
            { type: "OTHER", avgRate: 0.05 }
          ]
        })
      );
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          id: editing?.id ?? crypto.randomUUID(),
          name: name.trim(),
          type,
          balance: Number(balance.replace(",", ".")),
          monthlyRate: Number(monthlyRate.replace(",", ".")) / 100,
          minimumPayment: Number(minimumPayment.replace(",", "."))
        });
        if (!editing) {
          setName("");
          setBalance("");
          setMonthlyRate("");
          setMinimumPayment("");
        }
      }}
      className="grid gap-4 rounded-3xl border border-ink-border bg-white p-5 shadow-card sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-brand-900">
          Nome da dívida
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Cartão Nubank"
            className="rounded-xl border border-ink-border px-4 py-3 outline-none focus:border-accent-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand-900">
          Tipo
          <select
            value={type}
            onChange={(event) => setType(event.target.value as DebtType)}
            className="rounded-xl border border-ink-border bg-white px-4 py-3 outline-none focus:border-accent-700"
          >
            {DEBT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-brand-900">
          Saldo devedor (R$)
          <input
            required
            min="1"
            step="0.01"
            inputMode="decimal"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            className="rounded-xl border border-ink-border px-4 py-3 outline-none focus:border-accent-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand-900">
          Juros (% ao mês)
          <input
            required
            min="0"
            max="30"
            step="0.01"
            inputMode="decimal"
            value={monthlyRate}
            onChange={(event) => setMonthlyRate(event.target.value)}
            className="rounded-xl border border-ink-border px-4 py-3 outline-none focus:border-accent-700"
          />
          <button
            type="button"
            onClick={() => {
              const rate = referenceRates?.rates.find(
                (item) => item.type === type
              );
              if (rate) setMonthlyRate(String(rate.avgRate * 100));
            }}
            className="text-left text-xs font-semibold text-accent-700"
          >
            Usar taxa de referência
          </button>
        </label>
        <label className="grid gap-2 text-sm font-medium text-brand-900">
          Pagamento mínimo (R$)
          <input
            required
            min="1"
            step="0.01"
            inputMode="decimal"
            value={minimumPayment}
            onChange={(event) => setMinimumPayment(event.target.value)}
            className="rounded-xl border border-ink-border px-4 py-3 outline-none focus:border-accent-700"
          />
        </label>
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 justify-self-start rounded-xl bg-brand-900 px-5 py-3 font-semibold text-white"
      >
        <Plus className="h-4 w-4" />
        {editing ? "Salvar alterações" : "Adicionar dívida"}
      </button>
    </form>
  );
}

function StrategyCard({
  title,
  result,
  selected,
  onSelect
}: {
  title: string;
  result: NonNullable<
    ReturnType<typeof usePlanStore.getState>["localSimulation"]
  >["snowball"];
  selected: boolean;
  onSelect: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "rounded-2xl border p-5 text-left transition",
        selected
          ? "border-accent-700 bg-accent-50 ring-2 ring-accent-100"
          : "border-ink-border bg-white hover:border-brand-400"
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-900">{title}</h3>
        {selected ? (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-700 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {result.infeasible ? (
        <p className="mt-4 text-sm font-medium text-danger-600">
          Orçamento insuficiente.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div>
            <strong className="block text-xl text-brand-900">
              {result.months}
            </strong>
            <span className="text-xs text-ink-muted">meses</span>
          </div>
          <div>
            <strong className="block text-lg text-brand-900">
              {formatBRL(result.totalInterest)}
            </strong>
            <span className="text-xs text-ink-muted">em juros</span>
          </div>
          <div>
            <strong className="block text-sm capitalize text-brand-900">
              {result.payoffDate ? formatMonth(result.payoffDate) : "—"}
            </strong>
            <span className="text-xs text-ink-muted">quitação</span>
          </div>
        </div>
      )}
    </button>
  );
}

function PlanPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diagnosis = useStatementStore((state) => state.diagnosis);
  const parsedStatement = useStatementStore(
    (state) => state.parsedStatement
  );
  const {
    debts,
    monthlyBudget,
    localSimulation,
    chosenStrategy,
    addDebt,
    removeDebt,
    updateDebt,
    setBudget,
    setChosenStrategy,
    setCheckout
  } = usePlanStore();
  const [step, setStep] = useState(1);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<
    "MERCADOPAGO" | "STRIPE"
  >("MERCADOPAGO");
  const minimumRequired = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.minimumPayment, 0),
    [debts]
  );

  useEffect(() => {
    if (
      debts.length === 0 &&
      parsedStatement &&
      (parsedStatement.total ?? 0) > 0
    ) {
      addDebt({
        id: crypto.randomUUID(),
        name: `Fatura ${parsedStatement.bank}`,
        type: "CREDIT_CARD",
        balance: parsedStatement.total ?? 0,
        monthlyRate: 0.149,
        minimumPayment: Math.max(
          parsedStatement.minimumPayment ?? 0,
          (parsedStatement.total ?? 0) * 0.15
        )
      });
    }
  }, [addDebt, debts.length, parsedStatement]);

  useEffect(() => {
    if (searchParams.get("continuarPagamento") === "true" && getAccessToken()) {
      setStep(3);
    }
  }, [searchParams]);

  const startCheckout = async (
    provider: "MERCADOPAGO" | "STRIPE",
    demo = false
  ): Promise<void> => {
    if (!demo && !getAccessToken()) {
      setPendingProvider(provider);
      setAuthOpen(true);
      return;
    }

    if (demo) {
      const paymentId = `demo_${crypto.randomUUID()}`;
      const code = `000201|MEUDIM-MOCK|${paymentId}|3900`;

      setCheckout({
        paymentId,
        provider,
        qrCode: code,
        qrCodeBase64: btoa(code),
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        demo: true,
        status: provider === "STRIPE" ? "PAID" : "PENDING"
      });
      router.push(
        provider === "STRIPE"
          ? `/checkout?success=true&paymentId=${paymentId}`
          : `/checkout?paymentId=${paymentId}`
      );
      return;
    }

    try {
      if (provider === "MERCADOPAGO") {
        const response = await apiRequest<PixResponse>("/payments/checkout", {
          method: "POST",
          body: JSON.stringify({
            product: "ONE_TIME_PLAN",
            provider
          })
        });
        setCheckout({
          ...response,
          provider,
          demo: false,
          status: "PENDING"
        });
        router.push(`/checkout?paymentId=${response.paymentId}`);
      } else {
        const response = await apiRequest<StripeResponse>(
          "/payments/checkout",
          {
            method: "POST",
            body: JSON.stringify({
              product: "ONE_TIME_PLAN",
              provider
            })
          }
        );
        if (response.url.includes("/checkout/mock-stripe")) {
          setCheckout({
            paymentId: response.paymentId,
            provider,
            expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
            demo: true,
            status: "PAID"
          });
          router.push(
            `/checkout?success=true&paymentId=${response.paymentId}`
          );
        } else {
          window.location.assign(response.url);
        }
      }
    } catch {
      setPendingProvider(provider);
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <AppHeader current="Plano de quitação" />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-10">
          <div className="flex items-center justify-between gap-3">
            {[1, 2, 3].map((number) => (
              <div key={number} className="flex flex-1 items-center gap-3">
                <span
                  className={[
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                    number <= step
                      ? "bg-accent-700 text-white"
                      : "bg-surface-muted text-ink-muted"
                  ].join(" ")}
                >
                  {number}
                </span>
                <span className="hidden text-sm font-medium text-brand-900 sm:block">
                  {number === 1
                    ? "Dívidas"
                    : number === 2
                      ? "Orçamento"
                      : "Seu plano"}
                </span>
                {number < 3 ? (
                  <span
                    className={[
                      "ml-auto h-1 flex-1 rounded-full",
                      number < step ? "bg-accent-500" : "bg-surface-muted"
                    ].join(" ")}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <section>
            <h1 className="text-3xl font-bold tracking-tight text-brand-900">
              Quais dívidas você quer quitar?
            </h1>
            <p className="mt-3 text-ink-muted">
              Adicione cartões, empréstimos e cheque especial.
            </p>
            <div className="mt-8">
              <DebtForm
                key={editing?.id ?? "new"}
                editing={editing}
                onSave={(debt) => {
                  if (editing?.id) {
                    updateDebt(editing.id, debt);
                    setEditing(null);
                  } else {
                    addDebt(debt);
                  }
                }}
              />
            </div>
            <div className="mt-6 grid gap-3">
              {debts.map((debt) => (
                <article
                  key={debt.id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-border bg-white p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-brand-900">{debt.name}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatBRL(debt.balance)} ·{" "}
                      {(debt.monthlyRate * 100).toFixed(2)}% a.m. · mínimo{" "}
                      {formatBRL(debt.minimumPayment)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Editar ${debt.name}`}
                      onClick={() => setEditing(debt)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-ink-border text-ink-muted"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remover ${debt.name}`}
                      onClick={() => removeDebt(debt.id ?? "")}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-danger-100 text-danger-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              disabled={debts.length === 0}
              onClick={() => {
                if (monthlyBudget <= 0) setBudget(minimumRequired);
                setStep(2);
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent-700 px-6 py-3 font-semibold text-white disabled:opacity-40"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-brand-900">
              Quanto você consegue pagar por mês?
            </h1>
            <p className="mt-3 leading-7 text-ink-muted">
              Considere o valor total disponível para todas as dívidas.
            </p>
            <div className="mt-8 rounded-3xl border border-ink-border bg-white p-6 shadow-card sm:p-8">
              <label className="grid gap-2 font-medium text-brand-900">
                Orçamento mensal
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={monthlyBudget}
                    onChange={(event) => setBudget(Number(event.target.value))}
                    className="w-full rounded-xl border border-ink-border py-3 pl-12 pr-4 text-2xl font-bold text-brand-900 outline-none focus:border-accent-700"
                  />
                </div>
              </label>
              <input
                aria-label="Orçamento mensal"
                type="range"
                min="0"
                max={Math.max(5000, minimumRequired * 2)}
                step="50"
                value={monthlyBudget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="mt-6 w-full accent-[#0F766E]"
              />
              <div className="mt-3 flex justify-between text-sm text-ink-muted">
                <span>Mínimo necessário: {formatBRL(minimumRequired)}</span>
                <span>{formatBRL(monthlyBudget)}</span>
              </div>
              {diagnosis?.totalRecurring ? (
                <p className="mt-4 rounded-xl bg-accent-50 p-3 text-sm text-accent-900">
                  Potencial identificado no diagnóstico:{" "}
                  <strong>{formatBRL(diagnosis.totalRecurring)}/mês</strong>
                </p>
              ) : null}
            </div>

            {monthlyBudget < minimumRequired ? (
              <div className="mt-5 rounded-2xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
                Seu orçamento não cobre os pagamentos mínimos. Faltam{" "}
                <strong>{formatBRL(minimumRequired - monthlyBudget)}</strong>.
              </div>
            ) : localSimulation ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StrategyCard
                  title="Bola de neve"
                  result={localSimulation.snowball}
                  selected={chosenStrategy === "SNOWBALL"}
                  onSelect={() => setChosenStrategy("SNOWBALL")}
                />
                <StrategyCard
                  title="Avalanche"
                  result={localSimulation.avalanche}
                  selected={chosenStrategy === "AVALANCHE"}
                  onSelect={() => setChosenStrategy("AVALANCHE")}
                />
              </div>
            ) : null}
            <button
              type="button"
              disabled={
                monthlyBudget < minimumRequired ||
                !localSimulation ||
                (chosenStrategy === "SNOWBALL"
                  ? localSimulation?.snowball.infeasible
                  : localSimulation?.avalanche.infeasible)
              }
              onClick={() => setStep(3)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent-700 px-6 py-3 font-semibold text-white disabled:opacity-40"
            >
              Ver meu plano
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : null}

        {step === 3 && localSimulation ? (
          <section>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Ajustar orçamento
            </button>
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-accent-700">
                Prévia gratuita
              </span>
              <h1 className="mt-3 text-3xl font-bold text-brand-900">
                Seu caminho para zerar as dívidas
              </h1>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <StrategyCard
                title="Bola de neve"
                result={localSimulation.snowball}
                selected={chosenStrategy === "SNOWBALL"}
                onSelect={() => setChosenStrategy("SNOWBALL")}
              />
              <StrategyCard
                title="Avalanche"
                result={localSimulation.avalanche}
                selected={chosenStrategy === "AVALANCHE"}
                onSelect={() => setChosenStrategy("AVALANCHE")}
              />
            </div>
            <p className="mt-4 text-center font-medium text-accent-900">
              Avalanche economiza{" "}
              {formatBRL(
                Math.max(
                  0,
                  localSimulation.snowball.totalInterest -
                    localSimulation.avalanche.totalInterest
                )
              )}{" "}
              em juros.
            </p>

            <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-ink-border bg-white">
              <div
                aria-hidden="true"
                className="pointer-events-none select-none p-7 blur-[5px]"
              >
                <div className="h-52 rounded-2xl bg-gradient-to-t from-brand-100 to-brand-50 p-5">
                  <div className="flex h-full items-end gap-3">
                    {[70, 58, 49, 40, 31, 20, 10].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-lg bg-brand-500"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-12 rounded-xl bg-brand-50" />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 grid place-items-center bg-white/45 p-5 backdrop-blur-[2px]">
                <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-center shadow-soft sm:p-8">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-700">
                    <LockKeyhole className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-2xl font-bold text-brand-900">
                    Desbloqueie seu plano completo
                  </h2>
                  <ul className="mx-auto mt-5 grid max-w-sm gap-2 text-left text-sm text-ink-muted">
                    {[
                      "Cronograma mês a mês",
                      "Gráficos e ordem de quitação",
                      "Metas de corte e refinanciamento",
                      "PDF para baixar"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent-700" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <strong className="text-3xl text-brand-900">R$ 39</strong>
                    <span className="text-sm text-ink-muted"> — uma vez</span>
                    <span className="ml-2 rounded-full bg-warn-100 px-2 py-1 text-xs font-bold text-warn-700">
                      7 dias de garantia
                    </span>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <button
                      type="button"
                      onClick={() => void startCheckout("MERCADOPAGO")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white"
                    >
                      <QrCode className="h-5 w-5" />
                      Pagar com Pix
                    </button>
                    <button
                      type="button"
                      onClick={() => void startCheckout("STRIPE")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-border px-5 py-3 font-semibold text-brand-900"
                    >
                      <WalletCards className="h-5 w-5" />
                      Pagar com cartão de crédito
                    </button>
                  </div>
                  <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
                    <ShieldCheck className="h-4 w-4 text-accent-700" />
                    Processamento seguro via Mercado Pago e Stripe.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onDemo={() => void startCheckout(pendingProvider, true)}
      />
    </div>
  );
}

export default function PlanPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-surface-page text-ink-muted">
          Preparando seu plano…
        </div>
      }
    >
      <PlanPageContent />
    </Suspense>
  );
}
