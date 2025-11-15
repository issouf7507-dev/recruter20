import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/candidats/[id]/conversations
 * Récupérer toutes les conversations d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidatId } = await params;

    if (!candidatId) {
      return NextResponse.json(
        { success: false, error: "Candidat ID is required" },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { candidatId },
      include: {
        recruteur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            logo: true,
            type: true,
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Dernier message uniquement
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}



