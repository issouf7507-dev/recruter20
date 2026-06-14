import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const recruteurId = request.nextUrl.searchParams.get("recruteurId");
  if (!recruteurId) return badRequest("recruteurId est requis");

  const cards = await kanbanRepository.findArchivedCards(recruteurId);

  const result: ApiResponse<typeof cards> = { success: true, data: cards };
  return NextResponse.json(result);
});
