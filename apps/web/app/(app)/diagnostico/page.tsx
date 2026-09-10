"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Check,
  CircleDollarSign,
  Mail,
  Repeat2,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import {
  InstallmentsChart,
  OffendersChart
} from "@/components/diagnosis-charts";
import { HealthScore } from "@/components/health-score";
import { formatBRL } from "@/lib/format";
import { useStatementStore } from "@/lib/stores/statement.store";

function SaveDiagnosisDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}): React.JSX.Element | null {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  if (!open) {
    return null;
  }

  const requestMagicLink = async (): Promise<void> => {
    setStatus("sending");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
      const response = await fetch(`${apiUrl}/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Falha ao solicitar link");
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-title"
      className="fixed inset-0 z-50 grid place-items-center bg-brand-950/55 p-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-700">
            <Mail className="h-6 w-6" />
          </span>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-brand-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <div>
            <h2
              id="save-title"
              className="mt-5 text-2xl font-bold text-brand-900"
            >
              Confira seu e-mail
            </h2>
            <p className="mt-3 leading-7 text-ink-muted">
              Enviamos um link seguro para você criar sua conta e salvar este
              diagnóstico.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white"
            >
              Entendi
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void requestMagicLink();
            }}
          >
            <h2
              id="save-title"
              className="mt-5 text-2xl font-bold text-brand-900"
            >
              Salve seu diagnóstico
            </h2>
            <p className="mt-3 leading-7 text-ink-muted">
              Digite seu e-mail para receber um link de acesso. Nenhuma senha
              é necessária.
            </p>
            <label className="mt-5 grid gap-2 text-sm font-medium text-brand-900">
              Seu melhor e-mail
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                className="rounded-xl border border-ink-border px-4 py-3 outline-none focus:border-accent-700 focus:ring-2 focus:ring-accent-100"
              />
            </label>
            {status === "error" ? (
              <p role="alert" className="mt-3 text-sm text-danger-600">
                Não foi possível enviar agora. Verifique se a API está rodando
                e tente novamente.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-5 w-full rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {status === "sending" ? "Enviando…" : "Enviar link de acesso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function DiagnosisPage(): React.JSX.Element {
  const router = useRouter();
  const {
    parsedStatement,
    diagnosis,
    hasHydrated,
    clearAll
  } = useStatementStore();
  const [cancelCandidates, setCancelCandidates] = useState<string[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && (!parsedStatement || !diagnosis)) {
      router.replace("/analisar");
    }
  }, [diagnosis, hasHydrated, parsedStatement, router]);

  const monthlySavings = useMemo(() => {
    if (!diagnosis) {
      return 0;
    }

    return diagnosis.subscriptions
      .filter(({ merchantKey }) => cancelCandidates.includes(merchantKey))
      .reduce((sum, subscription) => sum + subscription.amount, 0);
  }, [cancelCandidates, diagnosis]);

  if (!hasHydrated || !parsedStatement || !diagnosis) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-page">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-accent-100 border-t-accent-700" />
          <p className="mt-4 text-sm text-ink-muted">
            Preparando seu diagnóstico…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <AppHeader
        current="Diagnóstico"
        action={
          <button
            type="button"
            onClick={() => {
              clearAll();
              router.push("/analisar");
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Analisar outra fatura</span>
            <span className="sm:hidden">Nova análise</span>
          </button>
        }
      />

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent-700">
            Diagnóstico da sua fatura
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Agora você sabe onde agir primeiro.
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            {parsedStatement.transactions.length} transações analisadas ·{" "}
            {parsedStatement.bank}
          </p>
        </div>

        <section className="rounded-[1.75rem] border border-ink-border bg-white p-6 shadow-card sm:p-8">
          <HealthScore
            score={diagnosis.healthScore}
            label={diagnosis.healthLabel}
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] border border-ink-border bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-50 text-danger-600">
                <CircleDollarSign className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-brand-900">
                  Onde vai seu dinheiro
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Clique em uma categoria para ver os estabelecimentos.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <OffendersChart offenders={diagnosis.topOffenders} />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-ink-border bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarRange className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-brand-900">
                  O que você já deve nos próximos meses
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Projeção das parcelas identificadas na fatura.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <InstallmentsChart
                forecast={diagnosis.installmentsForecast}
              />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[1.75rem] border border-ink-border bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-700">
                <Repeat2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-brand-900">
                  Assinaturas e recorrências
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Marque o que você poderia cancelar.
                </p>
              </div>
            </div>
            {monthlySavings > 0 ? (
              <div className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-900">
                Economia possível:{" "}
                <strong>{formatBRL(monthlySavings)}/mês</strong>
                <span className="block text-xs">
                  {formatBRL(monthlySavings * 12)} por ano
                </span>
              </div>
            ) : null}
          </div>

          {diagnosis.subscriptions.length > 0 ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {diagnosis.subscriptions.map((subscription) => {
                const canCancel = cancelCandidates.includes(
                  subscription.merchantKey
                );

                return (
                  <div
                    key={subscription.merchantKey}
                    className="flex items-center gap-4 rounded-2xl border border-ink-border p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 font-bold text-brand-600">
                      {subscription.displayName.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-brand-900">
                        {subscription.displayName}
                      </p>
                      <p className="text-sm tabular-nums text-ink-muted">
                        {formatBRL(subscription.amount)}/mês
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={canCancel}
                      aria-label={`${subscription.displayName}: ${
                        canCancel ? "posso cancelar" : "uso regularmente"
                      }`}
                      onClick={() =>
                        setCancelCandidates((current) =>
                          canCancel
                            ? current.filter(
                                (key) => key !== subscription.merchantKey
                              )
                            : [...current, subscription.merchantKey]
                        )
                      }
                      className={[
                        "ml-auto flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition",
                        canCancel ? "bg-accent-700" : "bg-surface-muted"
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow-sm transition",
                          canCancel ? "translate-x-5" : ""
                        ].join(" ")}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-ink-muted">
              Nenhuma assinatura recorrente foi identificada nesta fatura.
            </p>
          )}
        </section>

        {diagnosis.totalInterestPaid > 0 ? (
          <section className="mt-6 flex items-start gap-4 rounded-[1.5rem] border border-warn-600 bg-warn-50 p-5 sm:p-6">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-warn-600" />
            <div>
              <h2 className="font-semibold text-warn-700">
                O custo dos juros merece atenção
              </h2>
              <p className="mt-2 leading-7 text-warn-700">
                Você pagou{" "}
                <strong>{formatBRL(diagnosis.totalInterestPaid)}</strong> em
                juros nesta fatura. Se mantiver esse ritmo:{" "}
                <strong>
                  {formatBRL(diagnosis.totalInterestPaid * 12)}
                </strong>{" "}
                em 12 meses.
              </p>
            </div>
          </section>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-accent-700 bg-accent-50 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-700">
                <Check className="h-4 w-4" />
                Próximo passo
              </span>
              <h2 className="mt-3 text-2xl font-bold text-brand-900 sm:text-3xl">
                Pronto para sair da dívida?
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-ink-muted">
                Monte seu plano de quitação e veja a data em que você vai
                zerar.
              </p>
            </div>
            <Link
              href="/plano"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-700 px-6 py-3.5 font-semibold text-white transition hover:bg-accent-900 md:w-auto"
            >
              Montar meu plano
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setSaveDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:border-brand-400"
          >
            <Save className="h-4 w-4" />
            Salvar este diagnóstico
          </button>
        </div>
      </main>

      <SaveDiagnosisDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />
    </div>
  );
}
