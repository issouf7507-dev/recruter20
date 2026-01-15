"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  IconBriefcase,
  IconChartBar,
  IconCheck,
  IconDashboard,
  IconFileDescription,
  IconHeart,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutKanban,
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
import Image from "next/image";

const data = {
  // user: {
  //   name: "Recruteur",
  //   email: "recruteur@example.com",
  //   avatar: "/avatars/recruteur.jpg",
  // },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/recruteur/dashboard",
      icon: IconDashboard,
    },

    {
      title: "Offres d'emploi",
      url: "#",
      icon: IconBriefcase,
      subItems: [
        { label: "Créer une offre", url: "/recruteur/offres/creer" },
        { label: "Mes offres", url: "/recruteur/offres" },
        // { label: "Diffusion des offres", url: "#" },
        // { label: "Historique diffusion", url: "#" },
      ],
    },
    {
      title: "Candidatures",
      url: "#",
      icon: IconFileDescription,
      subItems: [
        {
          label: "Candidatures reçues",
          url: "/recruteur/candidatures",
        },
        {
          label: "Candidats favoris",
          url: "/recruteur/candidats-favoris",
        },
      ],
    },
    {
      title: "Tableau Kanban",
      url: "/recruteur/kanban",
      icon: IconLayoutKanban,
    },
    // {
    //   title: "Recherche de candidats",
    //   url: "/recruteur/recherche-candidats",
    //   icon: IconUsers,
    // },
    {
      title: "Recherche de candidats",
      url: "/recruteur/recherche-cv",
      icon: IconFileDescription,
    },
    {
      title: "Messagerie",
      url: "/recruteur/messagerie",
      icon: IconMail,
    },

    {
      title: "Matching",
      url: "/recruteur/matching",
      icon: IconCheck,
    },
    {
      title: "Matching IA",
      url: "/recruteur/matching-ai",
      icon: IconSparkles,
    },
    {
      title: "Multi-diffusion",
      url: "/recruteur/multi-diffusion",
      icon: IconShare,
    },

    {
      title: "Invitations",
      url: "/recruteur/invitations",
      icon: IconMail,
    },
    {
      title: "Statistiques et rapports",
      url: "/recruteur/statistiques",
      icon: IconChartBar,
    },
    {
      title: "Aide et support",
      url: "/recruteur/aide-support",
      icon: IconHelp,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/recruteur/parametres",
      icon: IconSettings,
    },
    // {
    //   title: "Aide",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Recherche",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };
  // console.log("sessionside", session);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/recruteur/dashboard">
                {/* <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Recruteur20</span> */}
                <Image
                  src="/img/icon2.png"
                  alt="Logo"
                  width={1000}
                  height={100}
                  className="w-15 h-8"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />

        {/* Bouton de basculement du mode sombre */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === "dark" ? (
              <IconSun className="h-4 w-4 mr-2" />
            ) : (
              <IconMoon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
