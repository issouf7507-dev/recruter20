import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicationService } from "@/lib/api/candidatures";
import prisma from "@/lib/prisma";

/**
 * POST /api/candidatures
 * Créer une nouvelle candidature (postuler à une offre)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobOfferId, message, cv } = body;

    // Récupérer le candidat associé à l'utilisateur
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { success: false, error: "Candidat profile not found" },
        { status: 404 }
      );
    }

    // Créer la candidature via le service
    const application = await applicationService.createApplication({
      candidatId: candidat.id,
      jobOfferId,
      message,
      cv,
    });

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating application:", error);

    // Erreur spécifique pour candidature déjà existante
    if (error.message?.includes("already applied")) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous avez déjà postulé à cette offre",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create application",
      },
      { status: error.message?.includes("Missing required") ? 400 : 500 }
    );
  }
}
