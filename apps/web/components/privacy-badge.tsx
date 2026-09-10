import { ShieldCheck } from "lucide-react";

interface PrivacyBadgeProps {
  compact?: boolean;
}

export function PrivacyBadge({
  compact = false
}: PrivacyBadgeProps): React.JSX.Element {
  return (
    <div
      className={[
        "flex items-start gap-2.5 rounded-xl border border-ink-border bg-white/80 text-sm leading-6 text-ink-muted shadow-card",
        compact ? "px-3 py-2.5" : "p-4"
      ].join(" ")}
    >
      <ShieldCheck
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-accent-700"
      />
      <span>
        Sua fatura é lida no seu navegador. Ela não é enviada para nossos
        servidores.
      </span>
    </div>
  );
}
