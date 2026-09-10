"use client";

import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { apiRequest, setAccessToken } from "@/lib/api";

function AuthCallbackContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    void apiRequest<{ accessToken: string }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token })
    })
      .then(({ accessToken }) => {
        setAccessToken(accessToken);
        setStatus("success");
        const returnTo =
          window.sessionStorage.getItem("meudim-auth-return-to") ?? "/plano";

        window.sessionStorage.removeItem("meudim-auth-return-to");
        window.setTimeout(() => router.replace(returnTo), 700);
      })
      .catch(() => setStatus("error"));
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-surface-page p-5">
      <div className="w-full max-w-md rounded-3xl border border-ink-border bg-white p-8 text-center shadow-card">
        {status === "loading" ? (
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-accent-700" />
        ) : status === "success" ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent-700" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-danger-600" />
        )}
        <h1 className="mt-5 text-2xl font-bold text-brand-900">
          {status === "loading"
            ? "Validando seu acesso…"
            : status === "success"
              ? "Acesso confirmado!"
              : "Este link não é válido"}
        </h1>
        <p className="mt-3 text-ink-muted">
          {status === "error"
            ? "Solicite um novo link para continuar."
            : "Você será redirecionado em instantes."}
        </p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-surface-page text-ink-muted">
          Validando seu acesso…
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
