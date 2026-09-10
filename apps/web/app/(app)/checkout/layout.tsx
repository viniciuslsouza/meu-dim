import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Checkout seguro",
  description: "Finalize seu plano de quitação com pagamento seguro."
};

export default function CheckoutLayout({
  children
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
