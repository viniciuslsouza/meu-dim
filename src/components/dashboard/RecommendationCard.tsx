import { LucideIcon, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RecommendationCardProps {
  title: string;
  description: string;
  impact: string;
  icon: LucideIcon;
  priority: "high" | "medium" | "low";
  actionLabel?: string;
  onAction?: () => void;
}

const priorityStyles = {
  high: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    border: "border-l-destructive",
    label: "Alta prioridade",
  },
  medium: {
    badge: "bg-warning/10 text-warning border-warning/20",
    border: "border-l-warning",
    label: "Média prioridade",
  },
  low: {
    badge: "bg-success/10 text-success border-success/20",
    border: "border-l-success",
    label: "Baixa prioridade",
  },
};

export function RecommendationCard({
  title,
  description,
  impact,
  icon: Icon,
  priority,
  actionLabel = "Ver detalhes",
  onAction,
}: RecommendationCardProps) {
  const styles = priorityStyles[priority];

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border p-5 border-l-4 transition-all duration-300 hover:shadow-lg animate-fade-in",
        styles.border
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-secondary shrink-0">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border", styles.badge)}>
              {styles.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">Impacto:</span>
            <span className="text-success font-semibold">{impact}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent group"
            onClick={onAction}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
