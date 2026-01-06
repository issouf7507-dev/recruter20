import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/offres/[id]/views
 * Incrémenter le nombre de vues d'une offre d'emploi
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier que l'offre existe
    const existingOffer = await prisma.jobOffer.findUnique({
      where: { id },
      select: { id: true, views: true },
    });

    if (!existingOffer) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de vues
    const updatedOffer = await prisma.jobOffer.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        views: updatedOffer.views,
      },
    });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment views" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/offres/[id]/views
 * Récupérer le nombre de vues d'une offre d'emploi
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const offer = await prisma.jobOffer.findUnique({
      where: { id },
      select: {
        id: true,
        views: true,
      },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        views: offer.views || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching views:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}
