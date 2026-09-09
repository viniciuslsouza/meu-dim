import { Sparkles, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MotivationalBannerProps {
  savings: number;
  targetMonths: number;
  goalName: string;
}

export function MotivationalBanner({ savings, targetMonths, goalName }: MotivationalBannerProps) {
  return (
    <div className="gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">Sua Jornada para a Liberdade</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Você está no caminho certo!
        </h2>
        
        <p className="text-lg opacity-90 mb-6 max-w-xl">
          Com as otimizações sugeridas, você pode economizar{" "}
          <span className="font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(savings)}
          </span>{" "}
          por mês e alcançar sua meta de <span className="font-bold">{goalName}</span> em{" "}
          <span className="font-bold">{targetMonths} meses</span>.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
          >
            <Target className="h-4 w-4 mr-2" />
            Ver Plano de Ação
          </Button>
          <Button
            variant="ghost"
            className="text-primary-foreground border-primary-foreground/30 border hover:bg-primary-foreground/10"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Simular Cenários
          </Button>
        </div>
      </div>
    </div>
  );
}
