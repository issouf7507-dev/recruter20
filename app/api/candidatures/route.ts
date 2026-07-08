import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures";
import { candidatRepository } from "@/lib/api/candidats";
import { requireSession } from "@/lib/api-auth";
import { ApiError, notFound, withErrorHandler } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { emailService } from "@/lib/email";

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

    // Notifier le recruteur de la nouvelle candidature (notif DB + email)
    try {
      const offer = await prisma.jobOffer.findUnique({
        where: { id: jobOfferId },
        select: {
          title: true,
          recruteur: {
            select: {
              companyName: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      const recruteurUser = offer?.recruteur?.user;
      if (recruteurUser?.id) {
        const jobTitle = offer!.title ?? "";
        const candidatName =
          candidat.prenom && candidat.nom
            ? `${candidat.prenom} ${candidat.nom}`
            : "Un candidat";

        await notify({
          recipientId: recruteurUser.id,
          recipientType: "RECRUTEUR",
          type: "APPLICATION_NEW",
          data: {
            message: `${candidatName} a postulé à « ${jobTitle} »`,
            offreTitle: jobTitle,
            applicationId: application.id,
            candidatId: candidat.id,
          },
          email: recruteurUser.email
            ? () =>
                emailService.sendNewApplicationEmail({
                  to: recruteurUser.email!,
                  recruteurName:
                    recruteurUser.name ||
                    offer!.recruteur!.companyName ||
                    "Recruteur",
                  candidatName,
                  jobTitle,
                })
            : null,
        });
      }
    } catch {
      // Notification non critique — ne pas bloquer la candidature
    }

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
