/**
 * Système de Matching Candidat-Offre - VERSION CORRIGÉE
 *
 * Algorithme de scoring pondéré pour trouver les meilleurs candidats
 * pour une offre d'emploi donnée.
 */

// Types pour le matching
export interface CandidatForMatching {
  id: string;
  nom: string | null;
  prenom: string | null;
  image: string | null;
  ville: string | null;
  pays: string;
  domaine: string | null;
  statut: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  candidatCompetences: { competence: string }[];
  competencesList: { nom: string; niveau: number; categorie: string }[];
  experiences: {
    poste: string;
    entreprise: string;
    typeContrat: string;
    dateDebut: Date;
    dateFin: Date | null;
    experienceCompetences: { competence: string }[];
  }[];
  formations: {
    diplome: string;
    domaine: string;
    etablissement: string;
  }[];
  niveauEtude: { nom: string }[];
  certifications: { nom: string }[];
  user: {
    email: string;
    name: string | null;
  };
}

export interface JobOfferForMatching {
  id: string;
  title: string;
  description: string | null;
  company: string | null;
  location: string | null;
  type: string | null;
}

export interface MatchResult {
  candidat: CandidatForMatching;
  score: number;
  scoreDetails: {
    competences: number;
    localisation: number;
    experience: number;
    domaine: number;
    disponibilite: number;
    formations: number;
  };
  matchedCompetences: string[];
  missingCompetences: string[];
  highlights: string[];
}

// Pondérations des critères (total = 100)
const WEIGHTS = {
  competences: 40,
  localisation: 20,
  experience: 20,
  domaine: 10,
  disponibilite: 5,
  formations: 5,
};

// ✅ FIX 1: Mode debug corrigé
const DEBUG_MODE = process.env.MATCHING_DEBUG === "true";

function log(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log("[MATCHING]", ...args);
  }
}

// Liste de compétences techniques - optimisée pour le matching
const COMMON_SKILLS = [
  // Langages de programmation
  "javascript",
  "typescript",
  "python",
  "java",
  "php",
  "ruby",
  "c++",
  "c#",
  "go",
  "rust",
  "swift",
  "kotlin",
  "scala",
  "r",

  // Frontend
  "react",
  "reactjs",
  "vue",
  "vuejs",
  "angular",
  "angularjs",
  "svelte",
  "nextjs",
  "nuxt",
  "gatsby",
  "html",
  "html5",
  "css",
  "css3",
  "sass",
  "scss",
  "tailwind",
  "tailwindcss",
  "bootstrap",

  // Backend
  "nodejs",
  "express",
  "expressjs",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "springboot",
  "laravel",
  "symfony",
  "rails",
  "asp.net",
  ".net",
  "dotnet",

  // Bases de données
  "sql",
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "elasticsearch",
  "sqlite",
  "oracle",
  "firebase",
  "supabase",
  "prisma",

  // Cloud & DevOps
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "k8s",
  "terraform",
  "ansible",
  "jenkins",
  "gitlab",
  "github",
  "ci/cd",
  "nginx",

  // Mobile
  "react native",
  "flutter",
  "ionic",
  "android",
  "ios",

  // Data & IA
  "machine learning",
  "deep learning",
  "tensorflow",
  "pytorch",
  "data science",
  "pandas",
  "numpy",
  "big data",

  // Autres
  "git",
  "agile",
  "scrum",
  "rest",
  "api",
  "graphql",
  "microservices",
];

// ✅ FIX 2: Synonymes pour améliorer le matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  vue: ["vuejs", "vue.js"],
  node: ["nodejs", "node.js"],
  next: ["nextjs", "next.js"],
  postgresql: ["postgres", "pgsql"],
  mongodb: ["mongo"],
  kubernetes: ["k8s"],
  javascript: ["js", "ecmascript"],
  typescript: ["ts"],
};

// Patterns pour détecter les années d'expérience
const EXPERIENCE_PATTERNS = [
  /(\d+)\s*(?:à|a|-|–)\s*(\d+)\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
  /(\d+)\s*\+?\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
  /(?:minimum|min\.?|au moins)\s*(\d+)\s*(?:ans?|années?|years?)/gi,
  /junior|débutant|debutant|entry.?level/gi,
  /confirmé|confirme|mid.?level|intermédiaire|intermediaire/gi,
  /senior|expert|lead|principal|staff/gi,
];

