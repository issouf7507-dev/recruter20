import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";
import { withErrorHandler } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { emailService } from "@/lib/email";

const STATUS_LABELS: Record<string, string> = {
  ACCEPTE: "Votre candidature a été acceptée 🎉",
  REFUSE: "Votre candidature n'a pas été retenue",
  EN_REVISION: "Votre candidature est en cours d'examen",
  EN_ATTENTE: "Votre candidature est en attente",
};

const EMAIL_STATUSES = new Set(["ACCEPTE", "REFUSE", "EN_REVISION", "EN_ATTENTE"]);

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

  // Notifier le candidat du changement de statut (notif DB + email)
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidat: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        jobOffer: { select: { title: true, company: true } },
      },
    });
    const user = application?.candidat?.user;
    if (application?.candidat && user?.id) {
      const jobTitle = application.jobOffer?.title ?? "";
      const candidatName =
        application.candidat.prenom && application.candidat.nom
          ? `${application.candidat.prenom} ${application.candidat.nom}`
          : user.name || "Candidat";

      await notify({
        recipientId: user.id,
        recipientType: "CANDIDAT",
        type: "APPLICATION_STATUS_CHANGED",
        data: {
          message: STATUS_LABELS[status] ?? `Statut mis à jour : ${status}`,
          offreTitle: jobTitle,
          applicationId,
          status,
        },
        email:
          user.email && EMAIL_STATUSES.has(status)
            ? () =>
                emailService.sendApplicationStatusEmail({
                  to: user.email!,
                  candidatName,
                  jobTitle,
                  companyName: application.jobOffer?.company ?? null,
                  status: status as "ACCEPTE" | "REFUSE" | "EN_REVISION" | "EN_ATTENTE",
                })
            : null,
      });
    }
  } catch {
    // Notification non critique — ne pas bloquer la réponse
  }

  return NextResponse.json({ success: true, message: "Status updated successfully" });
});
