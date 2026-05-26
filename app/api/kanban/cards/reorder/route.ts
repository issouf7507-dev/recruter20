import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ReorderCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/cards/reorder - Reorder cards in a column
 */
export const PATCH = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body = await request.json();
  const { updates }: { updates: ReorderCardData[] } = body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return badRequest("updates array is required");
  }

  await kanbanRepository.reorderCards(
    updates.map((u) => ({
      cardId: u.cardId,
      newOrder: u.newOrder,
    }))
  );

  return NextResponse.json({ success: true });
});
