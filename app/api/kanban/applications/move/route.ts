import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest, notFound } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type {
  MoveApplicationData,
  ApiResponse,
  ApplicationStatus,
} from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/applications/move
 * Move an application to a different column (update status)
 */
export const PATCH = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body: MoveApplicationData = await request.json();

  if (!body.applicationId || !body.newStatus) {
    return badRequest("Missing required fields");
  }

  // Verify ownership
  const application = await kanbanRepository.findApplicationById(
    body.applicationId
  );
  if (!application) {
    return notFound("Application");
  }

  const movedApplication = await kanbanRepository.updateApplicationStatus(
    body.applicationId,
    body.newStatus as ApplicationStatus
  );

  const result: ApiResponse<typeof movedApplication> = {
    success: true,
    data: movedApplication,
  };

  return NextResponse.json(result);
});
