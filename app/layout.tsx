import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { Suspense } from "react";
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
    default: "Ylsix - Plateforme de recrutement moderne",
    template: "%s | Ylsix",
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
  authors: [{ name: "Ylsix" }],
  creator: "Ylsix",
  publisher: "Ylsix",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://ylsix.com",
    title: "Ylsix - Plateforme de recrutement moderne",
    description:
      "La plateforme moderne qui connecte les meilleurs talents avec les meilleures opportunités. Trouvez votre prochain emploi ou recrutez les meilleurs candidats.",
    siteName: "Ylsix",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KBEVJTB6V0"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KBEVJTB6V0');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Toaster />
          <EdgeStoreProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {children
              }
            </Suspense>
          </EdgeStoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
