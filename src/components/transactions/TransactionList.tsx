import { ArrowDownLeft, ArrowUpRight, Coffee, Home, Car, Tv, ShoppingBag, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const categoryIcons: Record<string, any> = {
  alimentacao: Coffee,
  moradia: Home,
  transporte: Car,
  assinaturas: Tv,
  lazer: ShoppingBag,
  salario: Briefcase,
};

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

export function TransactionList({ transactions, title = "Últimas Transações" }: TransactionListProps) {
  return (
    <div className="bg-card rounded-2xl border p-6 animate-fade-in">
      <h3 className="font-semibold text-lg text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const Icon = categoryIcons[transaction.category.toLowerCase()] || ShoppingBag;
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "p-2.5 rounded-xl",
                transaction.type === "income" ? "bg-success/10" : "bg-secondary"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  transaction.type === "income" ? "text-success" : "text-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
              <div className="text-right flex items-center gap-2">
                {transaction.type === "income" ? (
                  <ArrowDownLeft className="h-4 w-4 text-success" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  "font-bold",
                  transaction.type === "income" ? "text-success" : "text-foreground"
                )}>
                  {transaction.type === "income" ? "+" : "-"}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Math.abs(transaction.amount))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