// ✅ Normalisation améliorée
function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[.,;:!?()]/g, " ") // Supprime la ponctuation
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ✅ FIX 3: Extraction de compétences améliorée
function extractSkillsFromDescription(description: string | null): Set<string> {
  const skills = new Set<string>();
  if (!description) return skills;

  const normalizedDesc = normalize(stripHtml(description));

  COMMON_SKILLS.forEach((skill) => {
    const normalizedSkill = normalize(skill);

    // Créer un pattern flexible qui gère les espaces et caractères spéciaux
    const pattern = normalizedSkill
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Échapper d'abord !
      .replace(/\s+/g, "\\s*"); // Puis gérer les espaces

    const regex = new RegExp(`(?:^|\\s)${pattern}(?:\\s|$|,|;)`, "i");

    if (regex.test(normalizedDesc)) {
      skills.add(normalizedSkill);

      // Ajouter aussi les synonymes
      if (SKILL_SYNONYMS[normalizedSkill]) {
        SKILL_SYNONYMS[normalizedSkill].forEach((syn) => {
          if (regex.test(normalizedDesc)) {
            skills.add(normalizedSkill); // On garde le skill principal
          }
        });
      }
    }
  });

  log("📋 Compétences extraites:", [...skills].join(", "));
  return skills;
}

// ✅ FIX 4: Matching de compétences corrigé (évite les faux positifs)
function isSkillMatch(candidatSkill: string, requiredSkill: string): boolean {
  const c = normalize(candidatSkill);
  const r = normalize(requiredSkill);

  // Match exact
  if (c === r) return true;

  // Vérifier les synonymes
  if (SKILL_SYNONYMS[r]?.some((syn) => normalize(syn) === c)) return true;
  if (SKILL_SYNONYMS[c]?.some((syn) => normalize(syn) === r)) return true;

  // Match par inclusion SEULEMENT si les mots sont assez longs
  // Évite "java" qui match "javascript"
  if (c.length >= 5 && r.length >= 5) {
    if (c.includes(r) || r.includes(c)) return true;
  }

  // Similarity pour les fautes de frappe
  const similarity = stringSimilarity(c, r);
  return similarity > 0.85;
}

function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Extraction expérience
function extractExperienceFromDescription(description: string | null): {
  min: number;
  max: number;
} {
  if (!description) return { min: 0, max: 99 };

  const normalizedDesc = normalize(stripHtml(description));

  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = pattern.exec(normalizedDesc);
    if (match) {
      log(`⏱️ Pattern expérience trouvé: "${match[0]}"`);

      if (/junior|débutant|debutant|entry/i.test(match[0])) {
        return { min: 0, max: 2 };
      }
      if (/confirmé|confirme|mid|intermédiaire|intermediaire/i.test(match[0])) {
        return { min: 3, max: 5 };
      }
      if (/senior|expert|lead|principal|staff/i.test(match[0])) {
        return { min: 5, max: 99 };
      }
      if (match[1]) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min + 2;
        return { min, max };
      }
    }
    pattern.lastIndex = 0;
  }

  return { min: 0, max: 99 };
}

// Extraction formation
function extractFormationLevel(description: string | null): number {
  if (!description) return 0;

  const normalizedDesc = normalize(stripHtml(description));

  const bacMatch = /bac\s*\+\s*(\d+)/i.exec(normalizedDesc);
  if (bacMatch) return parseInt(bacMatch[1]);

  if (/doctorat|phd/i.test(normalizedDesc)) return 8;
  if (/master|maitrise|maîtrise/i.test(normalizedDesc)) return 5;
  if (/ingénieur|ingenieur|engineer/i.test(normalizedDesc)) return 5;
  if (/licence|bachelor/i.test(normalizedDesc)) return 3;
  if (/bts|dut/i.test(normalizedDesc)) return 2;

  return 0;
}

