import { NextRequest, NextResponse } from "next/server";
import { alerteService } from "@/lib/api/alertes";
import { candidatRepository } from "@/lib/api/candidats";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const body = await request.json();

  const ownerUserId = await candidatRepository.findOwnerUserId(body.candidatId);
  if (ownerUserId !== session.user.id) return forbidden();

  const alerte = await alerteService.createAlerte(body);
  return NextResponse.json({ success: true, data: alerte }, { status: 201 });
});
