import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden } from "@/lib/api-error";
import { calculateMatches } from "@/lib/matching/scoring";
import { loadCandidatForMatching } from "@/lib/matching/recommendOffers";

export const POST = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const { candidatId } = await (req as NextRequest).json();

  // Vérifie l'appartenance avant de charger le profil pour le matching.
  const owner = await prisma.candidat.findUnique({
    where: { id: candidatId },
    select: { userId: true },
  });
  if (!owner || owner.userId !== session.user.id) return forbidden();

  const candidatForMatching = await loadCandidatForMatching(candidatId);
  if (!candidatForMatching) return forbidden();

  const offres = await prisma.jobOffer.findMany({
    where: { etat: "active", deletedAt: null },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, company: true, location: true, type: true, logo: true, salaryMin: true, salaryMax: true, salaryCurrency: true, duedate: true, createdAt: true },
  });

  const results = offres.map((offre) => {
    const matches = calculateMatches([candidatForMatching as any], offre as any, { minScore: 0, limit: 1 });
    const match = matches[0];
    return {
      offre,
      score: match?.score ?? 0,
      niveau: match ? (match.score >= 80 ? "excellent" : match.score >= 60 ? "bon" : match.score >= 40 ? "moyen" : "faible") : "faible",
      forces: match?.scoreDetails ? Object.entries(match.scoreDetails).filter(([, v]) => (v as number) > 60).map(([k]) => k) : [],
    };
  });

  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({ success: true, data: results.slice(0, 30) });
});
