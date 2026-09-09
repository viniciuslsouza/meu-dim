import { TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { FileUpload } from "@/components/upload/FileUpload";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

const mockTransactions = [
  { id: "1", description: "Salário", amount: 8500, type: "income" as const, category: "salario", date: "01/12/2024" },
  { id: "2", description: "Aluguel", amount: 2500, type: "expense" as const, category: "moradia", date: "05/12/2024" },
  { id: "3", description: "Supermercado Pão de Açúcar", amount: 450, type: "expense" as const, category: "alimentacao", date: "08/12/2024" },
  { id: "4", description: "Uber", amount: 89, type: "expense" as const, category: "transporte", date: "10/12/2024" },
  { id: "5", description: "PIX Recebido - Freelance", amount: 1500, type: "income" as const, category: "salario", date: "12/12/2024" },
  { id: "6", description: "iFood", amount: 156, type: "expense" as const, category: "alimentacao", date: "14/12/2024" },
  { id: "7", description: "Conta de Luz", amount: 280, type: "expense" as const, category: "moradia", date: "15/12/2024" },
  { id: "8", description: "Academia Smart Fit", amount: 99, type: "expense" as const, category: "lazer", date: "16/12/2024" },
];

export function CheckingAccountTab() {
  return (
    <TabsContent value="conta-corrente" className="space-y-6 mt-0">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Saldo Atual"
          value="R$ 3.240,00"
          icon={Wallet}
          variant="accent"
        />
        <StatsCard
          title="Entradas do Mês"
          value="R$ 10.000,00"
          icon={ArrowDownLeft}
          trend={{ value: 12, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Saídas do Mês"
          value="R$ 6.760,00"
          icon={ArrowUpRight}
          trend={{ value: 8, isPositive: false }}
        />
        <StatsCard
          title="Média Diária de Gastos"
          value="R$ 225,33"
          subtitle="Baseado nos últimos 30 dias"
          icon={TrendingUp}
        />
      </div>

      {/* Upload & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border p-6">
          <FileUpload
            title="Importar Extrato Bancário"
            description="Envie seus extratos para análise automática"
            acceptedTypes={[".pdf", ".xlsx", ".csv", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}
          />
        </div>
        
        <TransactionList transactions={mockTransactions} />
      </div>
    </TabsContent>
  );
}
