import { NextRequest, NextResponse } from "next/server";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import { auth } from "@/lib/auth";
import type { ApiResponse, ReorderColumnData } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/columns/reorder
 * Reorder columns
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

    const body: { updates: ReorderColumnData[] } = await request.json();

    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: "Invalid updates array" },
        { status: 400 }
      );
    }

    await kanbanRepository.reorderColumns(
      body.updates.map((u) => ({ id: u.columnId, order: u.newOrder }))
    );

    const result: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error reordering kanban columns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reorder kanban columns",
      },
      { status: 500 }
    );
  }
}


