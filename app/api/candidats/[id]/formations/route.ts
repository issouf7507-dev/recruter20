import { NextRequest, NextResponse } from "next/server";
import { formationService } from "@/lib/api/formations";

/**
 * GET /api/candidats/[id]/formations
 * Récupérer les formations d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formations = await formationService.getFormationsByCandidatId(id);

    return NextResponse.json({
      success: true,
      data: formations,
    });
  } catch (error) {
    console.error("Error fetching formations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch formations" },
      { status: 500 }
    );
  }
}

