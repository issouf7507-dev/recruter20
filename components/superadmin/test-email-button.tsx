"use client";

import { useState } from "react";
import { IconMail, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { sendTestEmailAction } from "@/lib/actions/superadminEmail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TestEmailButton({ defaultEmail }: { defaultEmail: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await sendTestEmailAction(email);
      if (!res.ok) {
        toast.error(`Échec de l'envoi : ${res.error}`);
        return;
      }
      toast.success(`Email de test envoyé à ${email}.`);
    } catch {
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="destinataire@exemple.com"
        className="sm:max-w-xs"
        disabled={sending}
      />
      <Button onClick={handleSend} disabled={sending || !email} className="gap-1.5">
        {sending ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconMail className="size-4" />
        )}
        Envoyer un email de test
      </Button>
    </div>
  );
}
