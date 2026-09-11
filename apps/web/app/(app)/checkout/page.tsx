"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { apiRequest } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { getSelectedDebts, usePlanStore } from "@/lib/stores/plan.store";

function formatRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(
    2,
    "0"
  )}`;
}

function CheckoutPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    checkout,
    debts,
    selectedDebtIds,
    monthlyBudget,
    chosenStrategy,
    savedPlanId,
    setCheckoutStatus,
    setSavedPlanId
  } = usePlanStore();
  const selectedDebts = useMemo(
    () => getSelectedDebts(debts, selectedDebtIds),
    [debts, selectedDebtIds]
  );
  const paymentId = searchParams.get("paymentId") ?? checkout?.paymentId;
  const stripeSuccess = searchParams.get("success") === "true";
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const paymentQuery = useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: () =>
      apiRequest<{ status: "PENDING" | "PAID" }>(
        `/payments/${paymentId}/status`
      ),
    enabled:
      Boolean(paymentId) &&
      !checkout?.demo &&
      !stripeSuccess &&
      checkout?.status !== "PAID",
    refetchInterval: 3_000,
    retry: 1
  });

  const status =
    stripeSuccess || checkout?.status === "PAID"
      ? "PAID"
      : paymentQuery.data?.status ?? checkout?.status ?? "PENDING";
  const secondsRemaining = Math.max(
    0,
    Math.floor(
      (new Date(checkout?.expiresAt ?? Date.now()).getTime() - now) / 1000
    )
  );
  const expired = status !== "PAID" && secondsRemaining === 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paymentQuery.data?.status === "PAID") {
      setCheckoutStatus("PAID");
    }
  }, [paymentQuery.data?.status, setCheckoutStatus]);

  useEffect(() => {
    if (
      status !== "PAID" ||
      savedPlanId ||
      unlocking ||
      selectedDebts.length === 0
    ) {
      return;
    }

    setUnlocking(true);
    if (checkout?.demo || stripeSuccess) {
      setSavedPlanId(`demo-${crypto.randomUUID()}`);
      setUnlocking(false);
      return;
    }

    void apiRequest<{ id: string }>("/plans", {
      method: "POST",
      body: JSON.stringify({
        debts: selectedDebts.map(({ id: _id, ...debt }) => debt),
        monthlyBudget,
        chosenStrategy
      })
    })
      .then(({ id }) => setSavedPlanId(id))
      .finally(() => setUnlocking(false));
  }, [
    checkout?.demo,
    chosenStrategy,
    monthlyBudget,
    savedPlanId,
    selectedDebts,
    setSavedPlanId,
    status,
    stripeSuccess,
    unlocking
  ]);

  const pixPattern = useMemo(
    () =>
      Array.from({ length: 121 }, (_, index) => {
        const seed = (paymentId?.charCodeAt(index % (paymentId.length || 1)) ?? 7);

        return (seed + index * 7) % 3 === 0;
      }),
    [paymentId]
  );

  if (status === "PAID") {
    return (
      <div className="min-h-screen bg-surface-page">
        <AppHeader current="Pagamento confirmado" />
        <main className="grid min-h-[75vh] place-items-center px-5 py-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-accent-100 bg-white p-8 text-center shadow-soft sm:p-12">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent-50 text-accent-700">
              <CheckCircle2 className="h-11 w-11" />
            </span>
            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-accent-700">
              Tudo certo
            </p>
            <h1 className="mt-3 text-3xl font-bold text-brand-900">
              Pagamento confirmado!
            </h1>
            <p className="mx-auto mt-4 max-w-md leading-7 text-ink-muted">
              Seu plano completo foi desbloqueado e o cronograma já está
              pronto.
            </p>
            <button
              type="button"
              disabled={!savedPlanId || unlocking}
              onClick={() => router.push(`/plano/${savedPlanId}`)}
              className="mt-7 w-full rounded-xl bg-accent-700 px-6 py-3.5 font-semibold text-white disabled:opacity-50"
            >
              {unlocking ? "Preparando seu plano…" : "Ver meu plano completo →"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <AppHeader current="Pagamento via Pix" />
      <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_.82fr]">
          <section className="rounded-[2rem] border border-ink-border bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-accent-700">
                  Plano completo
                </p>
                <h1 className="mt-1 text-2xl font-bold text-brand-900">
                  Pague com Pix
                </h1>
              </div>
              <strong className="text-2xl text-brand-900">
                {formatBRL(39)}
              </strong>
            </div>

            <div className="mx-auto mt-7 w-fit rounded-2xl border-8 border-white bg-white p-2 shadow-card">
              <div className="grid h-52 w-52 grid-cols-11 bg-brand-50 p-2">
                {pixPattern.map((filled, index) => (
                  <span
                    key={index}
                    className={filled ? "bg-brand-950" : "bg-white"}
                  />
                ))}
              </div>
            </div>
            {checkout?.demo ? (
              <p className="mt-3 text-center text-xs font-semibold text-warn-700">
                QR Code demonstrativo — não realize um pagamento real.
              </p>
            ) : null}

            <label className="mt-6 block text-sm font-medium text-brand-900">
              Código Pix copia e cola
              <div className="mt-2 flex overflow-hidden rounded-xl border border-ink-border">
                <input
                  readOnly
                  value={checkout?.qrCode ?? paymentId ?? ""}
                  className="min-w-0 flex-1 bg-brand-50 px-4 py-3 text-xs text-ink-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      checkout?.qrCode ?? paymentId ?? ""
                    );
                    setCopied(true);
                  }}
                  className="inline-flex items-center gap-2 border-l border-ink-border px-4 text-sm font-semibold text-brand-900"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </label>
          </section>

          <aside className="rounded-[2rem] border border-ink-border bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-50 text-accent-700">
                {expired ? (
                  <Clock3 className="h-5 w-5" />
                ) : (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                )}
              </span>
              <div>
                <p className="font-semibold text-brand-900">
                  {expired ? "Código expirado" : "Aguardando pagamento…"}
                </p>
                <p className="text-sm tabular-nums text-ink-muted">
                  {formatRemaining(secondsRemaining)}
                </p>
              </div>
            </div>
            <ol className="mt-7 grid gap-4 text-sm leading-6 text-ink-muted">
              <li className="flex gap-3">
                <strong className="text-brand-900">1.</strong>
                Abra o aplicativo do seu banco.
              </li>
              <li className="flex gap-3">
                <strong className="text-brand-900">2.</strong>
                Escolha Pix e depois Ler QR Code.
              </li>
              <li className="flex gap-3">
                <strong className="text-brand-900">3.</strong>
                Confirme o valor e conclua.
              </li>
            </ol>
            {checkout?.demo && !expired ? (
              <button
                type="button"
                onClick={() => setCheckoutStatus("PAID")}
                className="mt-7 w-full rounded-xl bg-accent-700 px-5 py-3 font-semibold text-white"
              >
                Simular pagamento confirmado
              </button>
            ) : null}
            {expired ? (
              <button
                type="button"
                onClick={() => router.push("/plano")}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 font-semibold text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar novo QR Code
              </button>
            ) : null}
            <p className="mt-7 flex items-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-accent-700" />
              Confirmação automática e segura.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-surface-page text-ink-muted">
          Preparando checkout…
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