// ✅ FIX 5: Calcul compétences amélioré
function calculateCompetenceScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): { score: number; matched: string[]; missing: string[] } {
  log("\n🔍 === CALCUL SCORE COMPÉTENCES ===");

  const candidatCompetences = new Set<string>();

  // Collecter compétences du candidat
  candidat.candidatCompetences.forEach((c) =>
    candidatCompetences.add(normalize(c.competence)),
  );

  candidat.competencesList.forEach((c) =>
    candidatCompetences.add(normalize(c.nom)),
  );

  candidat.experiences.forEach((exp) => {
    exp.experienceCompetences.forEach((c) =>
      candidatCompetences.add(normalize(c.competence)),
    );

    // Extraire compétences du poste
    const posteSkills = extractSkillsFromDescription(exp.poste);
    posteSkills.forEach((skill) => candidatCompetences.add(skill));
  });

  if (candidat.bio) {
    const bioSkills = extractSkillsFromDescription(candidat.bio);
    bioSkills.forEach((skill) => candidatCompetences.add(skill));
  }

  // Compétences requises
  const offreCompetences = extractSkillsFromDescription(offre.description);
  const titleSkills = extractSkillsFromDescription(offre.title);
  titleSkills.forEach((skill) => offreCompetences.add(skill));

  if (offreCompetences.size === 0) {
    log("⚠️ Aucune compétence détectée - score neutre 60%");
    return { score: 60, matched: [], missing: [] };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  offreCompetences.forEach((requiredSkill) => {
    let found = false;

    for (const candidatSkill of candidatCompetences) {
      if (isSkillMatch(candidatSkill, requiredSkill)) {
        found = true;
        log(`   ✅ "${requiredSkill}" ← match avec "${candidatSkill}"`);
        break;
      }
    }

    if (found) {
      matched.push(requiredSkill);
    } else {
      missing.push(requiredSkill);
      log(`   ❌ "${requiredSkill}" ← non trouvé`);
    }
  });

  const score = (matched.length / offreCompetences.size) * 100;
  log(
    `📊 RÉSULTAT: ${matched.length}/${offreCompetences.size} = ${Math.round(
      score,
    )}%`,
  );

  return {
    score,
    matched: [...new Set(matched)],
    missing: [...new Set(missing)],
  };
}

// Calcul localisation
function calculateLocationScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): number {
  if (!offre.location) return 100;

  const offreLocation = normalize(offre.location);
  const candidatVille = normalize(candidat.ville);
  const candidatPays = normalize(candidat.pays);

  if (candidatVille && offreLocation.includes(candidatVille)) return 100;
  if (candidatPays && offreLocation.includes(candidatPays)) return 70;

  const descNormalized = normalize(stripHtml(offre.description));
  if (
    offreLocation.includes("remote") ||
    offreLocation.includes("teletravail") ||
    descNormalized.includes("teletravail") ||
    descNormalized.includes("remote")
  ) {
    return 90;
  }

  const similarity = stringSimilarity(
    candidatVille || candidatPays,
    offreLocation,
  );
  return similarity * 100;
}

// Calcul expérience totale
function calculateTotalExperience(candidat: CandidatForMatching): number {
  let totalMonths = 0;

  candidat.experiences.forEach((exp) => {
    const start = new Date(exp.dateDebut);
    const end = exp.dateFin ? new Date(exp.dateFin) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  });

  return totalMonths / 12;
}

// ✅ FIX 6: Scoring expérience corrigé
function calculateExperienceScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): number {
  const candidatYears = calculateTotalExperience(candidat);
  const { min: requiredMin, max: requiredMax } =
    extractExperienceFromDescription(offre.description);

  log(
    `   Candidat: ${candidatYears.toFixed(
      1,
    )} ans vs requis ${requiredMin}-${requiredMax} ans`,
  );

  // Pas de contrainte
  if (requiredMin === 0 && requiredMax === 99) {
    return candidatYears > 0 ? 80 : 50;
  }

  // Dans la fourchette = parfait
  if (candidatYears >= requiredMin && candidatYears <= requiredMax) {
    log("   ✅ Dans la fourchette → 100%");
    return 100;
  }

  // Surqualifié = toujours bon (ne pas pénaliser)
  if (candidatYears > requiredMax) {
    const excess = candidatYears - requiredMax;
    if (excess <= 2) return 95; // Légèrement surqualifié
    if (excess <= 5) return 90; // Modérément surqualifié
    return 85; // Très surqualifié (risque de s'ennuyer)
  }

  // Sous-qualifié
  if (candidatYears >= requiredMin - 1 && candidatYears > 0) {
    log("   ⚠️ Proche du minimum (-1 an) → 75%");
    return 75;
  }

  if (candidatYears > 0) {
    const ratio = candidatYears / requiredMin;
    const score = Math.round(ratio * 70);
    log(`   ⚠️ ${Math.round(ratio * 100)}% du requis → ${score}%`);
    return score;
  }

  log("   ❌ Aucune expérience → 20%");
  return 20;
}

