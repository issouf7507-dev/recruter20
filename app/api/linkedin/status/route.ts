import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@/app/generated/prisma";
import { auth } from "@/lib/auth";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import prisma from "@/lib/prisma";

// const prisma = new PrismaClient();

/**
 * GET /api/linkedin/status
 * Vérifie si le compte LinkedIn est connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le recruteurId
    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
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
          canPublish: process.env.LINKEDIN_SHARE_ENABLED === "true",
        },
      });
    }

    const account = linkedInAccount[0];
    const isExpired = new Date(account.expiresAt) < new Date();

    // Vérifier si la publication automatique est activée
    const canPublish = process.env.LINKEDIN_SHARE_ENABLED === "true";

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
  } catch (error) {
    console.error("LinkedIn status error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la vérification" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE /api/linkedin/status
 * Déconnecte le compte LinkedIn
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le recruteurId
    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer le compte LinkedIn
    await prisma.$executeRaw`
      DELETE FROM linkedin_account WHERE recruteurId = ${recruteurId}
    `;

    return NextResponse.json({
      success: true,
      message: "Compte LinkedIn déconnecté",
    });
  } catch (error) {
    console.error("LinkedIn disconnect error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la déconnexion" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
