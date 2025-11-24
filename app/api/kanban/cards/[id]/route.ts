import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { UpdateKanbanCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/cards/[id] - Update a card
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      recruteurId,
      userId,
      ...data
    }: UpdateKanbanCardData & { recruteurId: string; userId?: string } = body;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    // Use session.user.id as userId if not provided
    const finalUserId = userId || session.user.id;

    const card = await kanbanRepository.updateCard(
      id,
      data,
      recruteurId,
      finalUserId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update card",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/cards/[id] - Delete a card
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { recruteurId } = body as { recruteurId?: string };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    await kanbanRepository.deleteCard(id, recruteurId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete card",
      },
      { status: 500 }
    );
  }
}
