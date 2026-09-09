import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ResultsTab } from "@/components/tabs/ResultsTab";
import { CheckingAccountTab } from "@/components/tabs/CheckingAccountTab";
import { InvestmentsTab } from "@/components/tabs/InvestmentsTab";
import { CreditCardTab } from "@/components/tabs/CreditCardTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("resultados");

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <ResultsTab />
      <CheckingAccountTab />
      <InvestmentsTab />
      <CreditCardTab />
    </MainLayout>
  );
};

export default Index;
