import { useMemo, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FileUpload } from "@/components/upload/FileUpload";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  Receipt,
  Coffee,
  ShoppingBag,
  Car,
  Tv,
  Home,
  Utensils,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CreditCardExpense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  icon: typeof Utensils;
  date: string;
};

type CategoryBreakdown = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
};

const creditCardExpensesSeed: CreditCardExpense[] = [
  { id: "1", description: "Supermercado Extra", amount: 380, category: "Alimentação", icon: Utensils, date: "02/12" },
  { id: "2", description: "Netflix", amount: 55.9, category: "Assinaturas", icon: Tv, date: "05/12" },
  { id: "3", description: "Posto Shell", amount: 250, category: "Transporte", icon: Car, date: "08/12" },
  { id: "4", description: "Amazon", amount: 189, category: "Compras", icon: ShoppingBag, date: "10/12" },
  { id: "5", description: "iFood", amount: 156, category: "Alimentação", icon: Coffee, date: "12/12" },
  { id: "6", description: "Spotify", amount: 21.9, category: "Assinaturas", icon: Tv, date: "14/12" },
  { id: "7", description: "Farmácia", amount: 89, category: "Saúde", icon: Home, date: "15/12" },
  { id: "8", description: "Uber", amount: 78, category: "Transporte", icon: Car, date: "17/12" },
];

const categoryColors: Record<string, string> = {
  Alimentação: "hsl(160, 84%, 30%)",
  Transporte: "hsl(40, 95%, 55%)",
  Assinaturas: "hsl(200, 80%, 50%)",
  Compras: "hsl(280, 60%, 55%)",
  Saúde: "hsl(10, 75%, 52%)",
  Outros: "hsl(220, 14%, 50%)",
};

function buildCategoryBreakdown(expenses: CreditCardExpense[]): CategoryBreakdown[] {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);

  const grandTotal = Array.from(totals.values()).reduce((acc, v) => acc + v, 0) || 1;

  return Array.from(totals.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / grandTotal) * 100),
      color: categoryColors[name] ?? categoryColors.Outros,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function CreditCardTab() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expenses, setExpenses] = useState<CreditCardExpense[]>(creditCardExpensesSeed);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const { toast } = useToast();

  const categoryBreakdown = useMemo(() => buildCategoryBreakdown(expenses), [expenses]);

  const totalFatura = useMemo(
    () => expenses.reduce((acc, e) => acc + e.amount, 0),
    [expenses]
  );
  const limite = 8000;
  const limiteUsado = (totalFatura / limite) * 100;

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleAnalyzeData = async () => {
    setIsAnalyzing(true);

    // Simulação: “processa” as faturas e atualiza os números na tela
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const seed = uploadedFiles.map((f) => f.name).join("|").length || 1;
    const factor = 0.92 + ((seed % 17) / 100); // 0.92 - 1.08

    setExpenses((prev) =>
      prev.map((e, idx) => ({
        ...e,
        amount: Math.max(5, Number((e.amount * factor * (1 + (idx % 3) * 0.03)).toFixed(2))),
      }))
    );

    setLastUpdatedAt(Date.now());

    toast({
      title: "Análise concluída!",
      description: `${uploadedFiles.length} fatura(s) processada(s). Os dados foram atualizados na tela (demo).`,
    });

    setIsAnalyzing(false);
    setUploadedFiles([]);
  };

  return (
    <TabsContent value="cartao" className="space-y-6 mt-0">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Fatura Atual"
          value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalFatura)}
          icon={CreditCard}
          variant="warning"
        />
        <StatsCard
          title="Vencimento"
          value="15/01/2025"
          subtitle="Fatura aberta"
          icon={Calendar}
        />
        <StatsCard
          title="Limite Disponível"
          value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(limite - totalFatura)}
          icon={Receipt}
          variant="success"
        />
        <StatsCard
          title="Maior Gasto"
          value="Alimentação"
          subtitle="35% da fatura"
          icon={AlertTriangle}
        />
      </div>

      {/* Limit Usage */}
      <div className="bg-card rounded-2xl border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Uso do Limite</h3>
            <p className="text-sm text-muted-foreground">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalFatura)} de{" "}
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(limite)}
            </p>
          </div>
          <span className={cn(
            "text-2xl font-bold",
            limiteUsado > 80 ? "text-destructive" : limiteUsado > 50 ? "text-warning" : "text-success"
          )}>
            {limiteUsado.toFixed(0)}%
          </span>
        </div>
        <Progress
          value={limiteUsado}
          className={cn(
            "h-3",
            limiteUsado > 80
              ? "[&>div]:bg-destructive"
              : limiteUsado > 50
              ? "[&>div]:bg-warning"
              : "[&>div]:bg-primary"
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl border p-6 animate-fade-in">
          <h3 className="font-semibold text-lg text-foreground mb-4">Gastos por Categoria</h3>
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={category.name} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(category.amount)}
                  </span>
                </div>
                <Progress
                  value={category.percentage}
                  className="h-2 [&>div]:transition-all"
                  style={{ 
                    '--progress-color': category.color 
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-card rounded-2xl border p-6 animate-fade-in">
          <h3 className="font-semibold text-lg text-foreground mb-4">Últimos Lançamentos</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-2 rounded-lg bg-secondary">
                  <expense.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{expense.category} • {expense.date}</p>
                </div>
                <span className="font-bold text-foreground">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <FileUpload
          title="Importar Fatura do Cartão"
          description="Envie suas faturas em PDF para análise detalhada e categorização automática"
          acceptedTypes={[".pdf", "application/pdf"]}
          onFilesUploaded={handleFilesUploaded}
        />
        
        {uploadedFiles.length > 0 && (
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleAnalyzeData}
              disabled={isAnalyzing}
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando {uploadedFiles.length} arquivo(s)...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analisar {uploadedFiles.length} Fatura(s)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
