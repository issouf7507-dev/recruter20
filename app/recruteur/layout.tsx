"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AuthGuard from "@/app/components/AuthGuard";

export default function RecruteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard redirectTo="/auth/recruteur/login">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </AuthGuard>
  );
}
