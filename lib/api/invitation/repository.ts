import { prisma } from "@/lib/prisma";
import type {
  CreateInvitation,
  Invitation,
  InvitationResponse,
  Role,
} from "./types";
import crypto from "crypto";
import { emailService } from "@/lib/email";

/**
 * Repository for job offers - Database operations
 */
export class InvitationRepository {
  /**
   * Get all offers with pagination
   */
  async findAll(recruteurId: string): Promise<InvitationResponse[]> {
    return prisma.invitation.findMany({
      where: { recruteurId },
      include: {
        recruteur: true,
      },
    });
  }

  /**
   * Get invitation by ID
   */
  async findById(id: string) {
    return prisma.invitation.findUnique({
      where: { id },
      include: {
        recruteur: true,
        collaborateur: true,
      },
    });
  }

  /**
   * Get invitation by token
   */
  async findByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        recruteur: true,
        collaborateur: true,
      },
    });
  }

  /**
   * Create a new offer
   */
  async create(data: { email: string; recruteurId: string; role: Role }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // Vérifier si l'utilisateur est déjà collaborateur pour ce recruteur
      const existingCollaborateur = await prisma.collaborateur.findFirst({
        where: {
          email: data.email,
          recruteurId: data.recruteurId,
        },
      });

      if (existingCollaborateur) {
        throw new Error(
          "Cet utilisateur est déjà collaborateur pour ce recruteur",
        );
      }
    }

    // Vérifier si une invitation en attente existe déjà
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: data.email,
        recruteurId: data.recruteurId,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new Error("Une invitation en attente existe déjà pour cet email");
    }

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        recruteurId: data.recruteurId,
        role: data.role as any,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        recruteur: true,
      },
    });

    // Récupérer les informations du recruteur pour l'email
    const recruteur = await prisma.recruteur.findUnique({
      where: { id: data.recruteurId },
      include: {
        user: true,
      },
    });

    if (!recruteur) {
      throw new Error("Recruteur non trouvé");
    }

    // Envoyer l'email d'invitation
    try {
      await emailService.sendInvitationEmail({
        to: data.email,
        invitationToken: invitation.token,
        recruteurName:
          recruteur.user.name ||
          recruteur.companyName ||
          "Équipe de recrutement",
        companyName: recruteur.companyName,
        role: data.role,
        expiresAt: invitation.expiresAt,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      // Ne pas faire échouer la création de l'invitation si l'email échoue
      // L'invitation est créée, l'email peut être renvoyé plus tard
    }

    return invitation;
  }

  /**
   * Accept an invitation and create collaborateur
   */
  async accept(
    id: string,
    userId: string,
    collaborateurData: { nom: string; prenom: string },
  ) {
    // Utiliser une transaction pour garantir la cohérence
    return prisma.$transaction(async (tx) => {
      // Récupérer l'invitation par ID
      const invitation = await tx.invitation.findUnique({
        where: { id },
        include: {
          recruteur: true,
        },
      });

      if (!invitation) {
        throw new Error("Invitation non trouvée");
      }

      if (invitation.accepted) {
        throw new Error("Cette invitation a déjà été acceptée");
      }

      if (new Date() > invitation.expiresAt) {
        throw new Error("Cette invitation a expiré");
      }

      // Vérifier que l'email correspond à l'utilisateur
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== invitation.email) {
        throw new Error(
          "L'email de l'invitation ne correspond pas à votre compte",
        );
      }

      // Mettre à jour l'invitation
      const updatedInvitation = await tx.invitation.update({
        where: { id },
        data: { accepted: true },
        include: {
          recruteur: true,
        },
      });

      // Créer le collaborateur
      const collaborateur = await tx.collaborateur.create({
        data: {
          email: updatedInvitation.email,
          nom: collaborateurData.nom,
          prenom: collaborateurData.prenom,
          role: updatedInvitation.role,
          recruteurId: updatedInvitation.recruteurId,
          invitationId: updatedInvitation.id,
          userId: userId,
        },
        include: {
          recruteur: true,
        },
      });

      // Mettre à jour le type d'utilisateur si nécessaire
      if (user.type !== "COLLABORATEUR") {
        await tx.user.update({
          where: { id: userId },
          data: { type: "COLLABORATEUR" },
        });
      }

      // Envoyer un email de confirmation
      try {
        await emailService.sendAcceptanceConfirmationEmail({
          to: updatedInvitation.email,
          collaborateurName: `${collaborateurData.prenom} ${collaborateurData.nom}`,
          recruteurName:
            updatedInvitation.recruteur.companyName || "Équipe de recrutement",
          companyName: updatedInvitation.recruteur.companyName,
        });
      } catch (error) {
        console.error(
          "Erreur lors de l'envoi de l'email de confirmation:",
          error,
        );
        // Ne pas faire échouer l'acceptation si l'email échoue
      }

      return { invitation: updatedInvitation, collaborateur };
    });

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
  }

  /**
   * Delete an invitation
   */
  async delete(id: string) {
    return prisma.invitation.delete({
      where: { id },
    });
  }
}

export const invitationRepository = new InvitationRepository();
