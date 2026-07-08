import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { emailService } from "@/lib/email";

export const dynamic = "force-dynamic";

// Fenêtre de rappel : on notifie les entretiens PLANIFIE dont la date tombe
// dans les prochaines REMINDER_WINDOW_HOURS et qui n'ont pas encore été rappelés.
const REMINDER_WINDOW_HOURS = 24;

/**
 * GET /api/cron/interview-reminders
 *
 * Endpoint déclenché par un cron (crontab VPS) pour envoyer les rappels
 * d'entretien par email. Protégé par le secret partagé `CRON_SECRET`.
 *
 * Exemple crontab (toutes les heures) :
 *   0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
 *     https://ylsix.com/api/cron/interview-reminders > /dev/null
 */
export async function GET(req: NextRequest) {
  // Endpoint désactivé tant que le secret n'est pas configuré.
  if (!env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: "CRON non configuré (CRON_SECRET manquant)" },
      { status: 503 },
    );
  }

  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.headers.get("x-cron-secret");

  if (provided !== env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const entretiens = await prisma.entretien.findMany({
    where: {
      statut: "PLANIFIE",
      reminderSentAt: null,
      dateHeure: { gt: now, lte: windowEnd },
    },
    include: {
      application: {
        include: {
          candidat: {
            select: {
              nom: true,
              prenom: true,
              user: { select: { name: true, email: true } },
            },
          },
          jobOffer: { select: { title: true, company: true } },
        },
      },
      recruteur: {
        select: { companyName: true, user: { select: { name: true } } },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const e of entretiens) {
    const candidat = e.application?.candidat;
    const email = candidat?.user?.email;
    if (!email) {
      skipped++;
      continue;
    }

    try {
      await emailService.sendInterviewReminderEmail({
        to: email,
        candidatName:
          candidat.prenom && candidat.nom
            ? `${candidat.prenom} ${candidat.nom}`
            : candidat.user?.name || "Candidat",
        recruteurName:
          e.recruteur?.user?.name || e.recruteur?.companyName || "Un recruteur",
        companyName: e.recruteur?.companyName ?? null,
        jobTitle: e.application?.jobOffer?.title || "Offre d'emploi",
        titre: e.titre,
        dateHeure: e.dateHeure,
        type: e.type,
        lieu: e.lieu,
      });

      // Marque comme rappelé pour ne pas renvoyer au prochain passage du cron.
      await prisma.entretien.update({
        where: { id: e.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`interview-reminders: échec pour entretien ${e.id}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: entretiens.length,
    sent,
    skipped,
  });
}
