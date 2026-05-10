import { NextRequest, NextResponse } from "next/server";
import { formationService } from "@/lib/api/formations";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const { id } = await (ctx as Ctx).params;
  if (!await formationService.checkOwnership(id, session.user.id)) return forbidden();
  const formation = await formationService.updateFormation(id, await request.json());
  return NextResponse.json({ success: true, data: formation });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  if (!await formationService.checkOwnership(id, session.user.id)) return forbidden();
  await formationService.deleteFormation(id);
  return NextResponse.json({ success: true, message: "Formation deleted successfully" });
});
