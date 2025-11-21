import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateKanbanCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/cards - Create a new card
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
    const {
      recruteurId,
      userId,
      ...data
    }: CreateKanbanCardData & { recruteurId: string; userId?: string } = body;

    if (!recruteurId || !data.title || !data.columnId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use session.user.id as userId if not provided
    const finalUserId = userId || session.user.id;

    const card = await kanbanRepository.createCard(
      recruteurId,
      data,
      finalUserId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create card",
      },
      { status: 500 }
    );
  }
}
