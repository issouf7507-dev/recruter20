import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { invitationRepository } from "@/lib/api/invitation/repository";

const createInvitationSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "USER", "MANAGER", "VIEWER"]),
});

/**
 * GET /api/invitations
 * Récupérer toutes les invitations d'un recruteur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Récupérer l'utilisateur complet avec son type
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.type !== "RECRUTEUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Seuls les recruteurs peuvent voir les invitations",
        },
        { status: 403 },
      );
    }

    // Récupérer le recruteur associé à l'utilisateur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, error: "Recruteur non trouvé" },
        { status: 404 },
      );
    }

    // const invitations = await fetchInvitations(recruteur.id);
    const invitations = await invitationRepository.findAll(recruteur.id);

    return NextResponse.json({
      success: true,
      data: invitations,
    });
  } catch (error: any) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch invitations",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/invitations
 * Créer une nouvelle invitation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Récupérer l'utilisateur complet avec son type
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.type !== "RECRUTEUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Seuls les recruteurs peuvent créer des invitations",
        },
        { status: 403 },
      );
    }

    // Récupérer le recruteur associé à l'utilisateur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, error: "Recruteur non trouvé" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    // Créer l'invitation
    const invitation = await invitationRepository.create({
      email: validatedData.email,
      recruteurId: recruteur.id,
      role: validatedData.role,
    });

    return NextResponse.json(
      {
        success: true,
        data: invitation,
        message: "Invitation créée et email envoyé avec succès",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating invitation:", error);

    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    // Gestion des erreurs métier
    if (
      error.message?.includes("déjà collaborateur") ||
      error.message?.includes("invitation en attente")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create invitation",
      },
      { status: error.message?.includes("non trouvé") ? 404 : 500 },
    );
  }
}
