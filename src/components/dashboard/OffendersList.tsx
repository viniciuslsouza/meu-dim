import { AlertTriangle, TrendingDown, Coffee, Car, Tv, ShoppingBag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const offenders = [
  {
    id: 1,
    name: "iFood / Delivery",
    category: "Alimentação",
    amount: 890,
    percentage: 28,
    icon: Coffee,
    trend: 15,
  },
  {
    id: 2,
    name: "Uber / 99",
    category: "Transporte",
    amount: 620,
    percentage: 19,
    icon: Car,
    trend: 8,
  },
  {
    id: 3,
    name: "Streaming (Netflix, Spotify...)",
    category: "Assinaturas",
    amount: 189,
    percentage: 6,
    icon: Tv,
    trend: 0,
  },
  {
    id: 4,
    name: "Compras Online",
    category: "Lazer",
    amount: 450,
    percentage: 14,
    icon: ShoppingBag,
    trend: 22,
  },
];

export function OffendersList() {
  return (
    <div className="bg-card rounded-2xl border p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground">Ofensores de Gastos</h3>
          <p className="text-sm text-muted-foreground">Principais vilões do seu orçamento</p>
        </div>
      </div>

      <div className="space-y-4">
        {offenders.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-card">
                <item.icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.amount)}
                </p>
                {item.trend > 0 && (
                  <p className="text-xs text-destructive flex items-center justify-end gap-1">
                    <TrendingDown className="h-3 w-3 rotate-180" />
                    +{item.trend}% vs mês anterior
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">% do total de gastos</span>
                <span className="font-medium text-foreground">{item.percentage}%</span>
              </div>
              <Progress
                value={item.percentage}
                className={cn(
                  "h-2",
                  item.percentage > 20
                    ? "[&>div]:bg-destructive"
                    : item.percentage > 10
                    ? "[&>div]:bg-warning"
                    : "[&>div]:bg-primary"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
