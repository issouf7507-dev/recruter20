import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";
import { withErrorHandler } from "@/lib/api-error";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: recruteurId } = await (ctx as Ctx).params;
  const applications = await applicationService.getApplicationsByRecruteurId(recruteurId);
  return NextResponse.json({ success: true, data: applications });
});

export const PUT = withErrorHandler(async (req, ctx) => {
  const { id: applicationId } = await (ctx as Ctx).params;
  const { status } = await (req as NextRequest).json();
  await applicationService.updateStatus(applicationId, status);

  // Notifier le candidat du changement de statut
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidat: { include: { user: true } },
        jobOffer: { select: { title: true } },
      },
    });
    if (application?.candidat?.user?.id) {
      const labels: Record<string, string> = {
        ACCEPTE: "Votre candidature a été acceptée 🎉",
        REFUSE: "Votre candidature n'a pas été retenue",
        EN_REVISION: "Votre candidature est en cours d'examen",
        EN_ATTENTE: "Votre candidature est en attente",
      };
      await prisma.notification.create({
        data: {
          recipientId: application.candidat.user.id,
          recipientType: "CANDIDAT",
          type: "APPLICATION_STATUS_CHANGED",
          data: {
            message: labels[status] ?? `Statut mis à jour : ${status}`,
            offreTitle: application.jobOffer?.title ?? "",
            applicationId,
            status,
          },
        },
      });
    }
  } catch {
    // Notification non critique — ne pas bloquer la réponse
  }

  return NextResponse.json({ success: true, message: "Status updated successfully" });
});
