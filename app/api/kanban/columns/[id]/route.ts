import { NextRequest, NextResponse } from "next/server";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import { auth } from "@/lib/auth";
import type {
  UpdateKanbanColumnData,
  ApiResponse,
} from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/columns/[id]
 * Update a column
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateKanbanColumnData = await request.json();
    const columnId = (await params).id;

    const column = await kanbanRepository.findColumnById(columnId);
    if (!column) {
      return NextResponse.json(
        { success: false, error: "Column not found" },
        { status: 404 }
      );
    }

    const updatedColumn = await kanbanRepository.updateColumn(columnId, body);

    const result: ApiResponse<typeof updatedColumn> = {
      success: true,
      data: updatedColumn,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating kanban column:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update kanban column",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/columns/[id]
 * Delete a column
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const columnId = (await params).id;

    const column = await kanbanRepository.findColumnById(columnId);
    if (!column) {
      return NextResponse.json(
        { success: false, error: "Column not found" },
        { status: 404 }
      );
    }

    await kanbanRepository.deleteColumn(columnId);

    const result: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting kanban column:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete kanban column",
      },
      { status: 500 }
    );
  }
}
