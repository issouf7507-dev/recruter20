import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withErrorHandler, notFound, badRequest } from "@/lib/api-error";
import { z } from "zod";
import { invitationRepository } from "@/lib/api/invitation/repository";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ token: string }> };

const acceptInvitationSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .optional(),
});

/**
 * POST /api/invitations/accept/[token]
 * Accepter une invitation (avec ou sans compte existant)
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const { token } = await (ctx as Ctx).params;
  const body = await request.json();
  const validatedData = acceptInvitationSchema.parse(body);

  // Récupérer l'invitation
  const invitation = await invitationRepository.findByToken(token);

  if (!invitation) {
    return notFound("Invitation");
  }

  if (invitation.accepted) {
    return badRequest("Cette invitation a déjà été acceptée");
  }

  if (new Date() > invitation.expiresAt) {
    return badRequest("Cette invitation a expiré");
  }

  // Vérifier si l'utilisateur est connecté
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  let userId: string;

  // Vérifier si un compte existe déjà avec l'email de l'invitation
  let user = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (user) {
    // Un compte existe déjà avec cet email
    if (session?.user && session.user.email === invitation.email) {
      // L'utilisateur est connecté avec le bon email
      userId = session.user.id;
    } else {
      // L'utilisateur n'est pas connecté ou est connecté avec un autre email
      // Il doit se connecter avec le compte correspondant à l'invitation
      return NextResponse.json(
        {
          success: false,
          error:
            "Un compte existe déjà avec cet email. Veuillez vous connecter avec ce compte pour accepter l'invitation.",
          requiresLogin: true,
          email: invitation.email,
        },
        { status: 400 }
      );
    }
  } else {
    // Aucun compte n'existe avec cet email, on doit en créer un
    if (!validatedData.password) {
      return badRequest("Un mot de passe est requis pour créer votre compte");
    }

    // Si l'utilisateur est connecté avec un autre email, on ignore sa session
    // et on crée un nouveau compte avec l'email de l'invitation
    // Utiliser l'API HTTP de better-auth pour créer le compte
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const signUpResponse = await fetch(
        `${baseURL}/api/auth/sign-up/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: invitation.email,
            password: validatedData.password,
            name: `${validatedData.prenom} ${validatedData.nom}`,
          }),
        }
      );

      const signUpData = await signUpResponse.json();

      if (!signUpResponse.ok) {
        // Si le compte existe déjà, essayer de le récupérer
        if (
          signUpData.message?.includes("already") ||
          signUpData.code === "EMAIL_ALREADY_EXISTS"
        ) {
          user = await prisma.user.findUnique({
            where: { email: invitation.email },
          });

          if (user) {
            userId = user.id;
          } else {
            throw new Error(
              "Un compte existe déjà avec cet email. Veuillez vous connecter."
            );
          }
        } else {
          throw new Error(
            signUpData.message || "Erreur lors de la création du compte"
          );
        }
      } else {
        // Récupérer l'utilisateur créé
        user = await prisma.user.findUnique({
          where: { email: invitation.email },
        });

        if (!user) {
          throw new Error("Compte créé mais utilisateur non trouvé");
        }

        // Mettre à jour le type d'utilisateur
        user = await prisma.user.update({
          where: { id: user.id },
          data: { type: "COLLABORATEUR" },
        });

        userId = user.id;
      }
    } catch (error: any) {
      // Si l'erreur indique que le compte existe déjà, essayer de le récupérer
      if (
        error.message?.includes("already exists") ||
        error.message?.includes("déjà") ||
        error.message?.includes("email already")
      ) {
        user = await prisma.user.findUnique({
          where: { email: invitation.email },
        });

        if (user) {
          userId = user.id;
        } else {
          throw new Error(
            "Un compte existe déjà avec cet email. Veuillez vous connecter."
          );
        }
      } else {
        throw error;
      }
    }
  }

  // Accepter l'invitation et créer le collaborateur
  // Note: le repository.accept attend un id, pas un token
  const result = await invitationRepository.accept(invitation.id, userId, {
    nom: validatedData.nom,
    prenom: validatedData.prenom,
  });

  return NextResponse.json(
    {
      success: true,
      data: result,
      message: "Invitation acceptée avec succès",
      userId: userId,
    },
    { status: 200 }
  );
});

/**
 * GET /api/invitations/accept/[token]
 * Récupérer les informations d'une invitation par token (pour affichage avant acceptation)
 */
export const GET = withErrorHandler(async (req, ctx) => {
  const { token } = await (ctx as Ctx).params;

  // Importer dynamiquement pour éviter les erreurs circulaires
  const { invitationRepository } = await import(
    "@/lib/api/invitation/repository"
  );

  const invitation = await invitationRepository.findByToken(token);

  if (!invitation) {
    return notFound("Invitation");
  }

  if (invitation.accepted) {
    return badRequest("Cette invitation a déjà été acceptée");
  }

  if (new Date() > invitation.expiresAt) {
    return badRequest("Cette invitation a expiré");
  }

  // Retourner uniquement les informations nécessaires (sans données sensibles)
  return NextResponse.json({
    success: true,
    data: {
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      recruteur: {
        companyName: invitation.recruteur.companyName,
        email: invitation.recruteur.email,
      },
    },
  });
});
