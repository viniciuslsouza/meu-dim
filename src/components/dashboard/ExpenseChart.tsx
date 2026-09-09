import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Alimentação", value: 1850, color: "hsl(160, 84%, 30%)" },
  { name: "Transporte", value: 920, color: "hsl(40, 95%, 55%)" },
  { name: "Lazer", value: 1200, color: "hsl(200, 80%, 50%)" },
  { name: "Moradia", value: 2500, color: "hsl(280, 60%, 55%)" },
  { name: "Assinaturas", value: 450, color: "hsl(0, 84%, 60%)" },
  { name: "Outros", value: 680, color: "hsl(220, 14%, 50%)" },
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
      </div>
    );
  }
  return null;
};

export function ExpenseChart() {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-card rounded-2xl border p-6 animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-foreground">Distribuição de Gastos</h3>
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-bold text-foreground">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(total)}
          </span>
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
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
  );
}
