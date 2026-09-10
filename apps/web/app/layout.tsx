import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/components/providers/react-query-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default:
      "Meu Dim — Diagnóstico e Plano para Sair da Dívida do Cartão",
    template: "%s | Meu Dim"
  },
  description:
    "Analise sua fatura com privacidade, descubra para onde seu dinheiro vai e crie um plano para zerar suas dívidas.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Meu Dim",
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true
  }
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children
}: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
