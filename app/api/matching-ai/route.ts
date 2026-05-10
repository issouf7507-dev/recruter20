import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden } from "@/lib/api-error";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import {
  calculateMatches,
  type CandidatForMatching,
  type JobOfferForMatching,
} from "@/lib/matching/scoring";
import { analyzeBatchHuggingFacePure } from "@/lib/matching/scoringai";

/**
 * POST /api/matching-ai
 * Matching IA avec Hugging Face pour toutes les offres actives
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const recruteur = await recruteurRepository.findByUserId(session.user.id);
  const collaborateur = await collaborateurRepository.findByUserId(
    session.user.id,
  );
  const recruteurId = recruteur?.id || collaborateur?.recruteurId;

  if (!recruteurId) {
    return forbidden("User is not a recruiter");
  }

  // Vérifier que l'API key Hugging Face est configurée
  // Note: La clé API est utilisée côté serveur, mais scoringai.ts utilise NEXT_PUBLIC_HUGGINGFACE_API_KEY
  // Pour des raisons de sécurité, il serait préférable d'utiliser une variable sans NEXT_PUBLIC_
  // mais nous gardons la cohérence avec scoringai.ts pour l'instant
  if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Hugging Face API key not configured. Please set NEXT_PUBLIC_HUGGINGFACE_API_KEY in your environment variables.",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { minScore = 50, limitPerOffer = 5, offreId } = body;

  console.log("[MATCHING-AI] Démarrage du matching IA...");

  // Récupérer offres actives
  const offres = await prisma.jobOffer.findMany({
    where: {
      recruteurId,
      etat: "active",
      deletedAt: null,
      ...(offreId && { id: offreId }),
    },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: offreId ? 1 : 10, // Limiter à 10 offres pour performance
  });

  if (offres.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        results: [],
        totalOffers: 0,
        totalCandidats: 0,
      },
    });
  }

  // Récupérer candidats
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

  // Matching IA avec scoring classique pour les détails
  const results = await Promise.all(
    offres.map(async (offre) => {
      const offreForMatching: JobOfferForMatching = {
        id: offre.id,
        title: offre.title,
        description: offre.description,
        company: offre.company,
        location: offre.location,
        type: offre.type,
      };

      // Calculer le scoring classique pour avoir les détails (compétences, localisation, etc.)
      const ruleBasedMatches = calculateMatches(
        candidatsForMatching,
        offreForMatching,
        {
          minScore: 0, // Pas de préfiltre - on veut tous les candidats
          limit: limitPerOffer * 5, // Analyser 5x plus
        },
      );

      // Créer un map pour accéder rapidement aux détails du scoring classique
      const ruleBasedMap = new Map(
        ruleBasedMatches.map((m) => [m.candidat.id, m]),
      );

      // Limiter le nombre de candidats à analyser avec l'IA (pour performance)
      const candidatsToAnalyze = ruleBasedMatches
        .slice(0, limitPerOffer * 5)
        .map((match) => ({
          candidat: match.candidat,
          offre: offreForMatching,
        }));

      // Analyser avec Hugging Face IA (100% IA)
      let aiMatches: any[] = [];
      try {
        console.log(
          `[MATCHING-AI] Analyse IA pure pour ${offre.title} (${candidatsToAnalyze.length} candidats)...`,
        );
        aiMatches = await analyzeBatchHuggingFacePure(candidatsToAnalyze);
      } catch (error) {
        console.error("[MATCHING-AI] Erreur analyse IA:", error);
        // En cas d'erreur, utiliser les scores classiques
        aiMatches = ruleBasedMatches.map((match) => ({
          candidat: match.candidat,
          offre: offreForMatching,
          score: match.score,
          aiSemanticScore: null,
          aiFit: null,
          aiConfidence: null,
          aiReasoning:
            "Erreur lors de l'analyse IA - score classique utilisé",
        }));
      }

      // Filtrer par score minimum et limiter
      const filteredMatches = aiMatches
        .filter((m) => m.score >= minScore)
        .slice(0, limitPerOffer)
        .map((match) => {
          // Récupérer les détails du scoring classique si disponibles
          const ruleBasedDetails = ruleBasedMap.get(match.candidat.id);

          return {
            candidat: {
              id: match.candidat.id,
              nom: match.candidat.nom,
              prenom: match.candidat.prenom,
              image: match.candidat.image,
              ville: match.candidat.ville,
              pays: match.candidat.pays,
              domaine: match.candidat.domaine,
              statut: match.candidat.statut,
              bio: match.candidat.bio,
              linkedinUrl: match.candidat.linkedinUrl,
              user: match.candidat.user,
            },
            score: match.score,
            originalScore: ruleBasedDetails?.score || match.score, // Score classique pour comparaison
            aiSemanticScore: match.aiSemanticScore,
            aiFit: match.aiFit,
            aiConfidence: match.aiConfidence,
            aiReasoning: match.aiReasoning,
            scoreDetails: ruleBasedDetails?.scoreDetails || {
              competences: 0,
              localisation: 0,
              experience: 0,
              domaine: 0,
              disponibilite: 0,
              formations: 0,
            },
            matchedCompetences: ruleBasedDetails?.matchedCompetences || [],
            missingCompetences: ruleBasedDetails?.missingCompetences || [],
            highlights: ruleBasedDetails?.highlights || [],
          };
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
        topMatches: filteredMatches,
        averageScore:
          filteredMatches.length > 0
            ? Math.round(
                filteredMatches.reduce((sum, m) => sum + m.score, 0) /
                  filteredMatches.length,
              )
            : 0,
      };
    }),
  );

  const responseData = {
    results,
    totalOffers: offres.length,
    totalCandidats: candidats.length,
  };

  console.log("[MATCHING-AI] Matching IA terminé");

  return NextResponse.json({ success: true, data: responseData });
});
