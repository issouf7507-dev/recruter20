import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formationService } from "@/lib/api/formations";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/formations
 * Créer une nouvelle formation
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

    const body = await request.json();

    // Vérifier que le candidat appartient à l'utilisateur connecté
    const candidat = await prisma.candidat.findUnique({
      where: { id: body.candidatId },
    });

    if (!candidat || candidat.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Créer la formation via le service
    const formation = await formationService.createFormation(body);

    return NextResponse.json(
      {
        success: true,
        data: formation,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating formation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create formation",
      },
      { status: error.message?.includes("Missing required") ? 400 : 500 },
    );
  }
}
