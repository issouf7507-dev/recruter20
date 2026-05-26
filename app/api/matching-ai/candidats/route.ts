import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { badRequest, forbidden, notFound, withErrorHandler } from "@/lib/api-error";
import { logger } from "@/lib/logger";

interface MatchResult {
  candidatId: string;
  score: number;
  niveau: "excellent" | "bon" | "moyen" | "faible";
  forces: string[];
  manques: string[];
  resume: string;
}

async function callClaude(
  apiKey: string,
  candidatProfile: string,
  offreDescription: string
): Promise<MatchResult["niveau"] extends infer N ? { score: number; niveau: N; forces: string[]; manques: string[]; resume: string } : never> {
  const prompt = `Tu es un expert en recrutement. Analyse la compatibilité entre ce profil candidat et cette offre d'emploi.

PROFIL CANDIDAT :
${candidatProfile}

OFFRE D'EMPLOI :
${offreDescription}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) avec cette structure exacte :
{
  "score": <entier entre 0 et 100>,
  "niveau": <exactement l'une de ces valeurs: "excellent" | "bon" | "moyen" | "faible">,
  "forces": [<2 à 4 points forts du candidat pour ce poste>],
  "manques": [<1 à 3 compétences ou éléments manquants>],
  "resume": "<1 phrase de synthèse pour le recruteur>"
}

Critères de score :
- 80-100 : excellent (profil idéal, correspond très bien)
- 60-79 : bon (profil solide avec quelques manques mineurs)
- 40-59 : moyen (profil partiel, manques significatifs)
- 0-39 : faible (profil peu adapté)`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) throw new Error("Clé API Claude invalide ou expirée.");
    if (response.status === 429) throw new Error("Limite de l'API Claude atteinte. Réessayez dans quelques instants.");
    throw new Error(`Erreur Claude API (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text ?? "";

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Réponse Claude invalide (JSON malformé).");
  }
}

function buildCandidatProfile(candidat: {
  prenom?: string | null;
  nom?: string | null;
  bio?: string | null;
  domaine?: string | null;
  ville?: string | null;
  pays?: string | null;
  experiences?: { poste: string; entreprise: string; dateDebut: Date; dateFin?: Date | null; description: string }[];
  formations?: { diplome: string; etablissement: string; domaine: string }[];
  candidatCompetences?: { competence: string }[];
  certifications?: { nom: string }[];
  niveauEtude?: { nom: string }[];
}): string {
  const lines: string[] = [];

  const nom = `${candidat.prenom || ""} ${candidat.nom || ""}`.trim();
  if (nom) lines.push(`Nom : ${nom}`);
  if (candidat.domaine) lines.push(`Domaine : ${candidat.domaine}`);
  if (candidat.ville || candidat.pays) lines.push(`Lieu : ${[candidat.ville, candidat.pays].filter(Boolean).join(", ")}`);
  if (candidat.bio) lines.push(`Bio : ${candidat.bio}`);

  if (candidat.niveauEtude?.length) {
    lines.push(`Niveau d'étude : ${candidat.niveauEtude.map((n) => n.nom).join(", ")}`);
  }

  if (candidat.candidatCompetences?.length) {
    lines.push(`Compétences : ${candidat.candidatCompetences.map((c) => c.competence).join(", ")}`);
  }

  if (candidat.certifications?.length) {
    lines.push(`Certifications : ${candidat.certifications.map((c) => c.nom).join(", ")}`);
  }

  if (candidat.experiences?.length) {
    lines.push("Expériences :");
    candidat.experiences.slice(0, 4).forEach((exp) => {
      const debut = new Date(exp.dateDebut).getFullYear();
      const fin = exp.dateFin ? new Date(exp.dateFin).getFullYear() : "présent";
      lines.push(`  - ${exp.poste} chez ${exp.entreprise} (${debut}–${fin})`);
      if (exp.description) lines.push(`    ${exp.description.slice(0, 150)}`);
    });
  }

  if (candidat.formations?.length) {
    lines.push("Formations :");
    candidat.formations.slice(0, 2).forEach((f) => {
      lines.push(`  - ${f.diplome} – ${f.etablissement} (${f.domaine})`);
    });
  }

  return lines.join("\n");
}