// Mapping domaines
const DOMAINE_KEYWORDS: Record<string, string[]> = {
  informatique: [
    "developpeur",
    "developer",
    "programmeur",
    "software",
    "it",
    "tech",
  ],
  "developpement-web": ["web", "frontend", "backend", "fullstack"],
  "developpement-mobile": ["mobile", "android", "ios", "flutter"],
  cybersecurite: ["securite", "security", "cyber"],
  "intelligence-artificielle": ["ia", "ai", "machine learning", "data science"],
  cloud: ["cloud", "aws", "azure", "gcp", "devops"],
  marketing: ["marketing", "communication", "publicite"],
  finance: ["finance", "banque", "comptabilite"],
};

function inferCandidatDomaine(candidat: CandidatForMatching): string[] {
  const inferredDomaines: Set<string> = new Set();
  const allTexts: string[] = [];

  if (candidat.domaine) allTexts.push(candidat.domaine);
  candidat.experiences.forEach((exp) => {
    allTexts.push(exp.poste);
    allTexts.push(exp.entreprise);
  });
  candidat.candidatCompetences.forEach((c) => allTexts.push(c.competence));
  candidat.formations.forEach((f) => {
    allTexts.push(f.diplome);
    allTexts.push(f.domaine);
  });
  if (candidat.bio) allTexts.push(candidat.bio);

  const normalizedTexts = allTexts.map((t) => normalize(t)).join(" ");

  Object.entries(DOMAINE_KEYWORDS).forEach(([domaine, keywords]) => {
    const matchCount = keywords.filter((kw) =>
      normalizedTexts.includes(normalize(kw)),
    ).length;
    if (matchCount >= 2) inferredDomaines.add(domaine);
  });

  return [...inferredDomaines];
}

function extractOffreDomaines(offre: JobOfferForMatching): string[] {
  const domaines: Set<string> = new Set();
  const offreText = normalize(`${offre.title} ${stripHtml(offre.description)}`);

  Object.entries(DOMAINE_KEYWORDS).forEach(([domaine, keywords]) => {
    const matchCount = keywords.filter((kw) =>
      offreText.includes(normalize(kw)),
    ).length;
    if (matchCount >= 1) domaines.add(domaine);
  });

  return [...domaines];
}

// ✅ FIX 7: Scoring domaine corrigé
function calculateDomaineScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): number {
  const candidatDomaines = inferCandidatDomaine(candidat);
  const candidatDomaineExplicite = normalize(candidat.domaine);
  const offreDomaines = extractOffreDomaines(offre);

  log(`   Domaine explicite: ${candidatDomaineExplicite || "N/A"}`);
  log(`   Domaines déduits: ${candidatDomaines.join(", ") || "aucun"}`);
  log(`   Domaines offre: ${offreDomaines.join(", ") || "non détectés"}`);

  // Si pas de domaine dans l'offre = score neutre
  if (offreDomaines.length === 0) return 60;

  // Match domaine explicite
  if (candidatDomaineExplicite) {
    if (
      offreDomaines.some(
        (d) =>
          d.includes(candidatDomaineExplicite) ||
          candidatDomaineExplicite.includes(d),
      )
    ) {
      return 100;
    }
  }

  // Match domaines déduits
  if (candidatDomaines.length > 0) {
    const commonDomaines = candidatDomaines.filter((d) =>
      offreDomaines.includes(d),
    );
    if (commonDomaines.length > 0) {
      log(`   → ${commonDomaines.length} domaine(s) commun(s) → 85%`);
      return 85;
    }
  }

  // Vérifier expériences similaires
  const offreTitle = normalize(offre.title);
  const hasRelevantExperience = candidat.experiences.some((exp) => {
    const poste = normalize(exp.poste);
    return stringSimilarity(poste, offreTitle) > 0.4;
  });

  if (hasRelevantExperience) return 70;

  // Compétences communes suggèrent un domaine proche
  const candidatSkills = new Set<string>();
  candidat.candidatCompetences.forEach((c) =>
    candidatSkills.add(normalize(c.competence)),
  );
  const offreSkills = extractSkillsFromDescription(offre.description);
  const commonSkills = [...candidatSkills].filter((s) => offreSkills.has(s));

  if (commonSkills.length >= 3) return 65;
  if (commonSkills.length >= 1) return 50;

  // ✅ Aucune correspondance = vraiment 0%
  log("   ❌ Aucune correspondance de domaine → 0%");
  return 0;
}

