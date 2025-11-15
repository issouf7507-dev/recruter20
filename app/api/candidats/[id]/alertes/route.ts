import { NextRequest, NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";
import { alerteMatcher } from "@/lib/api/alertes/matcher";

/**
 * GET /api/candidats/[id]/alertes
 * Récupérer les alertes d'un candidat
 * Met à jour automatiquement le nombre de résultats pour chaque alerte
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mettre à jour les compteurs de résultats pour toutes les alertes
    await alerteMatcher.updateAllAlertsCount(id);

    // Récupérer les alertes avec les compteurs mis à jour
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