function buildOffreDescription(offre: {
  title: string;
  description?: string | null;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  requirements?: string | null;
  skills?: string | null;
  anneesexperience?: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`Poste : ${offre.title}`);
  if (offre.company) lines.push(`Entreprise : ${offre.company}`);
  if (offre.location) lines.push(`Lieu : ${offre.location}`);
  if (offre.type) lines.push(`Type de contrat : ${offre.type}`);
  if (offre.anneesexperience) lines.push(`Expérience requise : ${offre.anneesexperience}`);
  if (offre.requirements) lines.push(`Prérequis : ${offre.requirements.slice(0, 400)}`);
  if (offre.skills) lines.push(`Compétences recherchées : ${offre.skills.slice(0, 300)}`);
  if (offre.description) lines.push(`Description : ${offre.description.replace(/<[^>]+>/g, "").slice(0, 500)}`);
  return lines.join("\n");
}

export const POST = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const { recruteurId, candidatIds, jobOfferId } = await (req as NextRequest).json();

  if (!recruteurId || !candidatIds?.length || !jobOfferId) {
    return badRequest("recruteurId, candidatIds[] et jobOfferId sont requis");
  }
  if (candidatIds.length > 10) {
    return badRequest("Maximum 10 candidats par analyse");
  }

  // Vérifier que le recruteur — cast to any car claudeApiKey sera disponible
  // après `prisma generate` (ajouté au schema mais pas encore régénéré)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recruteur = await (prisma.recruteur as any).findUnique({
    where: { id: recruteurId },
    select: { userId: true, claudeApiKey: true },
  }) as { userId: string; claudeApiKey: string | null } | null;

  if (!recruteur || recruteur.userId !== session.user.id) return forbidden();
  if (!recruteur.claudeApiKey) {
    return badRequest("Aucune clé API Claude configurée. Ajoutez-la dans les Paramètres → onglet IA.");
  }

  // Récupérer l'offre (champs de base disponibles dans le schéma actuel)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offre = await (prisma.jobOffer as any).findUnique({
    where: { id: jobOfferId },
    select: {
      title: true,
      description: true,
      company: true,
      location: true,
      type: true,
      anneesexperience: true,
    },
  }) as ({ title: string; description?: string | null; company?: string | null; location?: string | null; type?: string | null; requirements?: string | null; skills?: string | null; anneesexperience?: string | null } | null);

  if (!offre) return notFound("Offre d'emploi");

  // Récupérer les candidats
  const candidats = await prisma.candidat.findMany({
    where: { id: { in: candidatIds } },
    include: {
      candidatCompetences: true,
      certifications: true,
      niveauEtude: true,
      experiences: { orderBy: { dateDebut: "desc" }, take: 5 },
      formations: { orderBy: { dateDebut: "desc" }, take: 3 },
    },
  });

  const offreDescription = buildOffreDescription(offre);

  // Analyser chaque candidat (séquentiel pour éviter le rate limiting)
  const results: MatchResult[] = [];

  for (const candidat of candidats) {
    try {
      const profile = buildCandidatProfile(candidat);
      const analysis = await callClaude(recruteur.claudeApiKey, profile, offreDescription);
      results.push({
        candidatId: candidat.id,
        score: Math.min(100, Math.max(0, analysis.score)),
        niveau: analysis.niveau,
        forces: analysis.forces || [],
        manques: analysis.manques || [],
        resume: analysis.resume || "",
      });
      // Petite pause entre chaque appel (évite le rate limiting)
      if (candidats.length > 1) await new Promise((r) => setTimeout(r, 300));
    } catch (error) {
      logger.error("Erreur matching candidat", { candidatId: candidat.id, error: String(error) });
      // Propager l'erreur de clé invalide immédiatement
      if (String(error).includes("invalide") || String(error).includes("401")) throw error;
      // Pour les autres erreurs, continuer avec un score nul
      results.push({
        candidatId: candidat.id,
        score: 0,
        niveau: "faible",
        forces: [],
        manques: ["Erreur d'analyse"],
        resume: "Impossible d'analyser ce profil.",
      });
    }
  }

  // Trier par score décroissant
  results.sort((a, b) => b.score - a.score);

  return NextResponse.json({ success: true, data: { results, offre: offre.title } });
});
