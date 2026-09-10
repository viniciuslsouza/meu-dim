import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  FileCheck2,
  Mail
} from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Leia os termos para uso dos diagnósticos e simulações educativas do Meu Dim.",
  openGraph: {
    title: "Termos de Uso | Meu Dim",
    description: "Condições para usar os serviços e simulações do Meu Dim.",
    images: ["/opengraph-image"]
  }
};

const sections = [
  {
    title: "1. Sobre o serviço",
    content:
      "O Meu Dim oferece ferramentas educativas para organizar informações da fatura, identificar padrões de gastos e simular estratégias de pagamento de dívidas. O serviço não substitui orientação de profissional financeiro, jurídico ou contábil."
  },
  {
    title: "2. Simulações e decisões",
    content:
      "Os resultados são estimativas baseadas nos dados informados e em premissas matemáticas. Taxas, tarifas e condições reais podem variar. Você é responsável por avaliar qualquer decisão financeira e confirmar condições diretamente com a instituição credora."
  },
  {
    title: "3. Uso permitido",
    content:
      "Você pode usar o serviço para fins pessoais e lícitos. É proibido tentar acessar sistemas sem autorização, interferir no funcionamento da plataforma, inserir conteúdo malicioso, revender resultados ou explorar comercialmente o serviço sem permissão."
  },
  {
    title: "4. Conta e informações",
    content:
      "Você é responsável pela veracidade das informações fornecidas e pela segurança do acesso ao seu e-mail. Podemos suspender contas usadas em desacordo com estes termos ou com a legislação."
  },
  {
    title: "5. Pagamentos e reembolso",
    content:
      "Os preços são exibidos antes da contratação. Você pode pedir reembolso do plano completo em até 7 dias corridos após a compra, pelo e-mail de contato, respeitadas as regras do meio de pagamento."
  },
  {
    title: "6. Limitação de responsabilidade",
    content:
      "Na extensão permitida pela lei, o Meu Dim não responde por perdas decorrentes de decisões tomadas exclusivamente com base nas simulações, indisponibilidades de terceiros ou dados incorretos fornecidos pelo usuário."
  },
  {
    title: "7. Alterações",
    content:
      "Podemos atualizar estes termos para refletir melhorias no serviço ou mudanças legais. Alterações relevantes serão comunicadas pelos canais disponíveis."
  }
];

export default function TermsPage(): React.JSX.Element {
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
          <div className="mb-12">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <FileCheck2 className="h-6 w-6" />
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl">
              Termos de Uso
            </h1>
            <p className="mt-4 leading-7 text-ink-muted">
              Condições claras para usar o Meu Dim e tomar decisões com mais
              informação.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Vigente desde 10 de setembro de 2026.
            </p>
          </div>

          <div className="rounded-2xl border border-warn-100 bg-warn-50 p-5 text-sm leading-7 text-warn-700">
            O Meu Dim é uma ferramenta educativa. Não oferecemos consultoria
            financeira nem garantimos condições de crédito ou economia.
          </div>

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
              Dúvidas sobre os termos?
            </h2>
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
