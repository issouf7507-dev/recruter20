import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { notify } from "@/lib/notify";
import { emailService } from "@/lib/email";
import {
  loadActiveOffresForReco,
  recommendOffersForCandidat,
} from "@/lib/matching/recommendOffers";

export const dynamic = "force-dynamic";

// Cadence hebdomadaire : on n'envoie qu'aux candidats non servis depuis > 6 jours
// (le crontab tourne 1×/semaine, la marge évite un double envoi si le cron rejoue).
const MIN_DAYS_BETWEEN_EMAILS = 6;
const MAX_OFFERS = 4;
const MIN_SCORE = 30;

/**
 * GET /api/cron/reco-offres
 *
 * Cron hebdomadaire : envoie à chaque candidat opté-in un email de recommandations
 * d'offres pertinentes selon son profil (façon « jobs for you »). Protégé par `CRON_SECRET`.
 *
 * Exemple crontab (lundi 8h) :
 *   0 8 * * 1 curl -s -H "Authorization: Bearer $CRON_SECRET" \
 *     https://ylsix.com/api/cron/reco-offres > /dev/null
 */
export async function GET(req: NextRequest) {
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

  const seuil = new Date(
    Date.now() - MIN_DAYS_BETWEEN_EMAILS * 24 * 60 * 60 * 1000,
  );

  // Candidats opté-in, non servis récemment, avec un email.
  const candidats = await prisma.candidat.findMany({
    where: {
      recommandationsEmail: true,
      OR: [{ dernierEmailReco: null }, { dernierEmailReco: { lt: seuil } }],
      user: { is: { email: { not: "" } } },
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      user: { select: { id: true, name: true, email: true } },
      applications: { select: { jobOfferId: true } },
      offresRecommandees: { select: { jobOfferId: true } },
    },
  });

  // Offres actives chargées une seule fois, réutilisées pour tous les candidats.
  const offres = await loadActiveOffresForReco();

  let emailsEnvoyes = 0;
  let ignores = 0;

  for (const c of candidats) {
    const email = c.user?.email;
    if (!email) {
      ignores++;
      continue;
    }

    const excludeOffreIds = [
      ...c.applications.map((a) => a.jobOfferId),
      ...c.offresRecommandees.map((o) => o.jobOfferId),
    ];

    const recos = await recommendOffersForCandidat(c.id, {
      limit: MAX_OFFERS,
      minScore: MIN_SCORE,
      excludeOffreIds,
      offres,
    });

    if (recos.length === 0) {
      ignores++;
      continue;
    }

    const candidatName =
      c.prenom && c.nom ? `${c.prenom} ${c.nom}` : c.user?.name || "Candidat";

    try {
      await notify({
        recipientId: c.user!.id,
        recipientType: "CANDIDAT",
        type: "JOB_ALERT_NEW_MATCHES",
        data: {
          message: `${recos.length} offre(s) qui pourraient vous intéresser`,
          offreIds: recos.map((r) => r.id),
        },
        email: () =>
          emailService.sendJobRecommendationsEmail({
            to: email,
            candidatName,
            offers: recos.map((r) => ({
              id: r.id,
              title: r.title,
              company: r.company,
              location: r.location,
              type: r.type,
              logo: r.logo,
            })),
          }),
      });

      // Persiste le lien candidat↔offre (anti-doublon) + date d'envoi.
      await prisma.offreRecommandee.createMany({
        data: recos.map((r) => ({
          candidatId: c.id,
          jobOfferId: r.id,
          score: r.score,
        })),
        skipDuplicates: true,
      });
      await prisma.candidat.update({
        where: { id: c.id },
        data: { dernierEmailReco: new Date() },
      });

      emailsEnvoyes++;
    } catch (err) {
      console.error(`reco-offres: échec pour candidat ${c.id}:`, err);
      ignores++;
    }
  }

  return NextResponse.json({
    success: true,
    candidatsTraites: candidats.length,
    emailsEnvoyes,
    ignores,
  });
}
