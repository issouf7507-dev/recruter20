import prisma from "@/lib/prisma";
import {
  calculateMatchScore,
  type CandidatForMatching,
  type JobOfferForMatching,
} from "@/lib/matching/scoring";

/**
 * « Lien candidat ↔ offre » réutilisable.
 *
 * Le scoring profil → offres existait déjà mais était enfermé dans la route
 * `app/api/candidat-matching/route.ts`. On l'extrait ici pour que la route ET le
 * cron de recommandations hebdomadaires s'appuient sur la même logique.
 */

export type RecommendedOffre = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  type: string | null;
  logo: string | null;
  score: number;
};

// Champs nécessaires : `description` sert au scoring (extraction de compétences),
// le reste sert au scoring et à l'affichage dans l'email.
const OFFRE_SELECT = {
  id: true,
  title: true,
  description: true,
  company: true,
  location: true,
  type: true,
  logo: true,
} as const;

export type OffreForReco = {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  type: string | null;
  logo: string | null;
};

/** Charge toutes les offres actives avec les champs utiles au matching + affichage. */
export async function loadActiveOffresForReco(): Promise<OffreForReco[]> {
  return prisma.jobOffer.findMany({
    where: { etat: "active", deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: OFFRE_SELECT,
  });
}

/** Charge un candidat et le met en forme pour le moteur de matching. */
export async function loadCandidatForMatching(
  candidatId: string,
): Promise<CandidatForMatching | null> {
  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
    include: {
      user: true,
      candidatCompetences: true,
      competencesList: true,
      experiences: {
        include: { experienceCompetences: true },
        orderBy: { dateDebut: "desc" },
      },
      formations: true,
      niveauEtude: true,
      certifications: true,
    },
  });
  if (!candidat) return null;

  return {
    ...candidat,
    pays: candidat.pays ?? "",
    bio: candidat.bio ?? null,
    user: {
      email: candidat.user.email ?? "",
      name: candidat.user.name ?? null,
    },
    // Le moteur lit des sous-ensembles de champs ; le cast reste sûr côté runtime
    // (mêmes objets Prisma que ceux consommés par la route d'origine).
  } as unknown as CandidatForMatching;
}

/**
 * Retourne les meilleures offres pour un candidat, triées par pertinence.
 *
 * @param opts.limit          nombre max d'offres (défaut 4)
 * @param opts.minScore       score plancher en % (défaut 30)
 * @param opts.excludeOffreIds offres à ne pas proposer (déjà recommandées / candidatées)
 * @param opts.offres         offres pré-chargées (le cron les charge une seule fois)
 */
export async function recommendOffersForCandidat(
  candidatId: string,
  opts: {
    limit?: number;
    minScore?: number;
    excludeOffreIds?: string[];
    offres?: OffreForReco[];
  } = {},
): Promise<RecommendedOffre[]> {
  const { limit = 4, minScore = 30, excludeOffreIds = [] } = opts;

  const candidat = await loadCandidatForMatching(candidatId);
  if (!candidat) return [];

  const offres = opts.offres ?? (await loadActiveOffresForReco());
  const exclude = new Set(excludeOffreIds);

  return offres
    .filter((o) => !exclude.has(o.id))
    .map((offre) => {
      const { score } = calculateMatchScore(
        candidat,
        offre as JobOfferForMatching,
      );
      return {
        id: offre.id,
        title: offre.title,
        company: offre.company,
        location: offre.location,
        type: offre.type,
        logo: offre.logo,
        score,
      };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