// ✅ FIX 8: Scoring disponibilité corrigé
function calculateDisponibiliteScore(candidat: CandidatForMatching): number {
  const statut = normalize(candidat.statut);

  log("   Statut:", candidat.statut || "N/A");

  if (!statut) {
    log("   ⚠️ Statut non renseigné → 50% (neutre)");
    return 50; // Neutre au lieu de 0
  }

  // Mapping exact des statuts UI
  const statutScores: Record<string, number> = {
    disponible: 100,
    "recherche-active": 100,
    "recherche active": 100,
    "a-lecoute": 70,
    "a l'ecoute": 70,
    "preavis-1-mois": 85,
    "preavis 1 mois": 85,
    "preavis-2-mois": 75,
    "preavis 2 mois": 75,
    "preavis-3-mois": 65,
    "preavis 3 mois": 65,
    "en-poste": 40,
    "en poste": 40,
    etudiant: 70,
  };

  // Match exact
  if (statutScores[statut]) {
    log(`   → ${statutScores[statut]}%`);
    return statutScores[statut];
  }

  // Fallback patterns
  if (statut.includes("disponible") || statut.includes("recherche")) return 100;
  if (statut.includes("preavis")) return 75;
  if (statut.includes("ecoute")) return 70;
  if (statut.includes("poste")) return 40;

  return 60;
}

// ✅ FIX 9: Scoring formation corrigé
function calculateFormationScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): number {
  const hasFormationData =
    candidat.formations.length > 0 ||
    candidat.niveauEtude.length > 0 ||
    candidat.certifications.length > 0;

  if (!hasFormationData) {
    log("   ⚠️ Aucune formation → 30% (pénalité légère)");
    return 30; // Moins pénalisant qu'avant
  }

  const requiredLevel = extractFormationLevel(offre.description);
  let candidatLevel = 0;

  candidat.formations.forEach((formation) => {
    const diplome = normalize(formation.diplome);
    if (diplome.includes("doctorat") || diplome.includes("phd")) {
      candidatLevel = Math.max(candidatLevel, 8);
    } else if (diplome.includes("master") || diplome.includes("ingenieur")) {
      candidatLevel = Math.max(candidatLevel, 5);
    } else if (diplome.includes("licence") || diplome.includes("bachelor")) {
      candidatLevel = Math.max(candidatLevel, 3);
    } else if (diplome.includes("bts") || diplome.includes("dut")) {
      candidatLevel = Math.max(candidatLevel, 2);
    }
  });

  candidat.niveauEtude.forEach((niveau) => {
    const bacMatch = /bac\s*\+?\s*(\d+)/i.exec(niveau.nom);
    if (bacMatch) {
      candidatLevel = Math.max(candidatLevel, parseInt(bacMatch[1]));
    }
  });

  let score = 50;

  if (requiredLevel > 0) {
    if (candidatLevel >= requiredLevel) {
      score = 100;
    } else if (candidatLevel >= requiredLevel - 1) {
      score = 80;
    } else if (candidatLevel >= requiredLevel - 2) {
      score = 60;
    } else {
      score = 40;
    }
  } else {
    // Pas de niveau requis = bonus pour avoir des formations
    score = 60 + candidatLevel * 5;
  }

  // Bonus certifications
  score += Math.min(candidat.certifications.length * 5, 20);

  return Math.min(100, score);
}

