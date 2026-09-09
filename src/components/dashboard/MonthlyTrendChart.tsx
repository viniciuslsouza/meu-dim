import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Jul", receitas: 8500, despesas: 7200 },
  { month: "Ago", receitas: 8500, despesas: 7800 },
  { month: "Set", receitas: 9200, despesas: 7100 },
  { month: "Out", receitas: 8500, despesas: 7600 },
  { month: "Nov", receitas: 10500, despesas: 8200 },
  { month: "Dez", receitas: 12000, despesas: 9500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-xl p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.fill }}>
            {item.name}:{" "}
            <span className="font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(item.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart() {
  return (
    <div className="bg-card rounded-2xl border p-6 animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-foreground">Evolução Mensal</h3>
        <p className="text-sm text-muted-foreground">Receitas vs Despesas nos últimos 6 meses</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-foreground capitalize">{value}</span>
              )}
            />
            <Bar
              dataKey="receitas"
              fill="hsl(160, 84%, 30%)"
              radius={[6, 6, 0, 0]}
              name="Receitas"
            />
            <Bar
              dataKey="despesas"
              fill="hsl(0, 84%, 60%)"
              radius={[6, 6, 0, 0]}
              name="Despesas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
