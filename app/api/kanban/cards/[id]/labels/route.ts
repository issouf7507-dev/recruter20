import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, KanbanCard } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/cards/[id]/labels - Add a label to a card
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cardId = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { labelId, recruteurId } = body as {
      labelId: string;
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    if (!labelId) {
      return NextResponse.json(
        { success: false, error: "labelId is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.addCardLabel(
      cardId,
      labelId,
      recruteurId,
      session.user.id
    );

    const result: ApiResponse<KanbanCard> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error adding card label:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add card label",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/cards/[id]/labels - Remove a label from a card
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cardId = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { labelId, recruteurId } = body as {
      labelId: string;
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    if (!labelId) {
      return NextResponse.json(
        { success: false, error: "labelId is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.removeCardLabel(
      cardId,
      labelId,
      recruteurId,
      session.user.id
    );

    const result: ApiResponse<KanbanCard> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing card label:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove card label",
      },
      { status: 500 }
    );
  }
}

