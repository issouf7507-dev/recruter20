import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { UpdateCardDueDateData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/due-dates/[id] - Update a due date
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { dueAt, recruteurId }: UpdateCardDueDateData & {
      recruteurId: string;
    } = body;

    if (!dueAt || !recruteurId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.updateCardDueDate(
      id,
      new Date(dueAt),
      recruteurId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating due date:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update due date",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/due-dates/[id] - Delete a due date
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { recruteurId }: { recruteurId: string } = body;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Recruteur ID is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.deleteCardDueDate(id, recruteurId);

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting due date:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete due date",
      },
      { status: 500 }
    );
  }
}

