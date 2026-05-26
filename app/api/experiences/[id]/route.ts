import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "@/lib/api/experiences";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const { id } = await (ctx as Ctx).params;
  if (!await experienceService.checkOwnership(id, session.user.id)) return forbidden();
  const experience = await experienceService.updateExperience(id, await request.json());
  return NextResponse.json({ success: true, data: experience });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  if (!await experienceService.checkOwnership(id, session.user.id)) return forbidden();
  await experienceService.deleteExperience(id);
  return NextResponse.json({ success: true, message: "Experience deleted successfully" });
});
