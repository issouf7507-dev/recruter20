import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Recruteur 2.0 - Plateforme de recrutement moderne",
    template: "%s | Recruteur 2.0",
  },
  description:
    "La plateforme moderne qui connecte les meilleurs talents avec les meilleures opportunités. Trouvez votre prochain emploi ou recrutez les meilleurs candidats.",
  keywords: [
    "recrutement",
    "emploi",
    "candidats",
    "offres d'emploi",
    "carrière",
    "RH",
  ],
  authors: [{ name: "Recruteur 2.0" }],
  creator: "Recruteur 2.0",
  publisher: "Recruteur 2.0",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://recruteur20.com",
    title: "Recruteur 2.0 - Plateforme de recrutement moderne",
    description:
      "La plateforme moderne qui connecte les meilleurs talents avec les meilleures opportunités",
    siteName: "Recruteur 2.0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Toaster />
          <EdgeStoreProvider>{children}</EdgeStoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
