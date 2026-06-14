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

  const applications = await kanbanRepository.getUnlinkedApplications(recruteurId);

  const result: ApiResponse<typeof applications> = { success: true, data: applications };
  return NextResponse.json(result);
});
