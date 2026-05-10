import { NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";
import { alerteMatcher } from "@/lib/api/alertes/matcher";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  await alerteMatcher.updateAllAlertsCount(id);
  const alertes = await alerteService.getAlertesByCandidatId(id);
  return NextResponse.json({ success: true, data: alertes });
});
