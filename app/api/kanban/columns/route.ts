import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type {
  CreateKanbanColumnData,
  ApiResponse,
} from "@/lib/api/kanban/types";

/**
 * GET /api/kanban/columns
 * Get all columns for a recruteur and job offer
 */
export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const searchParams = request.nextUrl.searchParams;
  const recruteurId = searchParams.get("recruteurId");

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  // Get all columns with their cards
  const result = await kanbanRepository.findColumnsByRecruteur(recruteurId);

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
  };

  return NextResponse.json(response);
});

/**
 * POST /api/kanban/columns
 * Create a new column
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body = await request.json();
  const {
    recruteurId,
    ...data
  }: CreateKanbanColumnData & { recruteurId: string } = body;

  if (!recruteurId || !data.name) {
    return badRequest("Missing required fields");
  }

  // Kanban is independent of offers, but schema requires jobOfferId
  // Use empty string as placeholder
  const column = await kanbanRepository.createColumn(recruteurId, {
    ...data,
    jobOfferId: data.jobOfferId || "",
  });

  const result: ApiResponse<typeof column> = {
    success: true,
    data: column,
  };

  return NextResponse.json(result, { status: 201 });
});
