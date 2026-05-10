import { NextRequest, NextResponse } from "next/server";
import { experienceService } from "@/lib/api/experiences";
import { candidatRepository } from "@/lib/api/candidats";
import { requireSession } from "@/lib/api-auth";
import { forbidden, withErrorHandler } from "@/lib/api-error";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const body = await request.json();

  const ownerUserId = await candidatRepository.findOwnerUserId(body.candidatId);
  if (ownerUserId !== session.user.id) return forbidden();

  const experience = await experienceService.createExperience(body);
  return NextResponse.json({ success: true, data: experience }, { status: 201 });
});
