import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, ReorderColumnData } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/columns/reorder
 * Reorder columns
 */
export const PATCH = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body: { updates: ReorderColumnData[] } = await request.json();

  if (!body.updates || !Array.isArray(body.updates)) {
    return badRequest("Invalid updates array");
  }

  await kanbanRepository.reorderColumns(
    body.updates.map((u) => ({ id: u.columnId, order: u.newOrder }))
  );

  const result: ApiResponse<null> = {
    success: true,
    data: null,
  };

  return NextResponse.json(result);
});
