import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { experienceService } from "@/lib/api/experiences";
import prisma from "@/lib/prisma";

/**
 * POST /api/experiences
 * Créer une nouvelle expérience professionnelle
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

    // Vérifier que le candidat appartient à l'utilisateur connecté
    const candidat = await prisma.candidat.findUnique({
      where: { id: body.candidatId },
    });

    if (!candidat || candidat.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Créer l'expérience via le service
    const experience = await experienceService.createExperience(body);

    return NextResponse.json(
      {
        success: true,
        data: experience,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create experience" 
      },
      { status: error.message?.includes("Missing required") ? 400 : 500 }
    );
  }
}

