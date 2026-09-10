const SCORE_COPY = {
  critico: {
    title: "Crítico",
    text: "Sua dívida está crescendo mais rápido do que você paga.",
    color: "#DC2626"
  },
  alerta: {
    title: "Alerta",
    text: "Atenção: os juros estão pesando no seu orçamento.",
    color: "#D97706"
  },
  atencao: {
    title: "Atenção",
    text: "Há margem para melhorar — veja onde o dinheiro vai.",
    color: "#E59A1B"
  },
  bom: {
    title: "Bom",
    text: "Você está no caminho certo. Veja como acelerar.",
    color: "#10B981"
  },
  otimo: {
    title: "Ótimo",
    text: "Parabéns! Seu controle está ótimo.",
    color: "#34D399"
  }
} as const;

interface HealthScoreProps {
  score: number;
  label: keyof typeof SCORE_COPY;
}

export function HealthScore({
  score,
  label
}: HealthScoreProps): React.JSX.Element {
  const safeScore = Math.min(100, Math.max(0, score));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeScore / 100);
  const copy = SCORE_COPY[label];

  return (
    <div className="flex flex-col items-center gap-7 sm:flex-row sm:text-left">
      <div
        role="img"
        aria-label={`Nota de saúde financeira: ${safeScore} de 100, ${copy.title}`}
        className="relative h-40 w-40 shrink-0"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#E8EEF4"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={copy.color}
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <strong className="text-4xl tracking-tight text-brand-900">
            {safeScore}
          </strong>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            de 100
          </span>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: copy.color }}
        >
          {copy.title}
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">
          Sua nota de saúde financeira
        </h2>
        <p className="mt-3 max-w-xl leading-7 text-ink-muted">{copy.text}</p>
      </div>
    </div>
  );
}
