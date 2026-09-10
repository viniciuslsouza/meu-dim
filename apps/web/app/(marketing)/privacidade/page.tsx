import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Mail, ShieldCheck } from "lucide-react";

import { PrivacyBadge } from "@/components/privacy-badge";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Saiba como o Meu Dim protege seus dados e respeita seus direitos previstos na LGPD.",
  openGraph: {
    title: "Política de Privacidade | Meu Dim",
    description:
      "Como coletamos, usamos e protegemos seus dados no Meu Dim.",
    images: ["/opengraph-image"]
  }
};

const sections = [
  {
    title: "1. O que coletamos",
    content:
      "Coletamos seu e-mail quando você decide criar uma conta. Se você optar por salvar um diagnóstico, armazenamos apenas dados financeiros agregados, como totais por categoria, indicadores e resultados das simulações."
  },
  {
    title: "2. O que não coletamos",
    content:
      "Não armazenamos o PDF, CSV ou planilha original da sua fatura. Também não solicitamos nem coletamos senha bancária, número completo de cartão ou credenciais de acesso ao seu banco."
  },
  {
    title: "3. Como usamos os dados",
    content:
      "Usamos seus dados para entregar o diagnóstico solicitado, manter seu histórico quando autorizado, processar o plano adquirido e melhorar a qualidade do serviço. Não vendemos seus dados pessoais."
  },
  {
    title: "4. Base legal",
    content:
      "Tratamos dados com base no consentimento, quando você opta por salvar informações, e na execução de contrato, quando adquire um plano. Também podemos cumprir obrigações legais aplicáveis."
  },
  {
    title: "5. Seus direitos pela LGPD",
    content:
      "Você pode confirmar o tratamento, acessar, corrigir, exportar e solicitar a exclusão dos seus dados. Essas ações estarão disponíveis na conta ou poderão ser solicitadas por e-mail."
  },
  {
    title: "6. Segurança e retenção",
    content:
      "Adotamos medidas técnicas para restringir acesso e proteger os dados armazenados. Mantemos informações somente pelo período necessário para prestar o serviço ou cumprir obrigações legais."
  }
];

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-ink-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-brand-900"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-accent-300">
              <BarChart3 className="h-5 w-5" />
            </span>
            Meu Dim
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-brand-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="px-5 py-14 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <div className="mb-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-700">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
              Política de Privacidade
            </h1>
            <p className="mt-4 leading-7 text-ink-muted">
              Transparência sobre quais dados usamos e quais nunca saem do seu
              dispositivo.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Vigente desde 10 de setembro de 2026.
            </p>
          </div>

          <PrivacyBadge />

          <div className="mt-12 space-y-10">
            {sections.map(({ title, content }) => (
              <section key={title}>
                <h2 className="text-xl font-semibold text-brand-900">
                  {title}
                </h2>
                <p className="mt-3 leading-8 text-ink-muted">{content}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-ink-border bg-white p-6">
            <h2 className="text-xl font-semibold text-brand-900">
              Fale sobre seus dados
            </h2>
            <p className="mt-2 leading-7 text-ink-muted">
              Para exercer seus direitos ou tirar dúvidas, entre em contato.
            </p>
            <a
              href="mailto:contato@meudim.com.br"
              className="mt-4 inline-flex items-center gap-2 font-semibold text-accent-700 hover:text-accent-900"
            >
              <Mail className="h-4 w-4" />
              contato@meudim.com.br
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
