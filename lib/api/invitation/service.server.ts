import { invitationRepository } from "./repository";
import { emailService } from "@/lib/email";
import prisma from "@/lib/prisma";

/**
 * Resend invitation email (server-side only)
 * Prolonge également la validité de l'invitation de 7 jours,
 * pour que le lien renvoyé fonctionne même si l'invitation avait expiré.
 */
export async function resendInvitationEmail(id: string): Promise<void> {
  const invitation = await invitationRepository.findById(id);

  if (!invitation) {
    throw new Error("Invitation non trouvée");
  }

  if (invitation.accepted) {
    throw new Error("Cette invitation a déjà été acceptée");
  }

  if (!invitation.recruteur) {
    throw new Error("Recruteur non trouvé pour cette invitation");
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.update({
    where: { id },
    data: { expiresAt },
  });

  // Envoyer l'email d'invitation
  await emailService.sendInvitationEmail({
    to: invitation.email,
    invitationToken: invitation.token,
    recruteurName: invitation.recruteur.companyName || "Équipe de recrutement",
    companyName: invitation.recruteur.companyName,
    role: invitation.role,
    expiresAt,
  });
}
