import { NextRequest, NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";
import { alerteMatcher } from "@/lib/api/alertes/matcher";
import { requireSession } from "@/lib/api-auth";
import { forbidden, notFound, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;

  if (!await alerteService.checkOwnership(id, session.user.id)) return forbidden();

  const alerte = await alerteService.getAlerteById(id);
  if (!alerte) return notFound("Alerte");

  const matchingOffers = await alerteMatcher.findMatchingOffers(alerte);
  await alerteService.updateMatchCount(id, matchingOffers.length);

  return NextResponse.json({
    success: true,
    data: { alerte, offers: matchingOffers, count: matchingOffers.length },
  });
});
