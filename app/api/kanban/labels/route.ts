import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, CardLabel, CreateCardLabelData, UpdateCardLabelData } from "@/lib/api/kanban/types";
import { z } from "zod";

const createLabelSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  color: z.string().min(1, "La couleur est requise"),
  recruteurId: z.string().min(1, "recruteurId est requis"),
});

const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
});

/**
 * GET /api/kanban/labels?recruteurId=xxx
 * Récupérer tous les labels
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const recruteurId = searchParams.get("recruteurId");

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    const labels = await kanbanRepository.findLabelsByRecruteur(recruteurId);

    const result: ApiResponse<CardLabel[]> = {
      success: true,
      data: labels as CardLabel[],
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching labels:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch labels",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kanban/labels
 * Créer un nouveau label
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
    const validatedData = createLabelSchema.parse(body);

    const label = await kanbanRepository.createLabel(validatedData);

    const result: ApiResponse<CardLabel> = {
      success: true,
      data: label as CardLabel,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating label:", error);

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
        error: error.message || "Failed to create label",
      },
      { status: 500 }
    );
  }
}

