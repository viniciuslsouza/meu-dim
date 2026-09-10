"use client";

import type { Category, RawTransaction } from "@meudim/shared";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatBRL } from "@/lib/format";

export const CATEGORIES: Category[] = [
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
];

interface TransactionTableProps {
  transactions: RawTransaction[];
  editedTransactionIds: string[];
  onCategoryChange: (txId: string, category: Category) => void;
}

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

export function TransactionTable({
  transactions,
  editedTransactionIds,
  onCategoryChange
}: TransactionTableProps): React.JSX.Element {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return transactions.slice(start, start + PAGE_SIZE).map((transaction, index) => ({
      transaction,
      globalIndex: start + index
    }));
  }, [page, transactions]);

  const total = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-ink-border bg-white shadow-card">
      <div className="flex flex-col gap-2 border-b border-ink-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-brand-900">
            Transações encontradas
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Revise as categorias antes de continuar.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            Total identificado
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-900">
            {formatBRL(total)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-6 py-3.5">Data</th>
              <th className="px-4 py-3.5">Descrição</th>
              <th className="px-4 py-3.5">Categoria</th>
              <th className="px-6 py-3.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border">
            {rows.map(({ transaction, globalIndex }) => {
              const txId = String(globalIndex);
              const edited = editedTransactionIds.includes(txId);

              return (
                <tr key={`${transaction.date}-${transaction.merchantKey}-${globalIndex}`}>
                  <td className="whitespace-nowrap px-6 py-4 text-ink-muted">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="max-w-[260px] px-4 py-4">
                    <span
                      title={transaction.description}
                      className="block truncate font-medium text-brand-900"
                    >
                      {transaction.description.slice(0, 40)}
                    </span>
                    {transaction.installments ? (
                      <span className="mt-1 block text-xs text-ink-muted">
                        Parcela {transaction.installment}/
                        {transaction.installments}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Categoria de ${transaction.description}`}
                        value={transaction.category}
                        onChange={(event) =>
                          onCategoryChange(
                            txId,
                            event.target.value as Category
                          )
                        }
                        className="max-w-[220px] rounded-lg border border-ink-border bg-white px-3 py-2 text-sm text-brand-900 outline-none focus:border-accent-700 focus:ring-2 focus:ring-accent-100"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {edited ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-1 text-[10px] font-bold uppercase text-warn-700">
                          <Pencil className="h-3 w-3" />
                          editado
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-brand-900">
                    {formatBRL(transaction.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-ink-border px-5 py-4 text-sm sm:px-6">
        <span className="text-ink-muted">
          {transactions.length} transações · Página {page} de {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-border text-brand-900 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-border text-brand-900 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
