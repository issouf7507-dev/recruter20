import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateCardDueDateData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/due-dates - Create a new due date
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cardId, dueAt, recruteurId }: CreateCardDueDateData = body;

    if (!cardId || !dueAt || !recruteurId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.createCardDueDate(
      cardId,
      new Date(dueAt),
      recruteurId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating due date:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create due date",
      },
      { status: 500 }
    );
  }
}

