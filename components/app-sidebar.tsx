"use client";

import * as React from "react";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  IconBriefcase,
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFlask,
  IconHelp,
  IconLayoutKanban,
  IconLock,
  IconMail,
  IconMoon,
  IconSettings,
  IconShare,
  IconSun,
  IconSparkles,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { SidebarUpgradeBanner } from "@/components/shared/SidebarUpgradeBanner";
import { PlanSelectionModal } from "@/components/shared/PlanSelectionModal";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId, useCollaborateurByUserId } from "@/lib/hooks/use-recruteurs";
import { useAbonnement } from "@/lib/hooks/use-abonnement";
import { planMeetsRequirement, type PlanDefinition } from "@/lib/plans";
import Image from "next/image";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  minPlan?: PlanDefinition["planType"];
  subItems?: { label: string; url: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { title: "Tableau de bord", url: "/recruteur/dashboard", icon: IconDashboard },
  {
    title: "Offres d'emploi",
    url: "#",
    icon: IconBriefcase,
    subItems: [
      { label: "Créer une offre", url: "/recruteur/offres/creer" },
      { label: "Mes offres", url: "/recruteur/offres" },
    ],
  },
  {
    title: "Candidatures",
    url: "#",
    icon: IconFileDescription,
    subItems: [
      { label: "Candidatures reçues", url: "/recruteur/candidatures" },
      { label: "Candidats favoris", url: "/recruteur/candidats-favoris" },
    ],
  },
  { title: "Tableau Kanban", url: "/recruteur/kanban", icon: IconLayoutKanban, minPlan: "PME" },
  { title: "Entretiens", url: "/recruteur/entretiens", icon: IconCalendar, minPlan: "PME" },
  { title: "Recherche de candidats", url: "/recruteur/recherche-cv", icon: IconFileDescription, minPlan: "PME" },
  { title: "Messagerie", url: "/recruteur/messagerie", icon: IconMail },
  { title: "Matching IA", url: "/recruteur/matching-ai", icon: IconSparkles, minPlan: "BUSINESS" },
  { title: "Multi-diffusion", url: "/recruteur/multi-diffusion", icon: IconShare, minPlan: "BUSINESS" },
  { title: "Invitations", url: "/recruteur/invitations", icon: IconMail, minPlan: "PME" },
  { title: "Statistiques et rapports", url: "/recruteur/statistiques", icon: IconChartBar, minPlan: "PME" },
  { title: "Aide et support", url: "/recruteur/aide-support", icon: IconHelp },
];

const NAV_SECONDARY = [
  { title: "Paramètres", url: "/recruteur/parametres", icon: IconSettings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;
  const { data: abonnement } = useAbonnement(recruteurId);

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  // Construire les items avec la notion de verrouillage
  const navItems = NAV_ITEMS.map((item) => {
    const locked = !!item.minPlan && !planMeetsRequirement(abonnement ?? null, item.minPlan);
    return { ...item, locked };
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/recruteur/dashboard">
                <Image src="/img/icon2.png" alt="Logo" width={1000} height={100} className="w-15 h-8" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
          onLockedClick={() => setUpgradeModalOpen(true)}
        />
        <NavSecondary items={NAV_SECONDARY} className="mt-auto" />

        <SidebarUpgradeBanner recruteurId={recruteurId ?? undefined} />

        {/* Lien dev uniquement */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-2 mb-1">
            <a href="/recruteur/dev">
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                <IconFlask className="h-3.5 w-3.5" />
                Changer de plan (dev)
              </button>
            </a>
          </div>
        )}

        <div className="p-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start">
            {theme === "dark" ? <IconSun className="h-4 w-4 mr-2" /> : <IconMoon className="h-4 w-4 mr-2" />}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <PlanSelectionModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </Sidebar>
  );
}
