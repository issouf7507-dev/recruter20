"use server";

import { requireSuperAdmin } from "@/lib/superadmin";
import { emailService } from "@/lib/email";

export type TestEmailResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

/**
 * Envoie un email de test via Brevo depuis l'espace superadmin.
 * Sert à vérifier la configuration (clé API + expéditeur validé) de bout en bout.
 */
export async function sendTestEmailAction(to: string): Promise<TestEmailResult> {
  await requireSuperAdmin();

  const target = to?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    return { ok: false, error: "Adresse email invalide." };
  }

  const res = await emailService.sendTestEmail({ to: target });
  if (!res.success) {
    return { ok: false, error: res.error };
  }
  return { ok: true, messageId: res.messageId };
}
