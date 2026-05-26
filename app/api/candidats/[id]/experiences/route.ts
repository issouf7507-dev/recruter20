import { NextResponse } from "next/server";
import { experienceService } from "@/lib/api/experiences";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const experiences = await experienceService.getExperiencesByCandidatId(id);
  return NextResponse.json({ success: true, data: experiences });
});
