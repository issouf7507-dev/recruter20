import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, notFound } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type {
  UpdateKanbanColumnData,
  ApiResponse,
} from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/kanban/columns/[id]
 * Update a column
 */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body: UpdateKanbanColumnData = await request.json();
  const columnId = (await (ctx as Ctx).params).id;

  const column = await kanbanRepository.findColumnById(columnId);
  if (!column) {
    return notFound("Column");
  }

  const updatedColumn = await kanbanRepository.updateColumn(columnId, body);

  const result: ApiResponse<typeof updatedColumn> = {
    success: true,
    data: updatedColumn,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/columns/[id]
 * Delete a column
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const columnId = (await (ctx as Ctx).params).id;

  const column = await kanbanRepository.findColumnById(columnId);
  if (!column) {
    return notFound("Column");
  }

  await kanbanRepository.deleteColumn(columnId);

  const result: ApiResponse<null> = {
    success: true,
    data: null,
  };

  return NextResponse.json(result);
});
