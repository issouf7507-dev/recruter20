"use client";

import { useState } from "react";
import { IconLogout, IconLoader2, IconUserCog } from "@tabler/icons-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SuperadminUserMenu({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      // Rechargement complet pour purger l'état client et repasser par le guard
      window.location.href = "/superadmin/login";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <IconUserCog className="size-4" />
          <span className="hidden max-w-[160px] truncate md:inline">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault();
            if (!loading) handleLogout();
          }}
        >
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconLogout className="size-4" />
          )}
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
