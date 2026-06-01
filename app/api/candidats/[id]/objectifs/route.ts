import { NextResponse } from "next/server";
import { objectifService } from "@/lib/api/objectifs";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: candidatId } = await (ctx as Ctx).params;
  const objectifs = await objectifService.getObjectifsByCandidatId(candidatId);
  return NextResponse.json(objectifs);
});
