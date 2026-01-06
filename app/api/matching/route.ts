import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import {
  calculateMatches,
  type CandidatForMatching,
  type JobOfferForMatching,
} from "@/lib/matching/scoring";

/**
 * GET /api/matching
 * Récupérer les matchs pour une offre spécifique
 *
 * Query params:
 * - offerId: ID de l'offre (requis)
 * - minScore: Score minimum (défaut: 30)
 * - limit: Nombre de résultats (défaut: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un recruteur
    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("offerId");
    const minScore = parseInt(searchParams.get("minScore") || "30");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: "offerId is required" },
        { status: 400 }
      );
    }

    // Récupérer l'offre
    const offre = await prisma.jobOffer.findFirst({
      where: {
        id: offerId,
        recruteurId: recruteurId,
      },
    });

    if (!offre) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    // Récupérer tous les candidats avec leurs données complètes
    // Ordre déterministe pour éviter des résultats aléatoires
    const candidats = await prisma.candidat.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        candidatCompetences: true,
        competencesList: true,
        experiences: {
          include: {
            experienceCompetences: true,
          },
          orderBy: {
            dateDebut: "desc",
          },
        },
        formations: {
          orderBy: {
            dateDebut: "desc",
          },
        },
        niveauEtude: true,
        certifications: true,
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    // Préparer les données pour le matching
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

    // L'offre contient toutes les infos dans description
    const offreForMatching: JobOfferForMatching = {
      id: offre.id,
      title: offre.title,
      description: offre.description,
      company: offre.company,
      location: offre.location,
      type: offre.type,
    };

    // Calculer les matchs
    const matches = calculateMatches(candidatsForMatching, offreForMatching, {
      minScore,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        offre: {
          id: offre.id,
          title: offre.title,
          company: offre.company,
          location: offre.location,
        },
        matches,
        totalCandidats: candidats.length,
        matchesCount: matches.length,
      },
    });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate matches" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/matching
 * Récupérer les matchs pour toutes les offres actives du recruteur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { minScore = 50, limitPerOffer = 5 } = body;

    // Récupérer toutes les offres actives du recruteur
    const offres = await prisma.jobOffer.findMany({
      where: {
        recruteurId,
        etat: "active",
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Récupérer tous les candidats (ordre déterministe)
    const candidats = await prisma.candidat.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        candidatCompetences: true,
        competencesList: true,
        experiences: {
          include: {
            experienceCompetences: true,
          },
        },
        formations: true,
        niveauEtude: true,
        certifications: true,
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    });

    console.log("candidats", candidats);

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

    // Calculer les matchs pour chaque offre
    const results = offres.map((offre) => {
      // L'offre contient toutes les infos dans description
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
                matches.reduce((sum, m) => sum + m.score, 0) / matches.length
              )
            : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        totalOffers: offres.length,
        totalCandidats: candidats.length,
      },
    });
  } catch (error) {
    console.error("Error calculating matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate matches" },
      { status: 500 }
    );
  }
}
