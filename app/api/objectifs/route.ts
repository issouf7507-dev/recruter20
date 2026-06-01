import { NextRequest, NextResponse } from "next/server";
import { objectifService } from "@/lib/api/objectifs";
import { candidatRepository } from "@/lib/api/candidats";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const body = await request.json();

  const ownerUserId = await candidatRepository.findOwnerUserId(body.candidatId);
  if (ownerUserId !== session.user.id) return forbidden();

  const objectif = await objectifService.createObjectif(body);
  return NextResponse.json({ success: true, data: objectif }, { status: 201 });
});
