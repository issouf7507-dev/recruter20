import { NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const applications = await applicationService.getApplicationsByCandidatId(id);
  return NextResponse.json({ success: true, data: applications });
});
