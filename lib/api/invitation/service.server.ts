import { invitationRepository } from "./repository";
import { emailService } from "@/lib/email";

/**
 * Resend invitation email (server-side only)
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

  // Envoyer l'email d'invitation
  await emailService.sendInvitationEmail({
    to: invitation.email,
    invitationToken: invitation.token,
    recruteurName: invitation.recruteur.companyName || "Équipe de recrutement",
    companyName: invitation.recruteur.companyName,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
  });
}
