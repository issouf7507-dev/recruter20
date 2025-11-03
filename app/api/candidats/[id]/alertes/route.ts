import { NextRequest, NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";

/**
 * GET /api/candidats/[id]/alertes
 * Récupérer les alertes d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alertes = await alerteService.getAlertesByCandidatId(id);

    return NextResponse.json({
      success: true,
      data: alertes,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
