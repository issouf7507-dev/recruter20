"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconLoader2, IconShieldLock } from "@tabler/icons-react";
import { toast } from "sonner";
import { setSuperAdminRole } from "@/lib/actions/superadminUsers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  type: string | null;
  emailVerified: boolean | null;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  companyName: string | null;
  phone: string | null;
  ville: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  CANDIDAT: "Candidat",
  RECRUTEUR: "Recruteur",
  COLLABORATEUR: "Collaborateur",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function UserDetailSheet({
  user,
  isSelf,
}: {
  user: UserDetail;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(user.isSuperAdmin);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (next: boolean) => {
    setSaving(true);
    // Optimiste
    setIsSuperAdmin(next);
    try {
      const res = await setSuperAdminRole(user.id, next);
      if (!res.ok) {
        setIsSuperAdmin(!next);
        toast.error(res.error);
        return;
      }
      toast.success(
        next
          ? "Rôle super admin accordé."
          : "Rôle super admin retiré.",
      );
      router.refresh();
    } catch {
      setIsSuperAdmin(!next);
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <IconEye className="size-4" />
          Détails
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {user.name ?? "Utilisateur"}
            {isSuperAdmin && <Badge>Super admin</Badge>}
          </SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 px-4 pb-4">
          <Row
            label="Type"
            value={
              user.type ? (
                <Badge variant="outline">
                  {TYPE_LABELS[user.type] ?? user.type}
                </Badge>
              ) : (
                "—"
              )
            }
          />
          <Separator />
          <Row
            label="Email vérifié"
            value={
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Oui" : "Non"}
              </Badge>
            }
          />
          <Separator />
          <Row
            label="2FA active"
            value={
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                {user.twoFactorEnabled ? "Oui" : "Non"}
              </Badge>
            }
          />
          <Separator />
          {user.companyName && <Row label="Entreprise" value={user.companyName} />}
          {user.ville && <Row label="Ville" value={user.ville} />}
          {user.phone && <Row label="Téléphone" value={user.phone} />}
          <Row
            label="Inscrit le"
            value={user.createdAt.toLocaleDateString("fr-FR")}
          />
          <Row
            label="ID"
            value={<span className="font-mono text-xs">{user.id}</span>}
          />

          <Separator className="my-3" />

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-2">
                <IconShieldLock className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Rôle super admin</p>
                  <p className="text-xs text-muted-foreground">
                    Accès à l'espace /superadmin
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saving && (
                  <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  checked={isSuperAdmin}
                  disabled={saving || (isSelf && isSuperAdmin)}
                  onCheckedChange={handleToggle}
                  aria-label="Basculer le rôle super admin"
                />
              </div>
            </div>
            {isSelf && isSuperAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">
                Vous ne pouvez pas retirer votre propre rôle.
              </p>
            )}
            {!user.twoFactorEnabled && isSuperAdmin && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                Ce compte devra configurer sa 2FA à sa prochaine connexion pour
                accéder à l'espace.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
