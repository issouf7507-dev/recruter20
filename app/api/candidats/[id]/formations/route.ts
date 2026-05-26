import { NextResponse } from "next/server";
import { formationService } from "@/lib/api/formations";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const formations = await formationService.getFormationsByCandidatId(id);
  return NextResponse.json({ success: true, data: formations });
});
