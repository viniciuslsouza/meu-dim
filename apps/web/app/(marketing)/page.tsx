import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileUp,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";

import { PrivacyBadge } from "@/components/privacy-badge";

export const metadata: Metadata = {
  title: {
    absolute:
      "Meu Dim — Diagnóstico e Plano para Sair da Dívida do Cartão"
  },
  description:
    "Envie sua fatura, descubra seus maiores gastos e receba gratuitamente um diagnóstico financeiro com total privacidade.",
  openGraph: {
    title: "Descubra onde seu dinheiro vai | Meu Dim",
    description:
      "Diagnóstico gratuito da fatura e um plano claro para sair da dívida do cartão.",
    images: ["/opengraph-image"]
  }
};

const steps = [
  {
    icon: FileUp,
    number: "01",
    title: "Envie sua fatura",
    description: "CSV ou PDF do Nubank, Inter e outros bancos."
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Veja o diagnóstico",
    description:
      "Top ofensores, assinaturas esquecidas e custo dos juros."
  },
  {
    icon: CalendarCheck2,
    number: "03",
    title: "Receba o plano",
    description:
      "Bola de neve ou avalanche, com data e economia em reais."
  }
];

const freeFeatures = [
  "Upload da fatura",
  "Top 5 ofensores",
  "Assinaturas detectadas",
  "Custo dos juros estimado",
  "Nota de saúde financeira"
];

const paidFeatures = [
  "Tudo do diagnóstico gratuito",
  "Planos bola de neve e avalanche",
  "Cronograma mês a mês até zerar",
  "Comparador de crédito e rotativo",
  "Metas de corte com impacto em meses",
  "PDF do plano para baixar",
  "30 dias de reanálise grátis"
];

const faqs = [
  {
    question: "Minha fatura fica salva nos seus servidores?",
    answer:
      "Não. O arquivo é processado diretamente no seu navegador e nunca é enviado aos nossos servidores."
  },
  {
    question: "Quais bancos vocês suportam?",
    answer:
      "Nubank e Inter no MVP, com suporte progressivo a outros bancos e formatos."
  },
  {
    question: "O diagnóstico é realmente gratuito?",
    answer:
      "Sim. Os principais ofensores, assinaturas e a nota financeira são 100% gratuitos."
  },
  {
    question: "Posso pedir reembolso?",
    answer:
      "Sim. O plano completo tem garantia de reembolso em até 7 dias após a compra."
  },
  {
    question: "Preciso criar conta?",
    answer:
      "Não para o diagnóstico. A conta é opcional e serve para salvar seu histórico e seu plano."
  }
];

function Logo(): React.JSX.Element {
  return (
    <Link
      href="/"
      aria-label="Meu Dim — página inicial"
      className="flex items-center gap-2.5 font-bold tracking-tight text-brand-900"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-accent-300">
        <BarChart3 aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="text-xl">Meu Dim</span>
    </Link>
  );
}

