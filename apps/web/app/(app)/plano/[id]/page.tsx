"use client";

import {
  compareRefinance,
  simulateCutImpact,
  type PayoffResult,
  type RefinanceComparison
} from "@meudim/shared";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertTriangle,
  Download,
  Sparkles
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { getAccessToken } from "@/lib/api";
import { formatBRL, formatMonth } from "@/lib/format";
import { getSelectedDebts, usePlanStore } from "@/lib/stores/plan.store";
import { useStatementStore } from "@/lib/stores/statement.store";

const COLORS = ["#0F766E", "#2F5D8C", "#D97706", "#4A78A8", "#34D399"];

function scheduleMonthLabel(monthIndex: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthIndex);

  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit"
  }).replace(".", "");
}

function scheduleMonthTitle(monthIndex: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthIndex);

  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  return `Mês ${monthIndex} · ${label}`;
}

function ScheduleChart({
  result,
  debtNames
}: {
  result: PayoffResult;
  debtNames: Map<string, string>;
}): React.JSX.Element {
  const data = result.schedule.map((row) => ({
    month: scheduleMonthLabel(row.month),
    monthTitle: scheduleMonthTitle(row.month),
    ...Object.fromEntries(
      row.debts.map((debt) => [debt.id, debt.balance])
    )
  }));
  const debtIds = [...new Set(result.schedule.flatMap((row) =>
    row.debts.map((debt) => debt.id)
  ))];

  return (
    <div className="h-[340px] w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
          barCategoryGap={data.length <= 4 ? "28%" : "18%"}
          maxBarSize={48}
        >
          <CartesianGrid vertical={false} stroke="#E8EEF4" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            labelFormatter={(_label, payload) =>
              String(payload?.[0]?.payload?.monthTitle ?? _label)
            }
            formatter={(value, name) => [
              formatBRL(Number(value)),
              debtNames.get(String(name)) ?? String(name)
            ]}
            contentStyle={{ borderRadius: 12, borderColor: "#D9E1EA" }}
          />
          <Legend
            formatter={(value: string) => debtNames.get(value) ?? value}
          />
          {debtIds.map((id, index) => (
            <Bar
              key={id}
              dataKey={id}
              stackId="balances"
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function FullPlanPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    debts,
    selectedDebtIds,
    monthlyBudget,
    localSimulation,
    chosenStrategy
  } = usePlanStore();
  const diagnosis = useStatementStore((state) => state.diagnosis);
  const [activeTab, setActiveTab] = useState<
    "SNOWBALL" | "AVALANCHE" | "REFINANCE"
  >(chosenStrategy === "SNOWBALL" ? "SNOWBALL" : "AVALANCHE");
  const [loanRate, setLoanRate] = useState(3.5);
  const [loanMonths, setLoanMonths] = useState(24);
  const [refinance, setRefinance] = useState<RefinanceComparison | null>(null);
  const [cutAmounts, setCutAmounts] = useState<Record<string, number>>({});
  const isDemo = params.id.startsWith("demo-");
  const selectedDebts = getSelectedDebts(debts, selectedDebtIds);

  if (
    !localSimulation ||
    selectedDebts.length === 0 ||
    (!isDemo && !getAccessToken())
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-page p-5">
        <div className="max-w-md rounded-3xl border border-ink-border bg-white p-8 text-center shadow-card">
          <AlertTriangle className="mx-auto h-10 w-10 text-warn-600" />
          <h1 className="mt-5 text-2xl font-bold text-brand-900">
            Plano não disponível nesta sessão
          </h1>
          <p className="mt-3 text-ink-muted">
            Entre novamente ou monte uma nova simulação.
          </p>
          <button
            type="button"
            onClick={() => router.push("/plano")}
            className="mt-6 rounded-xl bg-accent-700 px-6 py-3 font-semibold text-white"
          >
            Voltar ao simulador
          </button>
        </div>
      </div>
    );
  }

  const selectedResult =
    activeTab === "SNOWBALL"
      ? localSimulation.snowball
      : localSimulation.avalanche;
  const headerResult =
    chosenStrategy === "SNOWBALL"
      ? localSimulation.snowball
      : localSimulation.avalanche;
  const debtNames = new Map(
    selectedDebts.map((debt, index) => [
      debt.id ?? `debt-${index}`,
      debt.name
    ])
  );
  const totalCut = Object.values(cutAmounts).reduce(
    (sum, value) => sum + value,
    0
  );
  const cutImpact =
    totalCut > 0
      ? simulateCutImpact(selectedDebts, monthlyBudget, totalCut)
      : null;
  const avoidable = diagnosis?.topOffenders.filter(({ category }) =>
    ["Delivery", "Lazer", "Compras online", "Alimentação fora"].includes(
      category
    )
  ) ?? [];

  return (
    <div className="min-h-screen bg-surface-page">
      <AppHeader current="Plano completo" />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <section className="rounded-[1.75rem] bg-brand-900 p-6 text-white shadow-soft sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-300">
                Estratégia escolhida
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                {chosenStrategy === "SNOWBALL"
                  ? "Bola de Neve"
                  : "Avalanche"}
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-xs text-brand-100">Quitação prevista</span>
                <strong className="mt-1 block capitalize">
                  {formatMonth(headerResult.payoffDate)}
                </strong>
              </div>
              <div>
                <span className="text-xs text-brand-100">Total em juros</span>
                <strong className="mt-1 block">
                  {formatBRL(headerResult.totalInterest)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex overflow-x-auto rounded-xl border border-ink-border bg-white p-1">
          {[
            ["SNOWBALL", "Bola de Neve"],
            ["AVALANCHE", "Avalanche"],
            ["REFINANCE", "Refinanciamento"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={[
                "min-w-fit flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                activeTab === value
                  ? "bg-brand-900 text-white"
                  : "text-ink-muted hover:bg-brand-50"
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab !== "REFINANCE" ? (
          <div className="mt-6 grid gap-6">
            <section className="rounded-3xl border border-ink-border bg-white p-5 shadow-card sm:p-7">
              <h2 className="text-xl font-semibold text-brand-900">
                Evolução do saldo
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Quanto ainda resta de cada dívida a cada mês do plano.
              </p>
              <div className="mt-5">
                <ScheduleChart result={selectedResult} debtNames={debtNames} />
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-ink-border bg-white shadow-card">
              <div className="p-5 sm:p-7">
                <h2 className="text-xl font-semibold text-brand-900">
                  Cronograma mês a mês
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-brand-50 text-left text-xs uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th className="px-5 py-3">Mês</th>
                      <th className="px-5 py-3">Pagamentos</th>
                      <th className="px-5 py-3 text-right">Total pago</th>
                      <th className="px-5 py-3 text-right">Juros</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-border">
                    {selectedResult.schedule.slice(0, 24).map((row) => (
                      <tr key={row.month}>
                        <td className="px-5 py-3 font-semibold text-brand-900">
                          Mês {row.month}
                        </td>
                        <td className="px-5 py-3 text-ink-muted">
                          {row.debts
                            .filter((debt) => debt.payment > 0)
                            .map(
                              (debt) =>
                                `${debtNames.get(debt.id) ?? debt.id}: ${formatBRL(
                                  debt.payment
                                )}`
                            )
                            .join(" · ")}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums">
                          {formatBRL(row.totalPayment)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-warn-700">
                          {formatBRL(row.totalInterest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-ink-border bg-white p-6 shadow-card">
              <h2 className="text-xl font-semibold text-brand-900">
                Ordem de quitação
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {selectedResult.debtOrder.map((id, index) => (
                  <span
                    key={id}
                    className="rounded-full bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-900"
                  >
                    {index + 1}. {debtNames.get(id) ?? id}
                  </span>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <section className="mt-6 rounded-3xl border border-ink-border bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-bold text-brand-900">
              Vale a pena trocar por um empréstimo?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-brand-900">
                Taxa do empréstimo (% a.m.)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={loanRate}
                  onChange={(event) => setLoanRate(Number(event.target.value))}
                  className="rounded-xl border border-ink-border px-4 py-3"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-brand-900">
                Prazo (meses)
                <input
                  type="number"
                  min="1"
                  value={loanMonths}
                  onChange={(event) => setLoanMonths(Number(event.target.value))}
                  className="rounded-xl border border-ink-border px-4 py-3"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() =>
                setRefinance(
                  compareRefinance(
                    selectedDebts,
                    monthlyBudget,
                    loanRate / 100,
                    loanMonths
                  )
                )
              }
              className="mt-5 rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white"
            >
              Calcular comparação
            </button>
            {refinance ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Custo atual", refinance.currentCardCost],
                  ["Custo do empréstimo", refinance.loanCost],
                  ["Economia", refinance.savings]
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl bg-brand-50 p-5">
                    <span className="text-sm text-ink-muted">{label}</span>
                    <strong className="mt-2 block text-xl text-brand-900">
                      {formatBRL(Number(value))}
                    </strong>
                  </div>
                ))}
                {!refinance.affordsLoan ? (
                  <p className="sm:col-span-3 text-sm text-danger-600">
                    A parcela de {formatBRL(refinance.loanMonthlyPayment)} supera
                    seu orçamento mensal.
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        )}

        {avoidable.length > 0 ? (
          <section className="mt-6 rounded-3xl border border-ink-border bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-accent-700" />
              <div>
                <h2 className="text-xl font-semibold text-brand-900">
                  Metas de corte
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Veja o impacto de pequenas reduções no prazo.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5">
              {avoidable.map((item) => (
                <label key={item.category} className="grid gap-2">
                  <span className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-brand-900">
                      Reduzir {item.category}
                    </span>
                    <strong className="text-accent-700">
                      {formatBRL(cutAmounts[item.category] ?? 0)}/mês
                    </strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={item.total}
                    step="10"
                    value={cutAmounts[item.category] ?? 0}
                    onChange={(event) =>
                      setCutAmounts((current) => ({
                        ...current,
                        [item.category]: Number(event.target.value)
                      }))
                    }
                    className="accent-[#0F766E]"
                  />
                </label>
              ))}
            </div>
            {cutImpact ? (
              <p className="mt-5 rounded-xl bg-accent-50 p-4 font-semibold text-accent-900">
                Com esses cortes: {cutImpact.monthsSaved} meses a menos e{" "}
                {formatBRL(cutImpact.interestSaved)} economizados em juros.
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled
            title="Em breve"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 font-semibold text-white disabled:opacity-65"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </button>
        </div>
      </main>
    </div>
  );
}
