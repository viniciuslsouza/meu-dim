"use client";

import type { ParsedStatement } from "@meudim/shared";
import {
  AlertTriangle,
  ArrowRight,
  FileQuestion,
  LoaderCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppHeader } from "@/components/app-header";
import { PrivacyBadge } from "@/components/privacy-badge";
import { StatementDropzone } from "@/components/statement-dropzone";
import { TransactionTable } from "@/components/transaction-table";
import { useStatementStore } from "@/lib/stores/statement.store";

function ParsingSkeleton(): React.JSX.Element {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-ink-border bg-white p-6">
      <div className="flex items-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-accent-700" />
        <p className="font-semibold text-brand-900">
          Lendo e organizando sua fatura…
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid animate-pulse grid-cols-[70px_1fr_130px_90px] gap-4"
          >
            <span className="h-9 rounded-lg bg-surface-muted" />
            <span className="h-9 rounded-lg bg-surface-muted" />
            <span className="h-9 rounded-lg bg-surface-muted" />
            <span className="h-9 rounded-lg bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualEntry({
  onSubmit
}: {
  onSubmit: (statement: ParsedStatement) => void;
}): React.JSX.Element {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <form
      className="mt-6 grid gap-4 rounded-2xl bg-brand-50 p-5 sm:grid-cols-[1fr_160px_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const value = Number(amount.replace(",", "."));

        if (!description.trim() || !Number.isFinite(value) || value <= 0) {
          return;
        }

        const now = new Date();
        const month = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;
        onSubmit({
          bank: "GENERIC",
          referenceMonth: month,
          total: value,
          transactions: [
            {
              date: now.toISOString().slice(0, 10),
              description: description.trim(),
              merchantKey: description.trim().toUpperCase(),
              amount: value,
              category: "Outros",
              isRecurring: false
            }
          ],
          warnings: [
            "Dados inseridos manualmente; revise as informações."
          ]
        });
      }}
    >
      <label className="grid gap-1.5 text-sm font-medium text-brand-900">
        Descrição
        <input
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: Total da fatura"
          className="rounded-xl border border-ink-border bg-white px-3 py-2.5 outline-none focus:border-accent-700"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-brand-900">
        Valor
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0,00"
          className="rounded-xl border border-ink-border bg-white px-3 py-2.5 outline-none focus:border-accent-700"
        />
      </label>
      <button
        type="submit"
        className="self-end rounded-xl bg-brand-900 px-5 py-2.5 font-semibold text-white"
      >
        Adicionar
      </button>
    </form>
  );
}

export default function AnalyzePage(): React.JSX.Element {
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const {
    file,
    parsedStatement,
    parseStatus,
    parseWarnings,
    editedTransactionIds,
    setFile,
    setParsed,
    setParseStatus,
    setParseWarnings,
    updateTransactionCategory,
    clearAll
  } = useStatementStore();

  const processFile = async (selectedFile: File): Promise<void> => {
    setFile(selectedFile);
    setParseStatus("parsing");

    try {
      const { parseStatement } = await import("@/lib/parse-statement");
      const parsed = await parseStatement(selectedFile);

      if (parsed.transactions.length === 0) {
        setParseWarnings(parsed.warnings);
        setParseStatus("failed");
        return;
      }

      setParsed(parsed);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível interpretar o arquivo.";

      setParseWarnings([message]);
      setParseStatus("failed");
    }
  };

  const isParsed =
    (parseStatus === "success" || parseStatus === "partial") &&
    parsedStatement;

  return (
    <div className="min-h-screen bg-surface-page">
      <AppHeader current="Analisar fatura" />
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">
            Diagnóstico gratuito
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Envie sua fatura
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-ink-muted">
            Nós organizamos suas compras e mostramos onde estão as melhores
            oportunidades de economia.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <StatementDropzone
            file={file}
            disabled={parseStatus === "parsing"}
            onFile={(selected) => void processFile(selected)}
          />
          <div className="mt-4">
            <PrivacyBadge compact />
          </div>
        </div>

        {parseStatus === "parsing" ? <ParsingSkeleton /> : null}

        {parseStatus === "failed" ? (
          <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-danger-100 bg-white p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-50 text-danger-600">
              <FileQuestion className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-brand-900">
              Não conseguimos ler este arquivo automaticamente.
            </h2>
            <p className="mt-2 leading-7 text-ink-muted">
              O formato pode ser diferente do padrão do banco. Nenhum dado foi
              enviado.
            </p>
            {parseWarnings.length > 0 ? (
              <p className="mt-3 rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
                {parseWarnings[0]}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Tentar outro arquivo
              </button>
              <button
                type="button"
                onClick={() => setShowManual((current) => !current)}
                className="rounded-xl border border-ink-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-900"
              >
                Entrar manualmente
              </button>
              <a
                href="mailto:contato@meudim.com.br?subject=Problema%20ao%20ler%20fatura"
                className="px-2 py-2.5 text-sm font-semibold text-accent-700"
              >
                Reportar problema com este banco
              </a>
            </div>
            {showManual ? <ManualEntry onSubmit={setParsed} /> : null}
          </section>
        ) : null}

        {isParsed ? (
          <div className="mt-8">
            {parseStatus === "partial" ? (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-warn-100 bg-warn-50 p-4 text-sm leading-6 text-warn-700"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <strong>
                    {parseWarnings.length} aviso
                    {parseWarnings.length === 1 ? "" : "s"} durante a leitura.
                  </strong>{" "}
                  Revise as transações abaixo antes de continuar.
                </div>
              </div>
            ) : null}
            <TransactionTable
              transactions={parsedStatement.transactions}
              editedTransactionIds={editedTransactionIds}
              onCategoryChange={updateTransactionCategory}
            />
            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-accent-100 bg-accent-50 p-5 sm:flex-row">
              <div>
                <p className="font-semibold text-brand-900">
                  Tudo certo com as categorias?
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Seu diagnóstico já está pronto e fica somente nesta sessão.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/diagnostico")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-700 px-6 py-3.5 font-semibold text-white transition hover:bg-accent-900 sm:w-auto"
              >
                Ver meu diagnóstico
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