function DashboardPreview(): React.JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-[570px]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-accent-100/50 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-brand-100 bg-white p-3 shadow-soft sm:p-5">
        <div className="flex items-center justify-between border-b border-ink-border px-2 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Diagnóstico de setembro
            </p>
            <p className="mt-1 font-semibold text-brand-900">
              Sua saúde financeira
            </p>
          </div>
          <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-900">
            Fatura analisada
          </span>
        </div>

        <div className="grid gap-3 py-4 sm:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl bg-brand-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-100">Nota geral</span>
              <Sparkles className="h-4 w-4 text-accent-300" />
            </div>
            <div className="mt-5 flex items-end gap-1">
              <strong className="text-5xl tracking-tight">72</strong>
              <span className="pb-1 text-sm text-brand-100">/100</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[72%] rounded-full bg-accent-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-brand-100">
              Você pode economizar R$ 384 por mês.
            </p>
          </div>

          <div className="rounded-2xl border border-ink-border bg-surface-page p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-900">
                Maiores ofensores
              </span>
              <span className="text-xs text-ink-muted">R$ 2.840</span>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["Delivery", "R$ 648", "82%"],
                ["Assinaturas", "R$ 392", "55%"],
                ["Compras online", "R$ 284", "39%"]
              ].map(([label, value, width], index) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-ink-muted">{label}</span>
                    <span className="font-semibold text-brand-900">
                      {value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={
                        index === 0
                          ? "h-full rounded-full bg-warn-600"
                          : "h-full rounded-full bg-brand-400"
                      }
                      style={{ width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-accent-50 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-700 text-white">
            <CalendarCheck2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-accent-900">Previsão com seu plano</p>
            <p className="font-semibold text-brand-900">
              Dívida zerada em 8 meses
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-accent-700" />
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-ink-border bg-white px-4 py-3 text-sm font-semibold text-brand-900 shadow-card sm:flex">
        <ShieldCheck className="h-4 w-4 text-accent-700" />
        100% privado
      </div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <div className="min-h-screen overflow-hidden bg-surface-page text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-border/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Logo />
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex"
          >
            <a className="transition hover:text-brand-900" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition hover:text-brand-900" href="#preco">
              Preço
            </a>
            <a className="transition hover:text-brand-900" href="#seguranca">
              Segurança
            </a>
          </nav>
          <Link
            href="/analisar"
            className="rounded-xl bg-accent-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-900"
          >
            <span className="hidden sm:inline">Analisar minha fatura</span>
            <span className="sm:hidden">Analisar</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-hero-glow px-5 pb-20 pt-32 sm:pt-36 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3.5 py-2 text-xs font-semibold text-accent-900">
                <ScanLine className="h-4 w-4" />
                Diagnóstico gratuito em poucos minutos
              </div>
              <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-brand-900 sm:text-5xl lg:text-[4rem]">
                Descubra onde seu dinheiro vai e{" "}
                <span className="text-accent-700">
                  saia da dívida do cartão
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
                Envie sua fatura, veja os 5 maiores ofensores e receba um
                plano com data para zerar a dívida.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/analisar"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent-700/15 transition hover:-translate-y-0.5 hover:bg-accent-900"
                >
                  Analisar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-brand-900 transition hover:bg-brand-50"
                >
                  Ver como funciona
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:gap-6">
                <span className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-accent-700" />
                  Sua fatura não sai do computador
                </span>
                <span className="flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-accent-700" />
                  Sem senha bancária
                </span>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section
          id="como-funciona"
          className="scroll-mt-20 bg-white px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">
                Simples, rápido e seguro
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                Da fatura ao plano em três passos
              </h2>
              <p className="mt-4 leading-7 text-ink-muted">
                Sem planilhas complicadas e sem conectar sua conta bancária.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {steps.map(({ icon: Icon, number, title, description }) => (
                <article
                  key={number}
                  className="group relative rounded-2xl border border-ink-border bg-surface-page p-6 transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-accent-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-sm text-brand-400">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold text-brand-900">
                    {title}
                  </h3>
                  <p className="mt-3 leading-7 text-ink-muted">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="seguranca"
          className="scroll-mt-20 px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid max-w-7xl gap-12 rounded-[2rem] border border-brand-100 bg-brand-50 p-7 sm:p-10 lg:grid-cols-[.82fr_1.18fr] lg:p-14">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-700 text-white">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-brand-900">
                Como garantimos sua privacidade
              </h2>
              <p className="mt-4 leading-7 text-ink-muted">
                Seus dados financeiros pertencem a você. Nossa tecnologia foi
                desenhada com essa premissa.
              </p>
              <div className="mt-7">
                <PrivacyBadge compact />
              </div>
            </div>
            <ul className="grid content-center gap-4">
              {[
                "Sua fatura é lida diretamente no seu navegador.",
                "Nunca enviamos o arquivo para nossos servidores.",
                "Só salvamos totais agregados se você criar uma conta.",
                "O parser pode ser auditado publicamente no GitHub."
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-50 text-xs font-bold text-accent-700">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 font-medium text-brand-900">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="preco"
          className="scroll-mt-20 bg-white px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">
                Preço direto, sem surpresa
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                Comece grátis. Avance quando fizer sentido.
              </h2>
            </div>
            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
              <article className="flex flex-col rounded-[1.75rem] border border-ink-border bg-surface-page p-7 sm:p-8">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-ink-muted">
                    Diagnóstico
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <strong className="text-4xl tracking-tight text-brand-900">
                      Gratuito
                    </strong>
                    <span className="pb-1 text-sm text-ink-muted">para sempre</span>
                  </div>
                </div>
                <ul className="my-8 flex-1 space-y-4">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-accent-700" />
                      <span className="text-sm text-ink-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/analisar"
                  className="rounded-xl border border-brand-100 bg-white px-5 py-3 text-center font-semibold text-brand-900 transition hover:border-brand-400"
                >
                  Começar grátis
                </Link>
              </article>

              <article className="relative flex flex-col rounded-[1.75rem] border-2 border-accent-700 bg-brand-900 p-7 text-white shadow-soft sm:p-8">
                <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-warn-100 px-3 py-1 text-xs font-bold text-warn-700">
                  Garantia de 7 dias
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-accent-300">
                    Plano completo
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <strong className="text-4xl tracking-tight">R$ 39</strong>
                    <span className="pb-1 text-sm text-brand-100">uma vez</span>
                  </div>
                </div>
                <ul className="my-8 flex-1 space-y-4">
                  {paidFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500/20">
                        <Check className="h-3.5 w-3.5 text-accent-300" />
                      </span>
                      <span className="text-sm text-brand-100">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/analisar"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 font-semibold text-brand-950 transition hover:bg-accent-300"
                >
                  Começar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-700">
                Tire suas dúvidas
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
                Perguntas frequentes
              </h2>
            </div>
            <div className="mt-10 divide-y divide-ink-border border-y border-ink-border">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-brand-900">
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

        <section className="px-5 pb-20 lg:px-8 lg:pb-28">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-accent-700 p-8 text-center text-white sm:p-12 lg:flex-row lg:text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-100">
                Seu próximo passo
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Transforme sua fatura em um plano claro.
              </h2>
            </div>
            <Link
              href="/analisar"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-accent-900 transition hover:-translate-y-0.5"
            >
              Analisar gratuitamente
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-brand-950 px-5 py-14 text-brand-100 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5 font-bold text-white">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-accent-300">
                  <CircleDollarSign className="h-5 w-5" />
                </span>
                <span className="text-xl">Meu Dim</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100">
                Clareza para entender sua fatura e tomar decisões melhores
                sobre suas dívidas.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Institucional</p>
              <div className="mt-4 grid gap-3 text-sm">
                <Link href="/termos" className="hover:text-white">
                  Termos de Uso
                </Link>
                <Link href="/privacidade" className="hover:text-white">
                  Política de Privacidade
                </Link>
                <a href="mailto:contato@meudim.com.br" className="hover:text-white">
                  Contato
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">Ferramentas</p>
              <div className="mt-4 grid gap-3 text-sm">
                <Link
                  href="/simulador-juros-rotativo"
                  className="hover:text-white"
                >
                  Simulador de Juros
                </Link>
                <Link
                  href="/quanto-tempo-para-quitar-cartao"
                  className="hover:text-white"
                >
                  Calculadora de Dívidas
                </Link>
                <Link
                  href="/vale-a-pena-parcelar-fatura"
                  className="hover:text-white"
                >
                  Vale parcelar a fatura?
                </Link>
                <Link
                  href="/emprestimo-para-quitar-cartao"
                  className="hover:text-white"
                >
                  Empréstimo para quitar
                </Link>
                <Link
                  href="/bola-de-neve-ou-avalanche"
                  className="hover:text-white"
                >
                  Bola de Neve vs Avalanche
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-brand-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Meu Dim não é uma consultoria financeira. Simulações são
              educativas.
            </p>
            <a
              href="https://github.com"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <ScanLine className="h-4 w-4" />
              Código aberto para auditoria
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
