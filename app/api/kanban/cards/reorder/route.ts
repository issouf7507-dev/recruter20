import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ReorderCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/cards/reorder - Reorder cards in a column
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updates }: { updates: ReorderCardData[] } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "updates array is required" },
        { status: 400 }
      );
    }

    await kanbanRepository.reorderCards(
      updates.map((u) => ({
        cardId: u.cardId,
        newOrder: u.newOrder,
      }))
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error reordering cards:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reorder cards",
      },
      { status: 500 }
    );
  }
}

