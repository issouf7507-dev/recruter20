import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { conversationRepository } from "@/lib/api/conversations/repository";

/**
 * GET /api/conversations
 * Récupérer toutes les conversations d'un recruteur
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recruteurId = searchParams.get("recruteurId");

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Recruteur ID is required" },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { recruteurId },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
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

/**
 * POST /api/conversations
 * Créer ou récupérer une conversation existante
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOfferId, candidatId, recruteurId } = body;

    if (!jobOfferId || !candidatId || !recruteurId) {
      return NextResponse.json(
        {
          success: false,
          error: "jobOfferId, candidatId et recruteurId sont requis",
        },
        { status: 400 }
      );
    }

    // Vérifier si une conversation existe déjà
    const conversation = await conversationRepository.create({
      jobOfferId,
      candidatId,
      recruteurId,
    });

    return NextResponse.json({
      success: true,
      data: conversation,
      isNew: !conversation?.messages?.length,
    });
  } catch (error) {
    console.error("Error creating/fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/fetch conversation" },
      { status: 500 }
    );
  }
}
