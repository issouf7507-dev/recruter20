import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/cards/[id]/checklist - Create a checklist item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cardId = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { label, recruteurId } = body as {
      label: string;
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    if (!label || label.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "label is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.createCheckItem(
      cardId,
      label.trim(),
      recruteurId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating check item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create check item",
      },
      { status: 500 }
    );
  }
}