// Génération highlights
function generateHighlights(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
  scoreDetails: MatchResult["scoreDetails"],
  matchedCompetences: string[],
): string[] {
  const highlights: string[] = [];

  if (scoreDetails.competences >= 80 && matchedCompetences.length > 0) {
    highlights.push(`${matchedCompetences.length} compétences correspondantes`);
  }

  if (scoreDetails.localisation >= 90) {
    highlights.push("Localisation idéale");
  }

  const years = calculateTotalExperience(candidat);
  if (years > 0) {
    highlights.push(
      `${Math.round(years)} an${years > 1 ? "s" : ""} d'expérience`,
    );
  }

  if (candidat.certifications.length > 0) {
    highlights.push(
      `${candidat.certifications.length} certification${
        candidat.certifications.length > 1 ? "s" : ""
      }`,
    );
  }

  if (scoreDetails.disponibilite >= 90) {
    highlights.push("Disponible immédiatement");
  }

  if (candidat.linkedinUrl) {
    highlights.push("Profil LinkedIn");
  }

  if (candidat.formations.length > 0) {
    const topFormation = candidat.formations[0];
    if (topFormation.diplome) {
      highlights.push(topFormation.diplome);
    }
  }

  return highlights.slice(0, 4);
}

// Calcul du score global
export function calculateMatchScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
): MatchResult {
  log("\n" + "═".repeat(60));
  log(`🎯 MATCHING: ${candidat.prenom} ${candidat.nom} ↔ ${offre.title}`);
  log("═".repeat(60));

  const competenceResult = calculateCompetenceScore(candidat, offre);

  log("\n📍 LOCALISATION:");
  const localisationScore = calculateLocationScore(candidat, offre);
  log(`   → Score: ${Math.round(localisationScore)}%`);

  log("\n⏱️ EXPÉRIENCE:");
  const experienceScore = calculateExperienceScore(candidat, offre);

  log("\n🏢 DOMAINE:");
  const domaineScore = calculateDomaineScore(candidat, offre);

  log("\n📅 DISPONIBILITÉ:");
  const disponibiliteScore = calculateDisponibiliteScore(candidat);

  log("\n🎓 FORMATIONS:");
  const formationScore = calculateFormationScore(candidat, offre);
  log(`   → Score: ${Math.round(formationScore)}%`);

  const scoreDetails = {
    competences: Math.round(competenceResult.score),
    localisation: Math.round(localisationScore),
    experience: Math.round(experienceScore),
    domaine: Math.round(domaineScore),
    disponibilite: Math.round(disponibiliteScore),
    formations: Math.round(formationScore),
  };

  const globalScore =
    (scoreDetails.competences * WEIGHTS.competences +
      scoreDetails.localisation * WEIGHTS.localisation +
      scoreDetails.experience * WEIGHTS.experience +
      scoreDetails.domaine * WEIGHTS.domaine +
      scoreDetails.disponibilite * WEIGHTS.disponibilite +
      scoreDetails.formations * WEIGHTS.formations) /
    100;

  log("\n📊 SCORE FINAL:", Math.round(globalScore), "%");
  log("═".repeat(60) + "\n");

  const highlights = generateHighlights(
    candidat,
    offre,
    scoreDetails,
    competenceResult.matched,
  );

  return {
    candidat,
    score: Math.round(globalScore),
    scoreDetails,
    matchedCompetences: competenceResult.matched,
    missingCompetences: competenceResult.missing,
    highlights,
  };
}

export function calculateMatches(
  candidats: CandidatForMatching[],
  offre: JobOfferForMatching,
  options: { minScore?: number; limit?: number } = {},
): MatchResult[] {
  const { minScore = 30, limit = 50 } = options;

  const results = candidats
    .map((candidat) => calculateMatchScore(candidat, offre))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const nameA = `${a.candidat.nom} ${a.candidat.prenom}`.toLowerCase();
      const nameB = `${b.candidat.nom} ${b.candidat.prenom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    })
    .slice(0, limit);

  return results;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export function getMatchLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 85) {
    return {
      label: "Excellent",
      color: "text-green-700",
      bgColor: "bg-green-100",
    };
  }
  if (score >= 70) {
    return {
      label: "Très bon",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
    };
  }
  if (score >= 55) {
    return { label: "Bon", color: "text-yellow-700", bgColor: "bg-yellow-100" };
  }
  if (score >= 40) {
    return {
      label: "Moyen",
      color: "text-orange-700",
      bgColor: "bg-orange-100",
    };
  }
  return { label: "Faible", color: "text-red-700", bgColor: "bg-red-100" };
}

export function getExtractedSkills(description: string | null): string[] {
  return [...extractSkillsFromDescription(description)];
}

export function getExtractedExperience(description: string | null): {
  min: number;
  max: number;
} {
  return extractExperienceFromDescription(description);
}
