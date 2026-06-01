import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden } from "@/lib/api-error";
import { calculateMatches } from "@/lib/matching/scoring";

export const POST = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const { candidatId } = await (req as NextRequest).json();

  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
    include: {
      user: true,
      candidatCompetences: true,
      competencesList: true,
      experiences: { include: { experienceCompetences: true }, orderBy: { dateDebut: "desc" } },
      formations: true,
      niveauEtude: true,
      certifications: true,
    },
  });

  if (!candidat || candidat.userId !== session.user.id) return forbidden();

  const offres = await prisma.jobOffer.findMany({
    where: { etat: "active", deletedAt: null },
    take: 100,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, company: true, location: true, type: true, logo: true, salaryMin: true, salaryMax: true, salaryCurrency: true, duedate: true, createdAt: true },
  });

  const candidatForMatching = {
    ...candidat,
    pays: candidat.pays ?? "",
    bio: candidat.bio ?? null,
    user: { email: candidat.user.email ?? "", name: candidat.user.name ?? null },
  };

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
