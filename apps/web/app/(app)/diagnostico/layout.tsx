import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Diagnóstico da fatura",
  description:
    "Veja sua nota financeira, maiores gastos, assinaturas e parcelas futuras."
};

export default function DiagnosisLayout({
  children
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
