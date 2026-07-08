"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireCandidat() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const candidat = await prisma.candidat.findUnique({
    where: { userId: session.user.id },
    select: { id: true, recommandationsEmail: true },
  });
  return candidat;
}

/**
 * Lit la préférence « recevoir des offres par email » du candidat connecté.
 * Défaut `true` si le profil est introuvable (opt-in par défaut).
 */
export async function getRecommandationsEmail(): Promise<boolean> {
  const candidat = await requireCandidat();
  return candidat?.recommandationsEmail ?? true;
}

export type SetRecoResult = { ok: true; enabled: boolean } | { ok: false; error: string };

/**
 * Active/désactive l'envoi hebdomadaire d'offres recommandées par email.
 */
export async function setRecommandationsEmail(
  enabled: boolean,
): Promise<SetRecoResult> {
  const candidat = await requireCandidat();
  if (!candidat) return { ok: false, error: "Profil candidat introuvable." };

  await prisma.candidat.update({
    where: { id: candidat.id },
    data: { recommandationsEmail: enabled },
  });
  return { ok: true, enabled };
}
