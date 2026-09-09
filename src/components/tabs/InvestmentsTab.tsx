import { TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FileUpload } from "@/components/upload/FileUpload";
import { TrendingUp, PiggyBank, BarChart3, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const portfolioData = [
  { name: "Renda Fixa", value: 45000, color: "hsl(160, 84%, 30%)", percentage: 45 },
  { name: "Ações", value: 30000, color: "hsl(40, 95%, 55%)", percentage: 30 },
  { name: "FIIs", value: 15000, color: "hsl(200, 80%, 50%)", percentage: 15 },
  { name: "Cripto", value: 10000, color: "hsl(280, 60%, 55%)", percentage: 10 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card border rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-foreground">{item.name}</p>
        <p className="text-primary font-bold">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(item.value)}
        </p>
        <p className="text-sm text-muted-foreground">{item.percentage}% da carteira</p>
      </div>
    );
  }
  return null;
};

export function InvestmentsTab() {
  const totalInvested = portfolioData.reduce((acc, item) => acc + item.value, 0);

  return (
    <TabsContent value="investimentos" className="space-y-6 mt-0">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Patrimônio Total"
          value="R$ 100.000,00"
          icon={PiggyBank}
          variant="accent"
        />
        <StatsCard
          title="Rentabilidade Anual"
          value="+12,8%"
          icon={TrendingUp}
          trend={{ value: 12.8, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Dividendos Recebidos"
          value="R$ 850,00"
          subtitle="Este mês"
          icon={BarChart3}
        />
        <StatsCard
          title="CDI Acumulado"
          value="11,25%"
          subtitle="Taxa anual"
          icon={Percent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Chart */}
        <div className="bg-card rounded-2xl border p-6 animate-fade-in">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-foreground">Distribuição da Carteira</h3>
            <p className="text-sm text-muted-foreground">
              Total investido:{" "}
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalInvested)}
              </span>
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset List */}
        <div className="bg-card rounded-2xl border p-6 animate-fade-in">
          <h3 className="font-semibold text-lg text-foreground mb-4">Detalhamento por Classe</h3>
          <div className="space-y-4">
            {portfolioData.map((asset, index) => (
              <div
                key={asset.name}
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="font-medium text-foreground">{asset.name}</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(asset.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{asset.percentage}% do total</span>
                  <span className="text-success font-medium">+8,2% YTD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-2xl border p-6">
        <FileUpload
          title="Importar Extrato de Investimentos"
          description="Envie extratos de corretoras e bancos para consolidar sua carteira"
          acceptedTypes={[".pdf", ".xlsx", ".csv", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}
        />
      </div>
    </TabsContent>
  );
}
