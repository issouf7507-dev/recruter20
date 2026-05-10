import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, CardLabel } from "@/lib/api/kanban/types";
import { z } from "zod";

const createLabelSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  color: z.string().min(1, "La couleur est requise"),
  recruteurId: z.string().min(1, "recruteurId est requis"),
});

/**
 * GET /api/kanban/labels?recruteurId=xxx
 * Récupérer tous les labels
 */
export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const searchParams = request.nextUrl.searchParams;
  const recruteurId = searchParams.get("recruteurId");

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  const labels = await kanbanRepository.findLabelsByRecruteur(recruteurId);

  const result: ApiResponse<CardLabel[]> = {
    success: true,
    data: labels as CardLabel[],
  };

  return NextResponse.json(result);
});

/**
 * POST /api/kanban/labels
 * Créer un nouveau label
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body = await request.json();
  const validatedData = createLabelSchema.parse(body);

  const label = await kanbanRepository.createLabel(validatedData);

  const result: ApiResponse<CardLabel> = {
    success: true,
    data: label as CardLabel,
  };

  return NextResponse.json(result, { status: 201 });
});
