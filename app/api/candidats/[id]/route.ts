import { NextRequest, NextResponse } from "next/server";
import { candidatRepository } from "@/lib/api/candidats";
import { notFound, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const candidat = await candidatRepository.findWithDetails(id);
  if (!candidat) return notFound("Candidat");
  return NextResponse.json({ success: true, data: candidat });
});

export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const { id } = await (ctx as Ctx).params;
  const body = await request.json();
  const candidat = await candidatRepository.update(id, body);
  return NextResponse.json({ success: true, data: candidat });
});
