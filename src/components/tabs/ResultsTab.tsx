import { TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { OffendersList } from "@/components/dashboard/OffendersList";
import { MotivationalBanner } from "@/components/dashboard/MotivationalBanner";
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  AlertTriangle,
  Utensils,
  Car,
  Repeat,
  CreditCard
} from "lucide-react";

export function ResultsTab() {
  return (
    <TabsContent value="resultados" className="space-y-6 mt-0">
      {/* Motivational Banner */}
      <MotivationalBanner
        savings={1200}
        targetMonths={8}
        goalName="Reserva de Emergência"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Renda Mensal"
          value="R$ 8.500,00"
          icon={Wallet}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Gastos Totais"
          value="R$ 7.600,00"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: false }}
          variant="warning"
        />
        <StatsCard
          title="Sobra do Mês"
          value="R$ 900,00"
          icon={PiggyBank}
          variant="success"
        />
        <StatsCard
          title="Potencial de Economia"
          value="R$ 1.200,00"
          subtitle="Se seguir as recomendações"
          icon={AlertTriangle}
          variant="accent"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <MonthlyTrendChart />
      </div>

      {/* Offenders & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OffendersList />
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Recomendações Personalizadas
          </h3>
          
          <RecommendationCard
            title="Reduza gastos com delivery"
            description="Identificamos que seus gastos com iFood e similares aumentaram 15% este mês. Que tal cozinhar mais em casa?"
            impact="+R$ 450/mês na poupança"
            icon={Utensils}
            priority="high"
          />
          
          <RecommendationCard
            title="Renegocie suas assinaturas"
            description="Você tem 6 serviços de streaming ativos. Considere manter apenas 2-3 que realmente usa."
            impact="+R$ 89/mês na poupança"
            icon={Repeat}
            priority="medium"
          />
          
          <RecommendationCard
            title="Otimize seu transporte"
            description="Considere alternativas como carona ou transporte público 2x por semana."
            impact="+R$ 180/mês na poupança"
            icon={Car}
            priority="low"
          />
        </div>
      </div>
    </TabsContent>
  );
}
