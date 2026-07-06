"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  IconLayoutDashboard,
  IconUsers,
  IconCoins,
} from "@tabler/icons-react";

const LINKS = [
  { href: "/superadmin", label: "Vue d'ensemble", icon: IconLayoutDashboard },
  { href: "/superadmin/utilisateurs", label: "Utilisateurs", icon: IconUsers },
  { href: "/superadmin/revenus", label: "Revenus", icon: IconCoins },
];

export function SuperadminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/superadmin"
            ? pathname === "/superadmin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
