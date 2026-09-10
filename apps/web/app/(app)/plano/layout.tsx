import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Plano de quitação",
  description:
    "Compare estratégias e monte um cronograma para quitar suas dívidas."
};

export default function PlanLayout({
  children
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
