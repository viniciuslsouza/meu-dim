import Link from "next/link";
import { BarChart3, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  current: string;
  action?: React.ReactNode;
}

export function AppHeader({
  current,
  action
}: AppHeaderProps): React.JSX.Element {
  return (
    <header className="border-b border-ink-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/"
            aria-label="Meu Dim — página inicial"
            className="flex shrink-0 items-center gap-2.5 font-bold text-brand-900"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-accent-300">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="hidden text-lg sm:inline">Meu Dim</span>
          </Link>
          <nav
            aria-label="Breadcrumb"
            className="truncate text-sm text-ink-muted"
          >
            <Link href="/" className="hover:text-brand-900">
              Início
            </Link>
            <span className="px-2 text-ink-border">/</span>
            <span className="font-medium text-brand-900">{current}</span>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-ink-muted md:flex">
            <ShieldCheck className="h-4 w-4 text-accent-700" />
            Processamento local
          </span>
          {action}
        </div>
      </div>
    </header>
  );
}
