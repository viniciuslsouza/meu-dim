import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Analisar fatura",
  description:
    "Envie sua fatura com privacidade e receba um diagnóstico financeiro gratuito."
};

export default function AnalyzeLayout({
  children
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
