import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/cards/[id]/members - Add members to a card
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
    const { userIds, recruteurId } = body as {
      userIds: string[];
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "userIds array is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.addCardMembers(
      cardId,
      userIds,
      recruteurId,
      session.user.id
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error adding card members:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add card members",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/cards/[id]/members - Remove a member from a card
 */
export async function DELETE(
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
    const { userId, recruteurId } = body as {
      userId: string;
      recruteurId: string;
    };

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.removeCardMember(
      cardId,
      userId,
      recruteurId,
      session.user.id
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing card member:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove card member",
      },
      { status: 500 }
    );
  }
}
