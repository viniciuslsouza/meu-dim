"use client";

import { Mail, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { apiRequest } from "@/lib/api";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onDemo?: () => void;
}

export function AuthModal({
  open,
  onClose,
  onDemo
}: AuthModalProps): React.JSX.Element | null {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="fixed inset-0 z-50 grid place-items-center bg-brand-950/60 p-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-700">
            <Mail className="h-6 w-6" />
          </span>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-brand-50"
          >
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>

        {status === "sent" ? (
          <>
            <h2 id="auth-title" className="mt-5 text-2xl font-bold text-brand-900">
              Verifique seu e-mail
            </h2>
            <p className="mt-3 leading-7 text-ink-muted">
              Enviamos um link seguro. Abra-o neste navegador para continuar o
              pagamento.
            </p>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setStatus("sending");
              window.sessionStorage.setItem(
                "meudim-auth-return-to",
                "/plano?continuarPagamento=true"
              );
              void apiRequest("/auth/magic-link", {
                method: "POST",
                body: JSON.stringify({ email })
              })
                .then(() => setStatus("sent"))
                .catch(() => setStatus("error"));
            }}
          >
            <h2 id="auth-title" className="mt-5 text-2xl font-bold text-brand-900">
              Salve seu plano para continuar
            </h2>
            <p className="mt-3 leading-7 text-ink-muted">
              Crie sua conta com um link de acesso. Sem senha e sem dados
              bancários.
            </p>
            <label className="mt-5 grid gap-2 text-sm font-medium text-brand-900">
              E-mail
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
              <p className="mt-3 text-sm text-danger-600">
                A API não respondeu. Você pode continuar no modo demonstrativo.
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

        {onDemo ? (
          <button
            type="button"
            onClick={onDemo}
            className="mt-3 w-full rounded-xl border border-ink-border px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Continuar com pagamento simulado
          </button>
        ) : null}
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <ShieldCheck className="h-4 w-4 text-accent-700" />
          Seus dados são protegidos pela LGPD.
        </p>
      </div>
    </div>
  );
}
