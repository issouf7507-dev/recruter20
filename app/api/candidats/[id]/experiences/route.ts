import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "@/lib/api/experiences";

/**
 * GET /api/candidats/[id]/experiences
 * Récupérer les expériences d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const experiences = await experienceService.getExperiencesByCandidatId(id);

    return NextResponse.json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
