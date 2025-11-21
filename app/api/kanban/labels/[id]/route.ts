import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, CardLabel, UpdateCardLabelData } from "@/lib/api/kanban/types";
import { z } from "zod";

const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
});

/**
 * PATCH /api/kanban/labels/[id]
 * Mettre à jour un label
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateLabelSchema.parse(body);

    const label = await kanbanRepository.updateLabel(id, validatedData);

    const result: ApiResponse<CardLabel> = {
      success: true,
      data: label as CardLabel,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating label:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update label",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/kanban/labels/[id]
 * Supprimer un label
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await kanbanRepository.deleteLabel(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting label:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete label",
      },
      { status: 500 }
    );
  }
}

