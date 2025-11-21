import { NextRequest, NextResponse } from "next/server";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import { auth } from "@/lib/auth";
import type {
  MoveApplicationData,
  ApiResponse,
  ApplicationStatus,
} from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/applications/move
 * Move an application to a different column (update status)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: MoveApplicationData = await request.json();

    if (!body.applicationId || !body.newStatus) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership
    const application = await kanbanRepository.findApplicationById(
      body.applicationId
    );
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
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
  } catch (error: any) {
    console.error("Error moving application:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to move application",
      },
      { status: 500 }
    );
  }
}


