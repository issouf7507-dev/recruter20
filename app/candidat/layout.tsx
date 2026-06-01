"use client";

import { CandidatSidebar } from "@/components/candidat-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AuthGuard from "@/components/auth/AuthGuard";

export default function CandidatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard redirectTo="/auth/candidat/login">
      <style>{`
        /* ── Palette tokens (miroir de C dans dashboard) ── */
        :root {
          --cand-violet:       #7C5CFC;
          --cand-violet-bg:    rgba(124,92,252,0.09);
          --cand-violet-bgmd:  rgba(124,92,252,0.16);
          --cand-page-bg:      #F7F8FA;
          --cand-card-bg:      #fff;
          --cand-border:       rgba(17,24,39,0.09);
          --cand-ink:          #0B0E14;
          --cand-ink2:         #6B7280;
          --cand-ink3:         #9CA3AF;
          /* Sidebar */
          --sb-bg:             #0D0B14;
          --sb-text:           rgba(236,238,242,0.62);
          --sb-text-bright:    #ECEEF2;
          --sb-text-muted:     rgba(236,238,242,0.32);
          --sb-active-bg:      rgba(124,92,252,0.16);
          --sb-active-text:    #C4B5FD;
          --sb-hover-bg:       rgba(255,255,255,0.06);
          --sb-border:         rgba(255,255,255,0.07);
        }

        /* ── Sidebar dark theme ── */
        [data-slot="sidebar"] {
          background: var(--sb-bg) !important;
          background-image: radial-gradient(ellipse 460px 340px at 85% 6%, rgba(124,92,252,0.18), transparent 55%) !important;
          border-right: 1px solid var(--sb-border) !important;
        }
        [data-slot="sidebar-menu-button"] {
          color: var(--sb-text) !important;
          border-radius: 8px !important;
          font-size: 13.5px !important;
        }
        [data-slot="sidebar-menu-button"]:hover:not([data-active="true"]) {
          background: var(--sb-hover-bg) !important;
          color: var(--sb-text-bright) !important;
        }
        [data-slot="sidebar-menu-button"][data-active="true"] {
          background: var(--sb-active-bg) !important;
          color: var(--sb-active-text) !important;
        }
        [data-slot="sidebar-group-label"] {
          color: var(--sb-text-muted) !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          letter-spacing: 0.07em !important;
        }
        [data-slot="sidebar-inset"] {
          background: var(--cand-page-bg) !important;
        }

        /* ── Grilles responsive ── */
        .cand-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .cand-main-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          height: 100%;
        }
        @media (max-width: 900px) {
          .cand-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .cand-main-grid { grid-template-columns: 1fr; height: auto; }
        }
        @media (max-width: 480px) {
          .cand-stat-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Badge notification ── */
        .cand-nav-badge {
          background: var(--cand-violet);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 99px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }
      `}</style>

      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 58)",
            "--header-height": "calc(var(--spacing) * 12)",
            "--sidebar": "#0D0B14",
            "--sidebar-foreground": "rgba(236,238,242,0.72)",
            "--sidebar-accent": "rgba(255,255,255,0.06)",
            "--sidebar-accent-foreground": "#ECEEF2",
            "--sidebar-border": "rgba(255,255,255,0.07)",
            "--sidebar-primary": "#7C5CFC",
            "--sidebar-primary-foreground": "#fff",
            "--sidebar-ring": "rgba(124,92,252,0.4)",
          } as React.CSSProperties
        }
      >
        <CandidatSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col" style={{ overflow: "hidden", height: "100%" }}>
            <main className="flex-1" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </AuthGuard>
  );
}
