import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures";
import { candidatRepository } from "@/lib/api/candidats";
import { requireSession } from "@/lib/api-auth";
import { ApiError, notFound, withErrorHandler } from "@/lib/api-error";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const { jobOfferId, message, cv } = await request.json();

  const candidat = await candidatRepository.findByUserId(session.user.id);
  if (!candidat) return notFound("Profil candidat");

  try {
    const application = await applicationService.createApplication({
      candidatId: candidat.id,
      jobOfferId,
      message,
      cv,
    });
    return NextResponse.json(
      { success: true, data: application, message: "Candidature envoyée avec succès" },
      { status: 201 },
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("already applied")) {
      throw new ApiError(409, "Vous avez déjà postulé à cette offre");
    }
    throw error;
  }
});
