"use client";

import {
  calcPMT,
  compareRefinance,
  simulateBoth,
  simulatePayoff,
  type Debt
} from "@meudim/shared";
import { AlertTriangle, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { formatBRL, formatMonth } from "@/lib/format";

function Field({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number;
}): React.JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-semibold text-brand-900">
      {label}
      <div className="relative">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-xl border border-ink-border bg-white px-4 py-3 pr-14 text-base font-medium outline-none focus:border-accent-700 focus:ring-2 focus:ring-accent-100"
        />
        {suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function ResultCard({
  label,
  value,
  detail,
  danger = false
}: {
  label: string;
  value: string;
  detail?: string;
  danger?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={[
        "rounded-2xl border p-5",
        danger
          ? "border-danger-100 bg-danger-50"
          : "border-ink-border bg-white"
      ].join(" ")}
    >
      <p className="text-sm text-ink-muted">{label}</p>
      <strong
        className={[
          "mt-2 block text-2xl tracking-tight",
          danger ? "text-danger-600" : "text-brand-900"
        ].join(" ")}
      >
        {value}
      </strong>
      {detail ? <p className="mt-2 text-xs text-ink-muted">{detail}</p> : null}
    </div>
  );
}

export function RotativoCalculator(): React.JSX.Element {
  const [balance, setBalance] = useState(2000);
  const [rate, setRate] = useState(14);
  const periods = [1, 3, 6, 12];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Saldo devedor"
          value={balance}
          onChange={setBalance}
          suffix="R$"
          step={100}
        />
        <Field
          label="Taxa mensal"
          value={rate}
          onChange={setRate}
          suffix="% a.m."
          step={0.1}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {periods.map((months) => {
          const total = balance * Math.pow(1 + rate / 100, months);
          const interest = total - balance;

          return (
            <ResultCard
              key={months}
              danger
              label={`Após ${months} ${months === 1 ? "mês" : "meses"}`}
              value={formatBRL(total)}
              detail={`${formatBRL(interest)} somente em juros`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function QuitacaoCalculator(): React.JSX.Element {
  const [balance, setBalance] = useState(5000);
  const [rate, setRate] = useState(14);
  const [payment, setPayment] = useState(1000);
  const result = useMemo(
    () =>
      simulatePayoff(
        [
          {
            id: "cartao",
            name: "Cartão",
            type: "CREDIT_CARD",
            balance,
            monthlyRate: rate / 100,
            minimumPayment: payment
          }
        ],
        payment,
        "AVALANCHE"
      ),
    [balance, payment, rate]
  );

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Saldo devedor" value={balance} onChange={setBalance} suffix="R$" step={100} />
        <Field label="Taxa mensal" value={rate} onChange={setRate} suffix="% a.m." step={0.1} />
        <Field label="Pagamento mensal" value={payment} onChange={setPayment} suffix="R$" step={50} />
      </div>
      {result.infeasible ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-danger-100 bg-danger-50 p-5 text-danger-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            <strong>Nunca:</strong> esse pagamento não reduz a dívida. Os juros
            mensais são maiores do que o valor pago.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ResultCard label="Tempo para quitar" value={`${result.months} meses`} detail={formatMonth(result.payoffDate)} />
          <ResultCard label="Total de juros" value={formatBRL(result.totalInterest)} />
          <ResultCard label="Total pago" value={formatBRL(result.totalPaid)} />
        </div>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <caption className="sr-only">
            Prazo estimado conforme o pagamento mensal
          </caption>
          <thead className="bg-brand-50 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3">Se pagar</th>
              <th className="px-4 py-3">Quita em</th>
              <th className="px-4 py-3">Juros totais</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border">
            {[payment, payment + 250, payment + 500].map((candidate) => {
              const scenario = simulatePayoff(
                [
                  {
                    id: "cartao",
                    name: "Cartão",
                    type: "CREDIT_CARD",
                    balance,
                    monthlyRate: rate / 100,
                    minimumPayment: candidate
                  }
                ],
                candidate,
                "AVALANCHE"
              );

              return (
                <tr key={candidate}>
                  <td className="px-4 py-3 font-semibold text-brand-900">
                    {formatBRL(candidate)}/mês
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {scenario.infeasible
                      ? "Nunca — não cobre os juros"
                      : `${scenario.months} meses`}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">
                    {scenario.infeasible
                      ? "—"
                      : formatBRL(scenario.totalInterest)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ParcelamentoCalculator(): React.JSX.Element {
  const [invoice, setInvoice] = useState(3000);
  const [installmentRate, setInstallmentRate] = useState(8);
  const [months, setMonths] = useState(12);
  const [revolvingRate, setRevolvingRate] = useState(14);
  const installment = calcPMT(invoice, installmentRate / 100, months);
  const installmentTotal = installment * months;
  const revolvingMonthInterest = invoice * (revolvingRate / 100);
  const revolvingAfterThree = invoice * Math.pow(1 + revolvingRate / 100, 3);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Valor não pago" value={invoice} onChange={setInvoice} suffix="R$" step={100} />
        <div>
          <Field label="Taxa do parcelamento" value={installmentRate} onChange={setInstallmentRate} suffix="% a.m." step={0.1} />
          <button
            type="button"
            onClick={() => setInstallmentRate(8)}
            className="mt-2 text-left text-xs font-semibold text-accent-700"
          >
            Usar média: 8% ao mês
          </button>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-brand-900">
          Prazo
          <select
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
            className="rounded-xl border border-ink-border bg-white px-4 py-3"
          >
            {[3, 6, 12, 18, 24].map((value) => (
              <option key={value} value={value}>{value} meses</option>
            ))}
          </select>
        </label>
        <Field label="Taxa do rotativo" value={revolvingRate} onChange={setRevolvingRate} suffix="% a.m." step={0.1} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-danger-100 bg-danger-50 p-5">
          <p className="font-semibold text-danger-700">Continuar no rotativo</p>
          <strong className="mt-3 block text-2xl text-danger-600">
            {formatBRL(revolvingAfterThree)}
          </strong>
          <p className="mt-2 text-sm text-ink-muted">
            Após 3 meses · {formatBRL(revolvingMonthInterest)} de juros já no primeiro mês
          </p>
        </div>
        <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5">
          <p className="font-semibold text-accent-900">Parcelar a fatura</p>
          <strong className="mt-3 block text-2xl text-brand-900">
            {months}× de {formatBRL(installment)}
          </strong>
          <p className="mt-2 text-sm text-ink-muted">
            Total {formatBRL(installmentTotal)} · juros {formatBRL(installmentTotal - invoice)}
          </p>
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-900">
        Veredicto: parcelar é mais barato se a taxa for menor que{" "}
        {revolvingRate.toFixed(1)}% ao mês.
      </p>
    </div>
  );
}

export function EmprestimoCalculator(): React.JSX.Element {
  const [balance, setBalance] = useState(8000);
  const [cardRate, setCardRate] = useState(14);
  const [loanRate, setLoanRate] = useState(3.5);
  const [months, setMonths] = useState(24);
  const [currentPayment, setCurrentPayment] = useState(1500);
  const debt: Debt = {
    id: "cartao",
    name: "Cartão",
    type: "CREDIT_CARD",
    balance,
    monthlyRate: cardRate / 100,
    minimumPayment: currentPayment
  };
  const card = simulatePayoff([debt], currentPayment, "AVALANCHE");
  const comparison = compareRefinance(
    [debt],
    currentPayment,
    loanRate / 100,
    months
  );
  const loanTotal = balance + comparison.loanCost;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Dívida no cartão" value={balance} onChange={setBalance} suffix="R$" step={100} />
        <Field label="Taxa do cartão" value={cardRate} onChange={setCardRate} suffix="% a.m." step={0.1} />
        <Field label="Taxa do empréstimo" value={loanRate} onChange={setLoanRate} suffix="% a.m." step={0.1} />
        <Field label="Prazo" value={months} onChange={setMonths} suffix="meses" min={1} />
        <Field label="Pagamento atual" value={currentPayment} onChange={setCurrentPayment} suffix="R$" step={50} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-border bg-white p-5">
          <p className="font-semibold text-brand-900">Continuar no cartão</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <span><strong className="block">{card.infeasible ? "Nunca" : `${card.months} meses`}</strong>prazo</span>
            <span><strong className="block">{formatBRL(card.totalInterest)}</strong>juros</span>
            <span><strong className="block">{formatBRL(card.totalPaid)}</strong>total</span>
          </div>
        </div>
        <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5">
          <p className="font-semibold text-accent-900">Empréstimo pessoal</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <span><strong className="block">{formatBRL(comparison.loanMonthlyPayment)}</strong>parcela</span>
            <span><strong className="block">{formatBRL(comparison.loanCost)}</strong>juros</span>
            <span><strong className="block">{formatBRL(loanTotal)}</strong>total</span>
          </div>
        </div>
      </div>
      <p className={[
        "mt-5 rounded-xl p-4 font-semibold",
        comparison.savings > 0 ? "bg-accent-50 text-accent-900" : "bg-danger-50 text-danger-700"
      ].join(" ")}>
        {comparison.savings > 0
          ? `Você pode economizar ${formatBRL(comparison.savings)}.`
          : `O empréstimo custa ${formatBRL(Math.abs(comparison.savings))} a mais.`}
      </p>
      {!comparison.affordsLoan ? (
        <p className="mt-3 text-sm text-danger-600">
          A parcela de {formatBRL(comparison.loanMonthlyPayment)} é maior do que
          você paga hoje. Confirme se cabe no orçamento.
        </p>
      ) : null}
    </div>
  );
}

export function EstrategiaCalculator(): React.JSX.Element {
  const [debts, setDebts] = useState<Debt[]>([
    { id: "cartao-a", name: "Cartão A", type: "CREDIT_CARD", balance: 4000, monthlyRate: 0.14, minimumPayment: 500 },
    { id: "emprestimo", name: "Empréstimo", type: "LOAN", balance: 7000, monthlyRate: 0.035, minimumPayment: 450 }
  ]);
  const [budget, setBudget] = useState(1400);
  const [tab, setTab] = useState<"snowball" | "avalanche">("avalanche");
  const simulation = useMemo(() => simulateBoth(debts, budget), [budget, debts]);
  const result = simulation[tab];
  const firstPaidMonth = (payoff: typeof result): number | null => {
    const firstId = payoff.debtOrder[0];

    if (payoff.infeasible || !firstId) {
      return null;
    }

    const row = payoff.schedule.find((entry) => {
      const debt = entry.debts.find((item) => item.id === firstId);
      return Boolean(debt && debt.balance <= 0.01);
    });

    return row?.month ?? payoff.months;
  };
  const snowballFirst = firstPaidMonth(simulation.snowball);
  const avalancheFirst = firstPaidMonth(simulation.avalanche);
  const snowballLead =
    snowballFirst !== null && avalancheFirst !== null
      ? Math.max(0, avalancheFirst - snowballFirst)
      : 0;

  const update = (id: string, key: "name" | "balance" | "monthlyRate" | "minimumPayment", value: string): void => {
    setDebts((current) =>
      current.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              [key]:
                key === "name"
                  ? value
                  : key === "monthlyRate"
                    ? Number(value) / 100
                    : Number(value)
            }
          : debt
      )
    );
  };

  return (
    <div>
      <div className="grid gap-3">
        {debts.map((debt) => (
          <div key={debt.id} className="grid gap-3 rounded-2xl border border-ink-border bg-white p-4 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <input aria-label="Nome da dívida" placeholder="Nome" value={debt.name} onChange={(event) => update(debt.id!, "name", event.target.value)} className="rounded-lg border border-ink-border px-3 py-2" />
            <input aria-label={`Saldo de ${debt.name}`} type="number" placeholder="Saldo (R$)" value={debt.balance} onChange={(event) => update(debt.id!, "balance", event.target.value)} className="rounded-lg border border-ink-border px-3 py-2" />
            <input aria-label={`Taxa de ${debt.name}`} type="number" step="0.1" placeholder="Taxa % a.m." value={debt.monthlyRate * 100} onChange={(event) => update(debt.id!, "monthlyRate", event.target.value)} className="rounded-lg border border-ink-border px-3 py-2" />
            <input aria-label={`Mínimo de ${debt.name}`} type="number" placeholder="Mínimo (R$)" value={debt.minimumPayment} onChange={(event) => update(debt.id!, "minimumPayment", event.target.value)} className="rounded-lg border border-ink-border px-3 py-2" />
            <button type="button" aria-label={`Remover ${debt.name}`} onClick={() => setDebts((current) => current.filter((item) => item.id !== debt.id))} className="grid h-10 w-10 place-items-center rounded-lg text-danger-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={debts.length >= 5}
        onClick={() => setDebts((current) => [...current, { id: crypto.randomUUID(), name: `Dívida ${current.length + 1}`, type: "OTHER", balance: 1000, monthlyRate: 0.05, minimumPayment: 100 }])}
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" /> Adicionar dívida
      </button>
      <div className="mt-5 max-w-xs">
        <Field label="Orçamento mensal total" value={budget} onChange={setBudget} suffix="R$" step={50} />
      </div>
      <div className="mt-6 flex rounded-xl bg-brand-50 p-1">
        {(["snowball", "avalanche"] as const).map((strategy) => (
          <button key={strategy} type="button" onClick={() => setTab(strategy)} className={["flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold", tab === strategy ? "bg-brand-900 text-white" : "text-ink-muted"].join(" ")}>
            {strategy === "snowball" ? "Bola de Neve" : "Avalanche"}
          </button>
        ))}
      </div>
      {result.infeasible ? (
        <p className="mt-5 rounded-xl bg-danger-50 p-4 text-danger-700">O orçamento não cobre os pagamentos mínimos ou os juros.</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ResultCard label="Tempo para quitar" value={`${result.months} meses`} detail={formatMonth(result.payoffDate)} />
          <ResultCard label="Total de juros" value={formatBRL(result.totalInterest)} />
          <ResultCard label="Ordem" value={result.debtOrder.map((id) => debts.find((debt) => debt.id === id)?.name ?? id).join(" → ")} />
        </div>
      )}
      <div className="mt-5 grid gap-3">
        <p className="flex items-start gap-2 rounded-xl bg-accent-50 p-4 font-semibold text-accent-900">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
          Avalanche economiza{" "}
          {formatBRL(
            Math.max(
              0,
              simulation.snowball.totalInterest -
                simulation.avalanche.totalInterest
            )
          )}{" "}
          em juros a mais que Bola de Neve.
        </p>
        <p className="rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-900">
          {snowballLead > 0
            ? `Bola de Neve quita a primeira dívida ${snowballLead} ${snowballLead === 1 ? "mês" : "meses"} antes — melhor para a motivação.`
            : "Bola de Neve prioriza o menor saldo para gerar a primeira quitação mais cedo. Avalanche prioriza a maior taxa."}
        </p>
      </div>
    </div>
  );
}
