"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconUserPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { createUserAsSuperAdmin } from "@/lib/actions/superadminUsers";
import type { UserType } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: "CANDIDAT", label: "Candidat" },
  { value: "RECRUTEUR", label: "Recruteur" },
  { value: "COLLABORATEUR", label: "Collaborateur" },
];

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<UserType>("CANDIDAT");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setType("CANDIDAT");
    setIsSuperAdmin(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserAsSuperAdmin({
        name,
        email,
        password,
        type,
        isSuperAdmin,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Utilisateur créé.");
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <IconUserPlus className="size-4" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
            <DialogDescription>
              Le compte est créé avec email vérifié et peut se connecter
              immédiatement avec le mot de passe défini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cu-name">Nom complet</Label>
              <Input
                id="cu-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cu-email">Email</Label>
              <Input
                id="cu-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cu-password">Mot de passe</Label>
              <Input
                id="cu-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cu-type">Type de compte</Label>
              <Select value={type} onValueChange={(v) => setType(v as UserType)}>
                <SelectTrigger id="cu-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                className="size-4 accent-primary"
              />
              Accorder le rôle super admin
            </label>
            {isSuperAdmin && (
              <p className="-mt-2 text-xs text-muted-foreground">
                Le super admin devra configurer sa double authentification (2FA)
                à sa première connexion.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="size-4 animate-spin" />}
              Créer le compte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
