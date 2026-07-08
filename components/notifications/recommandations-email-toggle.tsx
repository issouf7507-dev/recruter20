"use client";

import { useEffect, useState } from "react";
import { IconLoader2, IconMailFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getRecommandationsEmail,
  setRecommandationsEmail,
} from "@/lib/actions/candidatPreferences";
import { Switch } from "@/components/ui/switch";

export function RecommandationsEmailToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRecommandationsEmail()
      .then(setEnabled)
      .catch(() => setEnabled(true));
  }, []);

  const handleToggle = async (next: boolean) => {
    const previous = enabled;
    setEnabled(next); // optimiste
    setSaving(true);
    try {
      const res = await setRecommandationsEmail(next);
      if (!res.ok) {
        setEnabled(previous);
        toast.error(res.error);
        return;
      }
      toast.success(
        next
          ? "Vous recevrez des offres par email chaque semaine."
          : "Vous ne recevrez plus d'offres par email.",
      );
    } catch {
      setEnabled(previous);
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <IconMailFilled className="mt-0.5 size-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Offres par email</p>
          <p className="text-xs text-muted-foreground">
            Recevez chaque semaine une sélection d&apos;offres qui correspondent à
            votre profil.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(enabled === null || saving) && (
          <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={enabled ?? true}
          disabled={enabled === null || saving}
          onCheckedChange={handleToggle}
          aria-label="Recevoir des offres par email chaque semaine"
        />
      </div>
    </div>
  );
}
