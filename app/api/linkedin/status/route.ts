import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, notFound } from "@/lib/api-error";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";

/**
 * GET /api/linkedin/status
 * Vérifie si le compte LinkedIn est connecté
 */
export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  // Récupérer le recruteurId
  const recruteur = await recruteurRepository.findByUserId(session.user.id);
  const collaborateur = await collaborateurRepository.findByUserId(
    session.user.id,
  );
  const recruteurId = recruteur?.id || collaborateur?.recruteurId;

  if (!recruteurId) {
    return notFound("Profil recruteur");
  }

  // Chercher le compte LinkedIn
  const linkedInAccount = await prisma.$queryRaw<
    Array<{
      id: string;
      recruteurId: string;
      expiresAt: Date;
      personId: string;
      profileName: string | null;
      profileImage: string | null;
    }>
  >`
    SELECT id, recruteurId, expiresAt, personId, profileName, profileImage
    FROM linkedin_account
    WHERE recruteurId = ${recruteurId}
    LIMIT 1
  `;

  if (!linkedInAccount || linkedInAccount.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        connected: false,
        canPublish: env.LINKEDIN_SHARE_ENABLED === "true",
      },
    });
  }

  const account = linkedInAccount[0];
  const isExpired = new Date(account.expiresAt) < new Date();

  // Vérifier si la publication automatique est activée
  const canPublish = env.LINKEDIN_SHARE_ENABLED === "true";

  return NextResponse.json({
    success: true,
    data: {
      connected: !isExpired,
      expired: isExpired,
      canPublish, // true si w_member_social est activé
      profileName: account.profileName,
      profileImage: account.profileImage,
      expiresAt: account.expiresAt,
    },
  });
});

/**
 * DELETE /api/linkedin/status
 * Déconnecte le compte LinkedIn
 */
export const DELETE = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  // Récupérer le recruteurId
  const recruteur = await recruteurRepository.findByUserId(session.user.id);
  const collaborateur = await collaborateurRepository.findByUserId(
    session.user.id,
  );
  const recruteurId = recruteur?.id || collaborateur?.recruteurId;

  if (!recruteurId) {
    return notFound("Profil recruteur");
  }

  // Supprimer le compte LinkedIn
  await prisma.$executeRaw`
    DELETE FROM linkedin_account WHERE recruteurId = ${recruteurId}
  `;

  return NextResponse.json({
    success: true,
    message: "Compte LinkedIn déconnecté",
  });
});
