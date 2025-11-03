import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { alerteService } from "@/lib/api/alertes";
import { alerteMatcher } from "@/lib/api/alertes/matcher";
import prisma from "@/lib/prisma";

/**
 * GET /api/alertes/[id]/matches
 * Récupérer les offres correspondant à une alerte
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Vérifier que l'utilisateur est propriétaire
    const isOwner = await alerteService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Récupérer l'alerte avec les mots-clés
    const alerte = await alerteService.getAlerteById(id);
    if (!alerte) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    // Trouver les offres correspondantes
    const matchingOffers = await alerteMatcher.findMatchingOffers(alerte);

    // Mettre à jour le nombre de résultats
    await prisma.alerteEmploi.update({
      where: { id },
      data: {
        nombreResultats: matchingOffers.length,
        derniereMiseAJour: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        alerte,
        offers: matchingOffers,
        count: matchingOffers.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching matching offers:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch matching offers",
      },
      { status: 500 }
    );
  }
}

