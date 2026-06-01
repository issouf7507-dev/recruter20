import { NextRequest, NextResponse } from "next/server";
import { objectifService } from "@/lib/api/objectifs";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const { id } = await (ctx as Ctx).params;

  if (!(await objectifService.checkOwnership(id, session.user.id))) return forbidden();

  const objectif = await objectifService.updateObjectif(id, await request.json());
  return NextResponse.json({ success: true, data: objectif });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;

  if (!(await objectifService.checkOwnership(id, session.user.id))) return forbidden();

  await objectifService.deleteObjectif(id);
  return NextResponse.json({ success: true });
});
