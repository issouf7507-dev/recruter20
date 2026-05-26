import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, CardLabel, UpdateCardLabelData } from "@/lib/api/kanban/types";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
});

/**
 * PATCH /api/kanban/labels/[id]
 * Mettre à jour un label
 */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const id = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const validatedData = updateLabelSchema.parse(body);

  const label = await kanbanRepository.updateLabel(id, validatedData);

  const result: ApiResponse<CardLabel> = {
    success: true,
    data: label as CardLabel,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/labels/[id]
 * Supprimer un label
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const id = (await (ctx as Ctx).params).id;

  await kanbanRepository.deleteLabel(id);

  return NextResponse.json({ success: true });
});
