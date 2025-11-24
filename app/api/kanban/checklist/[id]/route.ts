import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/checklist/[id] - Update a checklist item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const checkItemId = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { label, isDone, recruteurId } = body as {
      label?: string;
      isDone?: boolean;
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.updateCheckItem(
      checkItemId,
      { label, isDone },
      recruteurId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating check item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update check item",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/checklist/[id] - Delete a checklist item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const checkItemId = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recruteurId } = body as {
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.deleteCheckItem(
      checkItemId,
      recruteurId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting check item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete check item",
      },
      { status: 500 }
    );
  }
}

