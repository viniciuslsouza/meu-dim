import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, CreditCard, Target, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "resultados", label: "Resultados", icon: Target },
  { id: "conta-corrente", label: "Conta Corrente", icon: Wallet },
  { id: "investimentos", label: "Investimentos", icon: TrendingUp },
  { id: "cartao", label: "Cartão de Crédito", icon: CreditCard },
];

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-primary p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">FinFlow</h1>
              <p className="text-xs text-muted-foreground">Sua liberdade financeira</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="glass p-1.5 h-auto flex-wrap gap-1 w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {children}
        </Tabs>
      </main>
    </div>
  );
}
