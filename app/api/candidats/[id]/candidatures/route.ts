import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures";

/**
 * GET /api/candidats/[id]/candidatures
 * Récupérer toutes les candidatures d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const candidatId = (await params)?.id;
    const applications = await applicationService.getApplicationsByCandidatId(
      candidatId
    );

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
