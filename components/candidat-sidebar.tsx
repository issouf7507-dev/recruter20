"use client";

import * as React from "react";
import {
  IconBriefcase,
  IconBell,
  IconFileText,
  IconFolder,
  IconMessage,
  IconTarget,
  IconUser,
  IconDashboard,
  IconLogout,
  IconDotsVertical,
  IconSparkles,
  IconCalendar,
  IconSearch,
} from "@tabler/icons-react";
import { useNotifications } from "@/lib/hooks/use-notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { usePathname } from "next/navigation";
import Image from "next/image";

// ─── Navigation groups ─────────────────────────────────────────────────
const NAV_GENERAL = [
  { title: "Tableau de bord", url: "/candidat/dashboard", icon: IconDashboard },
  { title: "Mon profil", url: "/candidat/profil", icon: IconUser },
  { title: "Expériences", url: "/candidat/experiences", icon: IconBriefcase },
];

const NAV_RECRUTEMENT = [
  { title: "Candidatures", url: "/candidat/candidatures", icon: IconFileText },
  { title: "Matching IA", url: "/candidat/matching", icon: IconSparkles },
  { title: "Alertes emploi", url: "/candidat/alertes", icon: IconBell },
  { title: "Parcourir les offres", url: "/candidat/offres", icon: IconSearch },
];

const NAV_OUTILS = [
  { title: "Messages", url: "/candidat/messages", icon: IconMessage },
  { title: "Entretiens & Notes", url: "/candidat/entretiens", icon: IconCalendar },
  { title: "Documents", url: "/candidat/documents", icon: IconFolder },
  { title: "Objectifs", url: "/candidat/objectifs", icon: IconTarget },
  { title: "Notifications", url: "/candidat/notifications", icon: IconBell, badge: true },
];

// ─── Nav group ─────────────────────────────────────────────────────────
function NavGroup({
  label,
  items,
  pathname,
  unreadCount,
}: {
  label: string;
  items: { title: string; url: string; icon: React.ElementType; badge?: boolean }[];
  pathname: string;
  unreadCount?: number;
}) {
  return (
    <SidebarGroup style={{ paddingBottom: 4 }}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                <a href={item.url} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <item.icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5 }}>{item.title}</span>
                  {item.badge && unreadCount && unreadCount > 0 && (
                    <span className="cand-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ─── User footer ───────────────────────────────────────────────────────
function CandidatNavUser() {
  const { candidat, handleSignOut } = useCandidat();
  const { isMobile } = useSidebar();
  const initials = ((candidat?.prenom?.[0] ?? "") + (candidat?.nom?.[0] ?? "")).toUpperCase() || "?";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              style={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.04)",
                padding: "8px 10px",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #7C5CFC, #A78BFA)",
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ECEEF2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {candidat?.prenom} {candidat?.nom}
                </div>
                <div style={{ fontSize: 11, color: "rgba(236,238,242,0.42)" }}>Espace candidat</div>
              </div>
              <IconDotsVertical style={{ width: 14, height: 14, color: "rgba(236,238,242,0.35)", flexShrink: 0 }} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <div style={{ padding: "8px 12px 6px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0B0E14" }}>{candidat?.prenom} {candidat?.nom}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Candidat</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/candidat/profil">Mon profil</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              style={{ color: "#C2410C" }}
            >
              <IconLogout style={{ marginRight: 8, width: 14, height: 14 }} />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────
export function CandidatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Logo */}
      <SidebarHeader style={{ paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild style={{ paddingLeft: 4 }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Image
                  src="/img/icon2.png"
                  alt="Ylsix"
                  width={80}
                  height={30}
                  style={{ height: 26, width: "auto", filter: "brightness(0) invert(1)" }}
                />
                <span style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em",
                  textTransform: "uppercase", color: "rgba(236,238,242,0.35)",
                  borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 10,
                }}>
                  Candidat
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent style={{ paddingTop: 6 }}>
        <NavGroup label="Général" items={NAV_GENERAL} pathname={pathname} />
        <NavGroup label="Recrutement" items={NAV_RECRUTEMENT} pathname={pathname} />
        <NavGroup label="Outils" items={NAV_OUTILS} pathname={pathname} unreadCount={unreadCount} />

        {/* Bottom shortcut */}
        <SidebarGroup style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voir les offres d'emploi">
                  <a href="/offres" style={{ color: "rgba(236,238,242,0.45)", gap: 9 }}>
                    <IconBriefcase style={{ width: 15, height: 15 }} />
                    <span style={{ fontSize: 13 }}>Voir toutes les offres</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
        <CandidatNavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
