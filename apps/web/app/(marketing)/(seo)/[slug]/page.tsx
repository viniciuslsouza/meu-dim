import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ShieldCheck
} from "lucide-react";

import {
  EmprestimoCalculator,
  EstrategiaCalculator,
  ParcelamentoCalculator,
  QuitacaoCalculator,
  RotativoCalculator
} from "@/components/seo/calculators";
import {
  SEO_PAGE_BY_SLUG,
  SEO_PAGES,
  type SeoCalculator
} from "@/lib/seo-content";

interface SeoPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return SEO_PAGES.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: SeoPageProps): Metadata {
  const page = SEO_PAGE_BY_SLUG.get(params.slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: `/${page.slug}`,
      images: ["/opengraph-image"]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

function CalculatorByType({
  type
}: {
  type: SeoCalculator;
}): React.JSX.Element {
  switch (type) {
    case "rotativo":
      return <RotativoCalculator />;
    case "quitacao":
      return <QuitacaoCalculator />;
    case "parcelamento":
      return <ParcelamentoCalculator />;
    case "emprestimo":
      return <EmprestimoCalculator />;
    case "estrategia":
      return <EstrategiaCalculator />;
  }
}

export default function SeoPage({
  params
}: SeoPageProps): React.JSX.Element {
  const page = SEO_PAGE_BY_SLUG.get(params.slug);

  if (!page) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "FAQPage"],
    name: page.title,
    description: page.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL"
    },
    mainEntity: page.faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-surface-page text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-border bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-brand-900"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-accent-300">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="text-lg">Meu Dim</span>
          </Link>
          <Link
            href="/analisar"
            className="rounded-xl bg-accent-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-900"
          >
            Analisar fatura
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-hero-glow px-5 pb-14 pt-32 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-[-0.035em] text-brand-900 sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-muted">
              {page.answer}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-700" />
                Resultado instantâneo
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-700" />
                Sem enviar dados
              </span>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-ink-border bg-white p-5 shadow-soft sm:p-8">
            <div className="mb-7 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-50 text-accent-700">
                <Calculator className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-brand-900">
                  {page.calculatorTitle}
                </h2>
                <p className="mt-2 leading-7 text-ink-muted">
                  {page.calculatorDescription}
                </p>
              </div>
            </div>
            <CalculatorByType type={page.calculator} />
          </div>
        </section>

        <article className="bg-white px-5 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            {page.sections.map((section) => (
              <section key={section.title} className="mb-14">
                <h2 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[1.05rem] leading-8 text-ink-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <Link
              href={page.related.href}
              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5 font-semibold text-brand-900 transition hover:border-brand-400"
            >
              {page.related.label}
              <ArrowRight className="h-5 w-5 shrink-0 text-accent-700" />
            </Link>
          </div>
        </article>

        <section className="px-5 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wider text-accent-700">
              Perguntas frequentes
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-900">
              Dúvidas sobre o tema
            </h2>
            <div className="mt-8 divide-y divide-ink-border border-y border-ink-border">
              {page.faqs.map(({ question, answer }) => (
                <details key={question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-semibold text-brand-900">
                    {question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-ink-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="max-w-2xl pb-5 leading-7 text-ink-muted">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-[2rem] bg-accent-700 p-8 text-center text-white sm:p-12">
            <p className="text-sm font-bold uppercase tracking-wider text-accent-100">
              Use seus números reais
            </p>
            <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Descubra onde sua fatura pode melhorar.
            </h2>
            <p className="max-w-2xl leading-7 text-accent-50">
              O diagnóstico do Meu Dim identifica gastos, recorrências e
              oportunidades sem enviar o arquivo ao servidor.
            </p>
            <Link
              href="/analisar"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-accent-900"
            >
              Analise sua fatura real gratuitamente →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-brand-950 px-5 py-10 text-sm text-brand-100 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row">
          <p>
            © 2026 Meu Dim. Conteúdo educativo, não consultoria financeira.
          </p>
          <div className="flex gap-5">
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-white">
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
