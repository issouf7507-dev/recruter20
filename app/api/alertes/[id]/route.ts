import { NextRequest, NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const { id } = await (ctx as Ctx).params;
  if (!await alerteService.checkOwnership(id, session.user.id)) return forbidden();
  const alerte = await alerteService.updateAlerte(id, await request.json());
  return NextResponse.json({ success: true, data: alerte });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  if (!await alerteService.checkOwnership(id, session.user.id)) return forbidden();
  await alerteService.deleteAlerte(id);
  return NextResponse.json({ success: true, message: "Alert deleted successfully" });
});
