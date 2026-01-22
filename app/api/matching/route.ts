import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import {
  calculateMatches,
  type CandidatForMatching,
  type JobOfferForMatching,
} from "@/lib/matching/scoring";

// ✅ Cache simple en mémoire (durée: 5 minutes)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const matchingCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(recruteurId: string, minScore: number): string {
  return `${recruteurId}-${minScore}`;
}

function getFromCache(key: string): any | null {
  const entry = matchingCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_DURATION) {
    matchingCache.delete(key);
    return null;
  }

  console.log(`[CACHE] Hit pour ${key} (age: ${Math.round(age / 1000)}s)`);
  return entry.data;
}

function setCache(key: string, data: any): void {
  matchingCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[CACHE] Mise en cache de ${key}`);
}

// Nettoyer le cache toutes les 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of matchingCache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        matchingCache.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

/**
 * GET /api/matching?offerId=xxx
 * Matching pour une offre spécifique
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("offerId");
    const minScore = parseInt(searchParams.get("minScore") || "30");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: "offerId is required" },
        { status: 400 },
      );
    }

    // ✅ Vérifier le cache
    const cacheKey = `single-${recruteurId}-${offerId}-${minScore}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    // Récupérer l'offre
    const offre = await prisma.jobOffer.findFirst({
      where: { id: offerId, recruteurId },
    });

    if (!offre) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 },
      );
    }

    // Récupérer candidats (ordre déterministe)
    const candidats = await prisma.candidat.findMany({
      include: {
        user: { select: { email: true, name: true } },
        candidatCompetences: true,
        competencesList: true,
        experiences: {
          include: { experienceCompetences: true },
          orderBy: { dateDebut: "desc" },
        },
        formations: { orderBy: { dateDebut: "desc" } },
        niveauEtude: true,
        certifications: true,
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    const candidatsForMatching: CandidatForMatching[] = candidats.map((c) => ({
      id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      image: c.image,
      ville: c.ville,
      pays: c.pays,
      domaine: c.domaine,
      statut: c.statut,
      bio: c.bio,
      linkedinUrl: c.linkedinUrl,
      candidatCompetences: c.candidatCompetences,
      competencesList: c.competencesList,
      experiences: c.experiences.map((exp) => ({
        poste: exp.poste,
        entreprise: exp.entreprise,
        typeContrat: exp.typeContrat,
        dateDebut: exp.dateDebut,
        dateFin: exp.dateFin,
        experienceCompetences: exp.experienceCompetences,
      })),
      formations: c.formations.map((f) => ({
        diplome: f.diplome,
        domaine: f.domaine,
        etablissement: f.etablissement,
      })),
      niveauEtude: c.niveauEtude,
      certifications: c.certifications,
      user: c.user,
    }));

    const offreForMatching: JobOfferForMatching = {
      id: offre.id,
      title: offre.title,
      description: offre.description,
      company: offre.company,
      location: offre.location,
      type: offre.type,
    };

    const matches = calculateMatches(candidatsForMatching, offreForMatching, {
      minScore,
      limit,
    });

    const result = {
      offre: {
        id: offre.id,
        title: offre.title,
        company: offre.company,
        location: offre.location,
      },
      matches,
      totalCandidats: candidats.length,
      matchesCount: matches.length,
    };

    // ✅ Mettre en cache
    setCache(cacheKey, result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate matches" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/matching
 * Matching pour toutes les offres actives
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { minScore = 50, limitPerOffer = 5 } = body;

    // ✅ Vérifier le cache
    const cacheKey = getCacheKey(recruteurId, minScore);
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log("[MATCHING] Retour depuis cache");
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    console.log("[MATCHING] Calcul des matchs (non caché)...");

    // Récupérer offres actives (limite à 10 pour performance)
    const offres = await prisma.jobOffer.findMany({
      where: {
        recruteurId,
        etat: "active",
        deletedAt: null,
      },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Récupérer candidats (ordre déterministe)
    const candidats = await prisma.candidat.findMany({
      include: {
        user: { select: { email: true, name: true } },
        candidatCompetences: true,
        competencesList: true,
        experiences: {
          include: { experienceCompetences: true },
          orderBy: { dateDebut: "desc" },
        },
        formations: { orderBy: { dateDebut: "desc" } },
        niveauEtude: true,
        certifications: true,
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    const candidatsForMatching: CandidatForMatching[] = candidats.map((c) => ({
      id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      image: c.image,
      ville: c.ville,
      pays: c.pays,
      domaine: c.domaine,
      statut: c.statut,
      bio: c.bio,
      linkedinUrl: c.linkedinUrl,
      candidatCompetences: c.candidatCompetences,
      competencesList: c.competencesList,
      experiences: c.experiences.map((exp) => ({
        poste: exp.poste,
        entreprise: exp.entreprise,
        typeContrat: exp.typeContrat,
        dateDebut: exp.dateDebut,
        dateFin: exp.dateFin,
        experienceCompetences: exp.experienceCompetences,
      })),
      formations: c.formations.map((f) => ({
        diplome: f.diplome,
        domaine: f.domaine,
        etablissement: f.etablissement,
      })),
      niveauEtude: c.niveauEtude,
      certifications: c.certifications,
      user: c.user,
    }));

    const results = offres.map((offre) => {
      const offreForMatching: JobOfferForMatching = {
        id: offre.id,
        title: offre.title,
        description: offre.description,
        company: offre.company,
        location: offre.location,
        type: offre.type,
      };

      const matches = calculateMatches(candidatsForMatching, offreForMatching, {
        minScore,
        limit: limitPerOffer,
      });

      return {
        offre: {
          id: offre.id,
          title: offre.title,
          company: offre.company,
          location: offre.location,
          type: offre.type,
          applicationsCount: offre._count.applications,
        },
        topMatches: matches,
        averageScore:
          matches.length > 0
            ? Math.round(
                matches.reduce((sum, m) => sum + m.score, 0) / matches.length,
              )
            : 0,
      };
    });

    const responseData = {
      results,
      totalOffers: offres.length,
      totalCandidats: candidats.length,
    };

    // ✅ Mettre en cache
    setCache(cacheKey, responseData);

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate matches" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/matching
 * Invalider le cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 },
      );
    }

    // Supprimer toutes les entrées de cache pour ce recruteur
    let deleted = 0;
    for (const [key] of matchingCache.entries()) {
      if (key.includes(recruteurId)) {
        matchingCache.delete(key);
        deleted++;
      }
    }

    console.log(
      `[CACHE] ${deleted} entrée(s) supprimée(s) pour ${recruteurId}`,
    );

    return NextResponse.json({
      success: true,
      message: `Cache invalidé (${deleted} entrées)`,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cache" },
      { status: 500 },
    );
  }
}
