import { ApiResponse, CreateInvitation, Invitation } from "./types";

export async function createInvitation(
  data: CreateInvitation
): Promise<Invitation> {
  const response = await fetch("/api/invitations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result: ApiResponse<Invitation> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch offer");
  }

  return result.data;
}

export async function acceptInvitation(
  token: string,
  userId: string,
  collaborateurData: { nom: string; prenom: string }
): Promise<Invitation> {
  const response = await fetch(`/api/invitations/accept/${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      collaborateurData: collaborateurData,
    }),
  });
  const result: ApiResponse<Invitation> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to accept invitation");
  }

  return result.data;
}
export async function fetchInvitations(): Promise<Invitation[]> {
  const response = await fetch("/api/invitations");
  const result: ApiResponse<Invitation[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch invitations");
  }

  return result.data;
}

// ///////
// import type { Invitation, CreateInvitation, InvitationResponse } from "./types";
// import { invitationRepository } from "./repository";
// import { emailService } from "@/lib/email";
// import prisma from "@/lib/prisma";

// /**
//  * Fetch all invitations
//  */
// export async function fetchInvitations(
//   recruteurId?: string
// ): Promise<InvitationResponse[]> {
//   if (!recruteurId) {
//     throw new Error("recruteurId is required");
//   }
//   return invitationRepository.findAll(recruteurId);
// }

// /**
//  * Create a new invitation and send email
//  */
// export async function createInvitation(
//   data: CreateInvitation
// ): Promise<Invitation> {
//   // Vérifier si l'email existe déjà comme utilisateur
//   const existingUser = await prisma.user.findUnique({
//     where: { email: data.email },
//   });

//   if (existingUser) {
//     // Vérifier si l'utilisateur est déjà collaborateur pour ce recruteur
//     const existingCollaborateur = await prisma.collaborateur.findFirst({
//       where: {
//         email: data.email,
//         recruteurId: data.recruteurId,
//       },
//     });

//     if (existingCollaborateur) {
//       throw new Error("Cet utilisateur est déjà collaborateur pour ce recruteur");
//     }
//   }

//   // Vérifier si une invitation en attente existe déjà
//   const existingInvitation = await prisma.invitation.findFirst({
//     where: {
//       email: data.email,
//       recruteurId: data.recruteurId,
//       accepted: false,
//       expiresAt: {
//         gt: new Date(),
//       },
//     },
//   });

//   if (existingInvitation) {
//     throw new Error("Une invitation en attente existe déjà pour cet email");
//   }

//   // Créer l'invitation
//   const invitation = await invitationRepository.create(data);

//   // Récupérer les informations du recruteur pour l'email
//   const recruteur = await prisma.recruteur.findUnique({
//     where: { id: data.recruteurId },
//     include: {
//       user: true,
//     },
//   });

//   if (!recruteur) {
//     throw new Error("Recruteur non trouvé");
//   }

//   // Envoyer l'email d'invitation
//   try {
//     await emailService.sendInvitationEmail({
//       to: data.email,
//       invitationToken: invitation.token,
//       recruteurName: recruteur.user.name || recruteur.companyName || "Équipe de recrutement",
//       companyName: recruteur.companyName,
//       role: data.role,
//       expiresAt: invitation.expiresAt,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'email:", error);
//     // Ne pas faire échouer la création de l'invitation si l'email échoue
//     // L'invitation est créée, l'email peut être renvoyé plus tard
//   }

//   return invitation;
// }

// /**
//  * Accept an invitation
//  */
// export async function acceptInvitation(
//   token: string,
//   userId: string,
//   collaborateurData: { nom: string; prenom: string }
// ) {
//   // Trouver l'invitation par token
//   const invitation = await invitationRepository.findByToken(token);

//   if (!invitation) {
//     throw new Error("Invitation non trouvée");
//   }

//   if (invitation.accepted) {
//     throw new Error("Cette invitation a déjà été acceptée");
//   }

//   if (new Date() > invitation.expiresAt) {
//     throw new Error("Cette invitation a expiré");
//   }

//   // Vérifier que l'email correspond à l'utilisateur
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//   });

//   if (!user || user.email !== invitation.email) {
//     throw new Error("L'email de l'invitation ne correspond pas à votre compte");
//   }

//   // Accepter l'invitation et créer le collaborateur
//   const result = await invitationRepository.accept(
//     invitation.id,
//     userId,
//     collaborateurData
//   );

//   // Mettre à jour le type d'utilisateur si nécessaire
//   if (user.type !== "COLLABORATEUR") {
//     await prisma.user.update({
//       where: { id: userId },
//       data: { type: "COLLABORATEUR" },
//     });
//   }

//   // Envoyer un email de confirmation
//   try {
//     await emailService.sendAcceptanceConfirmationEmail({
//       to: invitation.email,
//       collaborateurName: `${collaborateurData.prenom} ${collaborateurData.nom}`,
//       recruteurName: result.invitation.recruteur.companyName || "Équipe de recrutement",
//       companyName: result.invitation.recruteur.companyName,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
//     // Ne pas faire échouer l'acceptation si l'email échoue
//   }

//   return result;
// }

// /**
//  * Delete an invitation
//  */
// export async function deleteInvitation(id: string): Promise<void> {
//   await invitationRepository.delete(id);
// }

// /**
//  * Resend invitation email
//  */
// export async function resendInvitationEmail(id: string): Promise<void> {
//   const invitation = await invitationRepository.findById(id);

//   if (!invitation) {
//     throw new Error("Invitation non trouvée");
//   }

//   if (invitation.accepted) {
//     throw new Error("Cette invitation a déjà été acceptée");
//   }

//   // Envoyer l'email d'invitation
//   await emailService.sendInvitationEmail({
//     to: invitation.email,
//     invitationToken: invitation.token,
//     recruteurName: invitation.recruteur.companyName || "Équipe de recrutement",
//     companyName: invitation.recruteur.companyName,
//     role: invitation.role,
//     expiresAt: invitation.expiresAt,
//   });
// }
