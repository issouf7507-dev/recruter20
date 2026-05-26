import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  if (!await applicationService.checkOwnership(id, session.user.id)) return forbidden();
  await applicationService.deleteApplication(id);
  return NextResponse.json({ success: true, message: "Application deleted successfully" });
});
