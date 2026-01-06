/**
 * Système de Matching Candidat-Offre
 *
 * Algorithme de scoring pondéré pour trouver les meilleurs candidats
 * pour une offre d'emploi donnée.
 *
 * Les informations critiques sont extraites de la description de l'offre.
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

// Mode debug - activer pour voir les logs détaillés
const DEBUG_MODE = process.env.MATCHING_DEBUG === "false" || false;

function log(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log("[MATCHING]", ...args);
  }
}

// Liste de compétences techniques courantes à rechercher dans la description
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
  "react.js",
  "vue",
  "vuejs",
  "vue.js",
  "angular",
  "angularjs",
  "svelte",
  "next",
  "nextjs",
  "next.js",
  "nuxt",
  "gatsby",
  "html",
  "html5",
  "css",
  "css3",
  "sass",
  "scss",
  "less",
  "tailwind",
  "tailwindcss",
  "bootstrap",
  "material-ui",
  "chakra",
  // Backend
  "node",
  "nodejs",
  "node.js",
  "express",
  "expressjs",
  "nestjs",
  "fastify",
  "django",
  "flask",
  "fastapi",
  "spring",
  "springboot",
  "laravel",
  "symfony",
  "rails",
  "ruby on rails",
  "asp.net",
  ".net",
  "dotnet",
  // Bases de données
  "sql",
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "mongo",
  "redis",
  "elasticsearch",
  "sqlite",
  "oracle",
  "mariadb",
  "dynamodb",
  "cassandra",
  "couchdb",
  "firebase",
  "supabase",
  "prisma",
  // Cloud & DevOps
  "aws",
  "amazon web services",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "k8s",
  "terraform",
  "ansible",
  "jenkins",
  "gitlab ci",
  "github actions",
  "circleci",
  "nginx",
  "apache",
  "linux",
  "ubuntu",
  "debian",
  // Mobile
  "react native",
  "flutter",
  "ionic",
  "xamarin",
  "android",
  "ios",
  "mobile",
  // Data & IA
  "machine learning",
  "ml",
  "deep learning",
  "tensorflow",
  "pytorch",
  "keras",
  "scikit-learn",
  "pandas",
  "numpy",
  "data science",
  "data analysis",
  "big data",
  "hadoop",
  "spark",
  "tableau",
  "power bi",
  // Autres
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "jira",
  "confluence",
  "agile",
  "scrum",
  "kanban",
  "rest",
  "restful",
  "api",
  "graphql",
  "websocket",
  "microservices",
  "ci/cd",
  "testing",
  "jest",
  "mocha",
  "cypress",
  "selenium",
  "unit test",
  "tdd",
  "figma",
  "sketch",
  "adobe xd",
  "photoshop",
  "illustrator",
  // Soft skills
  "communication",
  "leadership",
  "management",
  "teamwork",
  "problem solving",
  // Métiers
  "fullstack",
  "full stack",
  "full-stack",
  "frontend",
  "front-end",
  "front end",
  "backend",
  "back-end",
  "back end",
  "devops",
  "sre",
  "data engineer",
  "data scientist",
  "product manager",
  "scrum master",
  "tech lead",
  // Langues
  "anglais",
  "english",
  "français",
  "french",
  "espagnol",
  "spanish",
  "allemand",
  "german",
];

// Patterns pour détecter les années d'expérience dans la description
const EXPERIENCE_PATTERNS = [
  /(\d+)\s*(?:à|a|-|–)\s*(\d+)\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
  /(\d+)\s*\+?\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
  /(?:expérience|experience)\s*(?:de\s*)?(\d+)\s*(?:à|a|-|–)?\s*(\d+)?\s*(?:ans?|années?|years?)/gi,
  /(?:minimum|min\.?|au moins)\s*(\d+)\s*(?:ans?|années?|years?)/gi,
  /(\d+)\s*(?:ans?|années?|years?)\s*(?:minimum|min\.?)/gi,
  /junior|débutant|debutant|entry.?level/gi,
  /confirmé|confirme|mid.?level|intermédiaire|intermediaire/gi,
  /senior|expert|lead|principal|staff/gi,
];

// Patterns pour détecter les formations requises
const FORMATION_PATTERNS = [
  /bac\s*\+\s*(\d+)/gi,
  /master|maitrise|maîtrise/gi,
  /licence|bachelor/gi,
  /ingénieur|ingenieur|engineer/gi,
  /doctorat|phd|doctorate/gi,
  /bts|dut|deug/gi,
  /diplôme|diplome|diploma/gi,
  /formation|certified|certification/gi,
];

/**
 * Normalise une chaîne pour la comparaison
 */
function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/<[^>]*>/g, " ") // Supprime les balises HTML
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/**
 * Extrait le texte brut d'une chaîne HTML
 */
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calcule la similarité entre deux chaînes (algorithme de Jaccard simplifié)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  // Vérifier si l'une contient l'autre
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Calcul de similarité par mots communs
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Extrait les compétences depuis la description de l'offre
 */
function extractSkillsFromDescription(description: string | null): Set<string> {
  const skills = new Set<string>();
  if (!description) {
    log("📋 Extraction compétences: description vide");
    return skills;
  }

  const normalizedDesc = normalize(stripHtml(description));
  log(
    "📋 Extraction compétences depuis description:",
    normalizedDesc.substring(0, 200) + "..."
  );

  // Rechercher les compétences courantes dans la description
  COMMON_SKILLS.forEach((skill) => {
    const normalizedSkill = normalize(skill);
    // Utiliser des word boundaries pour éviter les faux positifs
    const regex = new RegExp(
      `\\b${normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    if (regex.test(normalizedDesc)) {
      skills.add(normalizedSkill);
    }
  });

  log("📋 Compétences extraites:", [...skills].join(", "));
  return skills;
}

/**
 * Extrait les années d'expérience requises depuis la description
 */
function extractExperienceFromDescription(description: string | null): {
  min: number;
  max: number;
} {
  if (!description) {
    log("⏱️ Extraction expérience: description vide");
    return { min: 0, max: 99 };
  }

  const normalizedDesc = normalize(stripHtml(description));

  // Chercher les patterns d'expérience
  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = pattern.exec(normalizedDesc);
    if (match) {
      log(`⏱️ Pattern expérience trouvé: "${match[0]}"`);
      // Pattern "junior/débutant"
      if (/junior|débutant|debutant|entry/i.test(match[0])) {
        log("   → Junior/Débutant: 0-2 ans");
        return { min: 0, max: 2 };
      }
      // Pattern "confirmé/mid-level"
      if (/confirmé|confirme|mid|intermédiaire|intermediaire/i.test(match[0])) {
        log("   → Confirmé: 3-5 ans");
        return { min: 3, max: 5 };
      }
      // Pattern "senior/expert"
      if (/senior|expert|lead|principal|staff/i.test(match[0])) {
        log("   → Senior/Expert: 5+ ans");
        return { min: 5, max: 99 };
      }
      // Pattern avec nombres
      if (match[1]) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min + 2;
        log(`   → ${min}-${max} ans`);
        return { min, max };
      }
    }
    pattern.lastIndex = 0; // Reset regex
  }

  log("⏱️ Aucun pattern d'expérience trouvé - pas de contrainte");
  return { min: 0, max: 99 }; // Pas de contrainte trouvée
}

/**
 * Extrait le niveau de formation requis depuis la description
 */
function extractFormationLevel(description: string | null): number {
  if (!description) return 0;

  const normalizedDesc = normalize(stripHtml(description));

  // Bac+X
  const bacMatch = /bac\s*\+\s*(\d+)/i.exec(normalizedDesc);
  if (bacMatch) {
    return parseInt(bacMatch[1]);
  }

  // Autres niveaux
  if (/doctorat|phd/i.test(normalizedDesc)) return 8;
  if (/master|maitrise|maîtrise/i.test(normalizedDesc)) return 5;
  if (/ingénieur|ingenieur|engineer/i.test(normalizedDesc)) return 5;
  if (/licence|bachelor/i.test(normalizedDesc)) return 3;
  if (/bts|dut/i.test(normalizedDesc)) return 2;

  return 0;
}

/**
 * Calcule le score de correspondance des compétences
 */
function calculateCompetenceScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): { score: number; matched: string[]; missing: string[] } {
  log("\n🔍 === CALCUL SCORE COMPÉTENCES ===");
  log(`👤 Candidat: ${candidat.prenom} ${candidat.nom}`);
  log(`📄 Offre: ${offre.title}`);

  // Collecter toutes les compétences du candidat
  const candidatCompetences = new Set<string>();

  // Compétences directes
  log("\n📌 Sources des compétences candidat:");

  log(
    "  1️⃣ candidatCompetences:",
    candidat.candidatCompetences.map((c) => c.competence).join(", ") || "aucune"
  );
  candidat.candidatCompetences.forEach((c) =>
    candidatCompetences.add(normalize(c.competence))
  );

  // Compétences de la liste
  log(
    "  2️⃣ competencesList:",
    candidat.competencesList.map((c) => c.nom).join(", ") || "aucune"
  );
  candidat.competencesList.forEach((c) =>
    candidatCompetences.add(normalize(c.nom))
  );

  // Compétences des expériences
  log("  3️⃣ Expériences:");
  candidat.experiences.forEach((exp, idx) => {
    log(`     ${idx + 1}. ${exp.poste} @ ${exp.entreprise}`);
    log(
      `        Compétences: ${
        exp.experienceCompetences.map((c) => c.competence).join(", ") ||
        "aucune"
      }`
    );
    exp.experienceCompetences.forEach((c) =>
      candidatCompetences.add(normalize(c.competence))
    );
    // Ajouter aussi les mots-clés du poste
    const posteNormalized = normalize(exp.poste);
    COMMON_SKILLS.forEach((skill) => {
      if (posteNormalized.includes(normalize(skill))) {
        candidatCompetences.add(normalize(skill));
      }
    });
  });

  // Extraire les compétences de la bio du candidat
  if (candidat.bio) {
    log("  4️⃣ Bio:", candidat.bio.substring(0, 100) + "...");
    const bioSkills = extractSkillsFromDescription(candidat.bio);
    log(
      `     Compétences extraites de la bio: ${
        [...bioSkills].join(", ") || "aucune"
      }`
    );
    bioSkills.forEach((skill) => candidatCompetences.add(skill));
  }

  log("\n✅ TOTAL compétences candidat:", [...candidatCompetences].join(", "));

  // Compétences requises extraites de la description de l'offre
  log("\n📋 Extraction compétences de l'offre:");
  const offreCompetences = extractSkillsFromDescription(offre.description);

  // Ajouter les compétences du titre de l'offre
  const titleSkills = extractSkillsFromDescription(offre.title);
  titleSkills.forEach((skill) => offreCompetences.add(skill));

  log("📋 TOTAL compétences requises:", [...offreCompetences].join(", "));

  if (offreCompetences.size === 0) {
    log("⚠️ Aucune compétence détectée dans l'offre - score neutre 50%");
    return { score: 50, matched: [], missing: [] };
  }

  // Calculer les correspondances
  const matched: string[] = [];
  const missing: string[] = [];

  log("\n🔄 MATCHING:");
  offreCompetences.forEach((requiredSkill) => {
    let found = false;
    let matchedWith = "";

    candidatCompetences.forEach((candidatSkill) => {
      // Éviter les faux positifs avec des chaînes trop courtes
      const minLength = Math.min(candidatSkill.length, requiredSkill.length);

      // Match exact
      if (candidatSkill === requiredSkill) {
        found = true;
        matchedWith = candidatSkill;
        return;
      }

      // Match par inclusion (seulement si la sous-chaîne est significative, min 3 chars)
      if (minLength >= 3) {
        if (
          candidatSkill.includes(requiredSkill) ||
          requiredSkill.includes(candidatSkill)
        ) {
          found = true;
          matchedWith = candidatSkill;
          return;
        }
      }

      // Match par similarité (seulement pour des mots de longueur similaire)
      if (Math.abs(candidatSkill.length - requiredSkill.length) <= 3) {
        const similarity = stringSimilarity(candidatSkill, requiredSkill);
        if (similarity > 0.7) {
          found = true;
          matchedWith = candidatSkill;
        }
      }
    });

    if (found) {
      matched.push(requiredSkill);
      log(`   ✅ "${requiredSkill}" ← match avec "${matchedWith}"`);
    } else {
      missing.push(requiredSkill);
      log(`   ❌ "${requiredSkill}" ← non trouvé`);
    }
  });

  const score = (matched.length / offreCompetences.size) * 100;

  log(
    `\n📊 RÉSULTAT: ${matched.length}/${offreCompetences.size} = ${Math.round(
      score
    )}%`
  );
  log("=".repeat(50));

  return {
    score,
    matched: [...new Set(matched)],
    missing: [...new Set(missing)],
  };
}

/**
 * Calcule le score de localisation
 */
function calculateLocationScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): number {
  if (!offre.location) return 100; // Pas de contrainte de localisation

  const offreLocation = normalize(offre.location);
  const candidatVille = normalize(candidat.ville);
  const candidatPays = normalize(candidat.pays);

  // Correspondance exacte ville
  if (candidatVille && offreLocation.includes(candidatVille)) {
    return 100;
  }

  // Correspondance pays
  if (candidatPays && offreLocation.includes(candidatPays)) {
    return 70;
  }

  // Télétravail possible (chercher dans location et description)
  const descNormalized = normalize(stripHtml(offre.description));
  if (
    offreLocation.includes("remote") ||
    offreLocation.includes("teletravail") ||
    offreLocation.includes("distance") ||
    descNormalized.includes("teletravail") ||
    descNormalized.includes("remote") ||
    descNormalized.includes("a distance")
  ) {
    return 90;
  }

  // Similarité partielle
  const similarity = stringSimilarity(
    candidatVille || candidatPays,
    offreLocation
  );
  return similarity * 100;
}

/**
 * Calcule les années d'expérience du candidat
 */
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

  return totalMonths / 12; // Retourne en années
}

/**
 * Calcule le score d'expérience
 */
function calculateExperienceScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): number {
  const candidatYears = calculateTotalExperience(candidat);

  // Extraire les années requises de la description
  const { min: requiredMin, max: requiredMax } =
    extractExperienceFromDescription(offre.description);

  if (requiredMin === 0 && requiredMax === 99) {
    return 80; // Pas de contrainte claire
  }

  // Score basé sur la correspondance STRICTE
  log(
    `   Comparaison: ${candidatYears} ans vs requis ${requiredMin}-${requiredMax} ans`
  );

  if (candidatYears >= requiredMin && candidatYears <= requiredMax) {
    log("   ✅ Expérience parfaitement dans la fourchette → 100%");
    return 100;
  } else if (candidatYears > requiredMax) {
    // Surqualifié mais acceptable
    log("   ⚠️ Surqualifié → 80%");
    return 80;
  } else if (candidatYears >= requiredMin - 1 && candidatYears > 0) {
    // 1 an en dessous du minimum, mais a de l'expérience
    log("   ⚠️ Légèrement sous le minimum (-1 an) → 70%");
    return 70;
  } else if (candidatYears > 0 && candidatYears < requiredMin) {
    // A de l'expérience mais insuffisante
    const ratio = candidatYears / requiredMin;
    const score = Math.round(ratio * 60);
    log(
      `   ⚠️ Expérience insuffisante (${Math.round(
        ratio * 100
      )}% du requis) → ${score}%`
    );
    return score;
  }

  // Aucune expérience et l'offre en demande → 0%
  log("   ❌ Aucune expérience, offre en demande → 0%");
  return 0;
}

// Mapping des domaines vers des mots-clés associés
const DOMAINE_KEYWORDS: Record<string, string[]> = {
  informatique: [
    "developpeur",
    "developer",
    "programmeur",
    "software",
    "it",
    "tech",
    "code",
    "web",
    "mobile",
    "data",
    "devops",
    "fullstack",
    "frontend",
    "backend",
    "cloud",
  ],
  "developpement-logiciel": [
    "developpeur",
    "developer",
    "programmeur",
    "software",
    "code",
    "application",
  ],
  "developpement-web": [
    "web",
    "frontend",
    "backend",
    "fullstack",
    "react",
    "vue",
    "angular",
    "node",
    "php",
    "javascript",
  ],
  "developpement-mobile": [
    "mobile",
    "android",
    "ios",
    "flutter",
    "react native",
    "app",
  ],
  cybersecurite: ["securite", "security", "cyber", "pentest", "soc", "siem"],
  "intelligence-artificielle": [
    "ia",
    "ai",
    "machine learning",
    "ml",
    "deep learning",
    "nlp",
    "data science",
  ],
  "data-science": [
    "data",
    "scientist",
    "analyst",
    "analytics",
    "bi",
    "tableau",
    "power bi",
  ],
  "big-data": ["big data", "hadoop", "spark", "data engineer"],
  "cloud-computing": [
    "cloud",
    "aws",
    "azure",
    "gcp",
    "devops",
    "kubernetes",
    "docker",
  ],
  devops: [
    "devops",
    "sre",
    "ci/cd",
    "infrastructure",
    "deploy",
    "kubernetes",
    "docker",
  ],
  marketing: ["marketing", "communication", "publicite", "ads", "seo", "sem"],
  "marketing-digital": [
    "marketing digital",
    "seo",
    "sem",
    "ads",
    "social media",
    "growth",
  ],
  finance: ["finance", "banque", "trading", "investissement", "comptabilite"],
  rh: ["rh", "ressources humaines", "recrutement", "talent", "hr"],
  commercial: ["commercial", "vente", "sales", "business", "account"],
  design: ["design", "ux", "ui", "graphiste", "creatif", "figma"],
  "gestion-projet": [
    "chef de projet",
    "project manager",
    "scrum",
    "agile",
    "pmo",
  ],
};

/**
 * Déduit le domaine du candidat depuis ses expériences et compétences
 */
function inferCandidatDomaine(candidat: CandidatForMatching): string[] {
  const inferredDomaines: Set<string> = new Set();

  // Collecter tous les textes du candidat
  const allTexts: string[] = [];

  // Domaine explicite
  if (candidat.domaine) {
    allTexts.push(candidat.domaine);
  }

  // Postes des expériences
  candidat.experiences.forEach((exp) => {
    allTexts.push(exp.poste);
    allTexts.push(exp.entreprise);
  });

  // Compétences
  candidat.candidatCompetences.forEach((c) => allTexts.push(c.competence));
  candidat.competencesList.forEach((c) => allTexts.push(c.nom));

  // Formations
  candidat.formations.forEach((f) => {
    allTexts.push(f.diplome);
    allTexts.push(f.domaine);
  });

  // Bio
  if (candidat.bio) {
    allTexts.push(candidat.bio);
  }

  const normalizedTexts = allTexts.map((t) => normalize(t)).join(" ");

  // Chercher les mots-clés de chaque domaine
  Object.entries(DOMAINE_KEYWORDS).forEach(([domaine, keywords]) => {
    const matchCount = keywords.filter((kw) =>
      normalizedTexts.includes(normalize(kw))
    ).length;
    if (matchCount >= 2) {
      inferredDomaines.add(domaine);
    }
  });

  return [...inferredDomaines];
}

/**
 * Extrait le domaine de l'offre depuis le titre et la description
 */
function extractOffreDomaines(offre: JobOfferForMatching): string[] {
  const domaines: Set<string> = new Set();
  const offreText = normalize(`${offre.title} ${stripHtml(offre.description)}`);

  Object.entries(DOMAINE_KEYWORDS).forEach(([domaine, keywords]) => {
    const matchCount = keywords.filter((kw) =>
      offreText.includes(normalize(kw))
    ).length;
    if (matchCount >= 1) {
      domaines.add(domaine);
    }
  });

  return [...domaines];
}

/**
 * Calcule le score de correspondance de domaine
 */
function calculateDomaineScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): number {
  // Déduire les domaines du candidat
  const candidatDomaines = inferCandidatDomaine(candidat);
  const candidatDomaineExplicite = normalize(candidat.domaine);

  // Extraire les domaines de l'offre
  const offreDomaines = extractOffreDomaines(offre);
  const offreTitle = normalize(offre.title);
  const offreDescription = normalize(stripHtml(offre.description));

  log(`   Domaine explicite: ${candidatDomaineExplicite || "N/A"}`);
  log(`   Domaines déduits: ${candidatDomaines.join(", ") || "aucun"}`);
  log(`   Domaines offre: ${offreDomaines.join(", ") || "non détectés"}`);

  // Si pas de domaine détecté dans l'offre, score neutre
  if (offreDomaines.length === 0) {
    log("   → Pas de domaine détecté dans l'offre");
    return 60;
  }

  // Vérifier correspondance avec domaine explicite
  if (candidatDomaineExplicite) {
    // Match direct
    if (
      offreDomaines.some(
        (d) =>
          d.includes(candidatDomaineExplicite) ||
          candidatDomaineExplicite.includes(d)
      )
    ) {
      log("   → Match direct domaine explicite");
      return 100;
    }

    // Match dans le titre ou description
    if (
      offreTitle.includes(candidatDomaineExplicite) ||
      offreDescription.includes(candidatDomaineExplicite)
    ) {
      log("   → Domaine trouvé dans titre/description");
      return 90;
    }
  }

  // Vérifier correspondance avec domaines déduits
  if (candidatDomaines.length > 0) {
    const commonDomaines = candidatDomaines.filter((d) =>
      offreDomaines.includes(d)
    );
    if (commonDomaines.length > 0) {
      log(`   → Domaines communs: ${commonDomaines.join(", ")}`);
      return 85;
    }
  }

  // Vérifier les expériences dans le même domaine
  const hasRelevantExperience = candidat.experiences.some((exp) => {
    const poste = normalize(exp.poste);
    return stringSimilarity(poste, offreTitle) > 0.4;
  });

  if (hasRelevantExperience) {
    log("   → Expérience pertinente trouvée");
    return 70;
  }

  // Vérifier si le candidat a des compétences liées à l'offre
  const candidatSkills = new Set<string>();
  candidat.candidatCompetences.forEach((c) =>
    candidatSkills.add(normalize(c.competence))
  );
  candidat.experiences.forEach((exp) => {
    exp.experienceCompetences.forEach((c) =>
      candidatSkills.add(normalize(c.competence))
    );
  });

  const offreSkills = extractSkillsFromDescription(offre.description);
  const commonSkills = [...candidatSkills].filter((s) => offreSkills.has(s));

  if (commonSkills.length >= 2) {
    log(`   → ${commonSkills.length} compétences communes → domaine probable`);
    return 65;
  }

  // Aucune correspondance de domaine → 0%
  log("   ⚠️ Aucune correspondance de domaine → 0%");
  return 0;
}

/**
 * Calcule le score de disponibilité
 */
function calculateDisponibiliteScore(candidat: CandidatForMatching): number {
  const statut = normalize(candidat.statut);

  log("   Statut brut:", candidat.statut || "N/A");

  // Si pas de statut renseigné → 0%
  if (!statut) {
    log("   ⚠️ Statut non renseigné → 0%");
    return 0;
  }

  // Mapping exact des statuts définis dans l'UI
  const statutScores: Record<string, number> = {
    disponible: 100,
    "recherche-active": 100,
    "a-lecoute": 70,
    "preavis-1-mois": 85,
    "preavis-2-mois": 75,
    "preavis-3-mois": 65,
    "en-poste": 30,
    etudiant: 60,
  };

  // Vérifier d'abord les statuts exacts
  if (statutScores[statut]) {
    return statutScores[statut];
  }

  // Fallback pour les anciens formats
  if (
    statut.includes("disponible") ||
    statut.includes("recherche") ||
    statut.includes("actif")
  ) {
    return 100;
  }

  if (statut.includes("preavis") || statut.includes("bientot")) {
    return 80;
  }

  if (statut.includes("ecoute") || statut.includes("ouvert")) {
    return 70;
  }

  if (statut.includes("poste") || statut.includes("emploi")) {
    return 50;
  }

  return 60;
}

/**
 * Calcule le score de formations
 */
function calculateFormationScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): number {
  // Si AUCUNE donnée de formation → 0%
  if (
    candidat.formations.length === 0 &&
    candidat.niveauEtude.length === 0 &&
    candidat.certifications.length === 0
  ) {
    log("   ⚠️ Aucune formation/niveau/certification → 0%");
    return 0;
  }

  const requiredLevel = extractFormationLevel(offre.description);
  let score = 50;

  // Calculer le niveau du candidat
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

  // Comparer les niveaux
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
    // Pas de niveau requis, bonus pour formations
    score = 60 + candidatLevel * 5;
  }

  // Bonus pour certifications
  score += candidat.certifications.length * 5;

  return Math.min(100, score);
}

/**
 * Génère les points forts du match
 */
function generateHighlights(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching,
  scoreDetails: MatchResult["scoreDetails"],
  matchedCompetences: string[]
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
      `${Math.round(years)} an${years > 1 ? "s" : ""} d'expérience`
    );
  }

  if (candidat.certifications.length > 0) {
    highlights.push(
      `${candidat.certifications.length} certification${
        candidat.certifications.length > 1 ? "s" : ""
      }`
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

  return highlights.slice(0, 4); // Maximum 4 highlights
}

/**
 * Calcule le score global de matching entre un candidat et une offre
 */
export function calculateMatchScore(
  candidat: CandidatForMatching,
  offre: JobOfferForMatching
): MatchResult {
  log("\n" + "═".repeat(60));
  log(`🎯 MATCHING: ${candidat.prenom} ${candidat.nom} ↔ ${offre.title}`);
  log("═".repeat(60));

  // Calculer chaque score
  const competenceResult = calculateCompetenceScore(candidat, offre);

  log("\n📍 LOCALISATION:");
  log(`   Candidat: ${candidat.ville || "N/A"}, ${candidat.pays}`);
  log(`   Offre: ${offre.location || "N/A"}`);
  const localisationScore = calculateLocationScore(candidat, offre);
  log(`   → Score: ${Math.round(localisationScore)}%`);

  log("\n⏱️ EXPÉRIENCE:");
  const candidatYears = calculateTotalExperience(candidat);
  log(`   Candidat: ${Math.round(candidatYears * 10) / 10} ans`);
  const experienceScore = calculateExperienceScore(candidat, offre);
  log(`   → Score: ${Math.round(experienceScore)}%`);

  log("\n🏢 DOMAINE:");
  const domaineScore = calculateDomaineScore(candidat, offre);
  log(`   → Score: ${Math.round(domaineScore)}%`);

  log("\n📅 DISPONIBILITÉ:");
  log(`   Statut: ${candidat.statut || "N/A"}`);
  const disponibiliteScore = calculateDisponibiliteScore(candidat);
  log(`   → Score: ${Math.round(disponibiliteScore)}%`);

  log("\n🎓 FORMATIONS:");
  log(
    `   Formations: ${
      candidat.formations.map((f) => f.diplome).join(", ") || "N/A"
    }`
  );
  log(
    `   Niveau: ${candidat.niveauEtude.map((n) => n.nom).join(", ") || "N/A"}`
  );
  log(
    `   Certifications: ${
      candidat.certifications.map((c) => c.nom).join(", ") || "N/A"
    }`
  );
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

  // Calculer le score pondéré global
  const globalScore =
    (scoreDetails.competences * WEIGHTS.competences +
      scoreDetails.localisation * WEIGHTS.localisation +
      scoreDetails.experience * WEIGHTS.experience +
      scoreDetails.domaine * WEIGHTS.domaine +
      scoreDetails.disponibilite * WEIGHTS.disponibilite +
      scoreDetails.formations * WEIGHTS.formations) /
    100;

  log("\n📊 CALCUL SCORE GLOBAL:");
  log(
    `   Compétences: ${scoreDetails.competences}% × ${WEIGHTS.competences} = ${
      (scoreDetails.competences * WEIGHTS.competences) / 100
    }`
  );
  log(
    `   Localisation: ${scoreDetails.localisation}% × ${
      WEIGHTS.localisation
    } = ${(scoreDetails.localisation * WEIGHTS.localisation) / 100}`
  );
  log(
    `   Expérience: ${scoreDetails.experience}% × ${WEIGHTS.experience} = ${
      (scoreDetails.experience * WEIGHTS.experience) / 100
    }`
  );
  log(
    `   Domaine: ${scoreDetails.domaine}% × ${WEIGHTS.domaine} = ${
      (scoreDetails.domaine * WEIGHTS.domaine) / 100
    }`
  );
  log(
    `   Disponibilité: ${scoreDetails.disponibilite}% × ${
      WEIGHTS.disponibilite
    } = ${(scoreDetails.disponibilite * WEIGHTS.disponibilite) / 100}`
  );
  log(
    `   Formations: ${scoreDetails.formations}% × ${WEIGHTS.formations} = ${
      (scoreDetails.formations * WEIGHTS.formations) / 100
    }`
  );
  log(`   ─────────────────────────────`);
  log(`   🎯 SCORE FINAL: ${Math.round(globalScore)}%`);
  log("═".repeat(60) + "\n");

  const highlights = generateHighlights(
    candidat,
    offre,
    scoreDetails,
    competenceResult.matched
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

/**
 * Calcule les matchs pour une offre donnée et retourne les meilleurs candidats
 */
export function calculateMatches(
  candidats: CandidatForMatching[],
  offre: JobOfferForMatching,
  options: {
    minScore?: number;
    limit?: number;
  } = {}
): MatchResult[] {
  const { minScore = 30, limit = 50 } = options;

  const results = candidats
    .map((candidat) => calculateMatchScore(candidat, offre))
    .filter((result) => result.score >= minScore)
    // Tri stable : par score décroissant, puis par nom alphabétique pour les égalités
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // En cas d'égalité de score, trier par nom pour un ordre stable
      const nameA = `${a.candidat.nom} ${a.candidat.prenom}`.toLowerCase();
      const nameB = `${b.candidat.nom} ${b.candidat.prenom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    })
    .slice(0, limit);

  return results;
}

/**
 * Retourne la couleur associée au score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Retourne le badge de niveau de match
 */
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

/**
 * Extrait les compétences d'une description (utile pour debug/affichage)
 */
export function getExtractedSkills(description: string | null): string[] {
  return [...extractSkillsFromDescription(description)];
}

/**
 * Extrait l'expérience requise d'une description (utile pour debug/affichage)
 */
export function getExtractedExperience(description: string | null): {
  min: number;
  max: number;
} {
  return extractExperienceFromDescription(description);
}

// /**
//  * Système de Matching Candidat-Offre
//  *
//  * Algorithme de scoring pondéré pour trouver les meilleurs candidats
//  * pour une offre d'emploi donnée.
//  *
//  * Les informations critiques sont extraites de la description de l'offre.
//  */

// // Types pour le matching
// export interface CandidatForMatching {
//   id: string;
//   nom: string | null;
//   prenom: string | null;
//   image: string | null;
//   ville: string | null;
//   pays: string;
//   domaine: string | null;
//   statut: string | null;
//   bio: string | null;
//   linkedinUrl: string | null;
//   candidatCompetences: { competence: string }[];
//   competencesList: { nom: string; niveau: number; categorie: string }[];
//   experiences: {
//     poste: string;
//     entreprise: string;
//     typeContrat: string;
//     dateDebut: Date;
//     dateFin: Date | null;
//     experienceCompetences: { competence: string }[];
//   }[];
//   formations: {
//     diplome: string;
//     domaine: string;
//     etablissement: string;
//   }[];
//   niveauEtude: { nom: string }[];
//   certifications: { nom: string }[];
//   user: {
//     email: string;
//     name: string | null;
//   };
// }

// export interface JobOfferForMatching {
//   id: string;
//   title: string;
//   description: string | null;
//   company: string | null;
//   location: string | null;
//   type: string | null;
// }

// export interface MatchResult {
//   candidat: CandidatForMatching;
//   score: number;
//   scoreDetails: {
//     competences: number;
//     localisation: number;
//     experience: number;
//     domaine: number;
//     disponibilite: number;
//     formations: number;
//   };
//   matchedCompetences: string[];
//   missingCompetences: string[];
//   highlights: string[];
// }

// // Pondérations des critères (total = 100)
// const WEIGHTS = {
//   competences: 40,
//   localisation: 20,
//   experience: 20,
//   domaine: 10,
//   disponibilite: 5,
//   formations: 5,
// };

// // Liste de compétences techniques courantes à rechercher dans la description
// const COMMON_SKILLS = [
//   // Langages de programmation
//   "javascript",
//   "typescript",
//   "python",
//   "java",
//   "php",
//   "ruby",
//   "c++",
//   "c#",
//   "go",
//   "rust",
//   "swift",
//   "kotlin",
//   "scala",
//   "r",
//   // Frontend
//   "react",
//   "reactjs",
//   "react.js",
//   "vue",
//   "vuejs",
//   "vue.js",
//   "angular",
//   "angularjs",
//   "svelte",
//   "next",
//   "nextjs",
//   "next.js",
//   "nuxt",
//   "gatsby",
//   "html",
//   "html5",
//   "css",
//   "css3",
//   "sass",
//   "scss",
//   "less",
//   "tailwind",
//   "tailwindcss",
//   "bootstrap",
//   "material-ui",
//   "chakra",
//   // Backend
//   "node",
//   "nodejs",
//   "node.js",
//   "express",
//   "expressjs",
//   "nestjs",
//   "fastify",
//   "django",
//   "flask",
//   "fastapi",
//   "spring",
//   "springboot",
//   "laravel",
//   "symfony",
//   "rails",
//   "ruby on rails",
//   "asp.net",
//   ".net",
//   "dotnet",
//   // Bases de données
//   "sql",
//   "mysql",
//   "postgresql",
//   "postgres",
//   "mongodb",
//   "mongo",
//   "redis",
//   "elasticsearch",
//   "sqlite",
//   "oracle",
//   "mariadb",
//   "dynamodb",
//   "cassandra",
//   "couchdb",
//   "firebase",
//   "supabase",
//   "prisma",
//   // Cloud & DevOps
//   "aws",
//   "amazon web services",
//   "azure",
//   "gcp",
//   "google cloud",
//   "docker",
//   "kubernetes",
//   "k8s",
//   "terraform",
//   "ansible",
//   "jenkins",
//   "gitlab ci",
//   "github actions",
//   "circleci",
//   "nginx",
//   "apache",
//   "linux",
//   "ubuntu",
//   "debian",
//   // Mobile
//   "react native",
//   "flutter",
//   "ionic",
//   "xamarin",
//   "android",
//   "ios",
//   "mobile",
//   // Data & IA
//   "machine learning",
//   "ml",
//   "deep learning",
//   "tensorflow",
//   "pytorch",
//   "keras",
//   "scikit-learn",
//   "pandas",
//   "numpy",
//   "data science",
//   "data analysis",
//   "big data",
//   "hadoop",
//   "spark",
//   "tableau",
//   "power bi",
//   // Autres
//   "git",
//   "github",
//   "gitlab",
//   "bitbucket",
//   "jira",
//   "confluence",
//   "agile",
//   "scrum",
//   "kanban",
//   "rest",
//   "restful",
//   "api",
//   "graphql",
//   "websocket",
//   "microservices",
//   "ci/cd",
//   "testing",
//   "jest",
//   "mocha",
//   "cypress",
//   "selenium",
//   "unit test",
//   "tdd",
//   "figma",
//   "sketch",
//   "adobe xd",
//   "photoshop",
//   "illustrator",
//   // Soft skills
//   "communication",
//   "leadership",
//   "management",
//   "teamwork",
//   "problem solving",
//   // Métiers
//   "fullstack",
//   "full stack",
//   "full-stack",
//   "frontend",
//   "front-end",
//   "front end",
//   "backend",
//   "back-end",
//   "back end",
//   "devops",
//   "sre",
//   "data engineer",
//   "data scientist",
//   "product manager",
//   "scrum master",
//   "tech lead",
//   // Langues
//   "anglais",
//   "english",
//   "français",
//   "french",
//   "espagnol",
//   "spanish",
//   "allemand",
//   "german",
// ];

// // Patterns pour détecter les années d'expérience dans la description
// const EXPERIENCE_PATTERNS = [
//   /(\d+)\s*(?:à|a|-|–)\s*(\d+)\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
//   /(\d+)\s*\+?\s*(?:ans?|années?|years?)\s*(?:d['']?expérience|d['']?experience|experience)/gi,
//   /(?:expérience|experience)\s*(?:de\s*)?(\d+)\s*(?:à|a|-|–)?\s*(\d+)?\s*(?:ans?|années?|years?)/gi,
//   /(?:minimum|min\.?|au moins)\s*(\d+)\s*(?:ans?|années?|years?)/gi,
//   /(\d+)\s*(?:ans?|années?|years?)\s*(?:minimum|min\.?)/gi,
//   /junior|débutant|debutant|entry.?level/gi,
//   /confirmé|confirme|mid.?level|intermédiaire|intermediaire/gi,
//   /senior|expert|lead|principal|staff/gi,
// ];

// // Patterns pour détecter les formations requises
// const FORMATION_PATTERNS = [
//   /bac\s*\+\s*(\d+)/gi,
//   /master|maitrise|maîtrise/gi,
//   /licence|bachelor/gi,
//   /ingénieur|ingenieur|engineer/gi,
//   /doctorat|phd|doctorate/gi,
//   /bts|dut|deug/gi,
//   /diplôme|diplome|diploma/gi,
//   /formation|certified|certification/gi,
// ];

// /**
//  * Normalise une chaîne pour la comparaison
//  */
// function normalize(str: string | null | undefined): string {
//   if (!str) return "";
//   return str
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
//     .replace(/<[^>]*>/g, " ") // Supprime les balises HTML
//     .replace(/&nbsp;/g, " ")
//     .replace(/&amp;/g, "&")
//     .replace(/&lt;/g, "<")
//     .replace(/&gt;/g, ">")
//     .trim();
// }

// /**
//  * Extrait le texte brut d'une chaîne HTML
//  */
// function stripHtml(html: string | null | undefined): string {
//   if (!html) return "";
//   return html
//     .replace(/<[^>]*>/g, " ")
//     .replace(/&nbsp;/g, " ")
//     .replace(/&amp;/g, "&")
//     .replace(/&lt;/g, "<")
//     .replace(/&gt;/g, ">")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// /**
//  * Calcule la similarité entre deux chaînes (algorithme de Jaccard simplifié)
//  */
// function stringSimilarity(str1: string, str2: string): number {
//   const s1 = normalize(str1);
//   const s2 = normalize(str2);

//   if (!s1 || !s2) return 0;
//   if (s1 === s2) return 1;

//   // Vérifier si l'une contient l'autre
//   if (s1.includes(s2) || s2.includes(s1)) return 0.8;

//   // Calcul de similarité par mots communs
//   const words1 = new Set(s1.split(/\s+/));
//   const words2 = new Set(s2.split(/\s+/));

//   const intersection = new Set([...words1].filter((x) => words2.has(x)));
//   const union = new Set([...words1, ...words2]);

//   return intersection.size / union.size;
// }

// /**
//  * Extrait les compétences depuis la description de l'offre
//  */
// function extractSkillsFromDescription(description: string | null): Set<string> {
//   const skills = new Set<string>();
//   if (!description) return skills;

//   const normalizedDesc = normalize(stripHtml(description));

//   // Rechercher les compétences courantes dans la description
//   COMMON_SKILLS.forEach((skill) => {
//     const normalizedSkill = normalize(skill);
//     // Utiliser des word boundaries pour éviter les faux positifs
//     const regex = new RegExp(
//       `\\b${normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
//       "gi"
//     );
//     if (regex.test(normalizedDesc)) {
//       skills.add(normalizedSkill);
//     }
//   });

//   return skills;
// }

// /**
//  * Extrait les années d'expérience requises depuis la description
//  */
// function extractExperienceFromDescription(description: string | null): {
//   min: number;
//   max: number;
// } {
//   if (!description) return { min: 0, max: 99 };

//   const normalizedDesc = normalize(stripHtml(description));

//   // Chercher les patterns d'expérience
//   for (const pattern of EXPERIENCE_PATTERNS) {
//     const match = pattern.exec(normalizedDesc);
//     if (match) {
//       // Pattern "junior/débutant"
//       if (/junior|débutant|debutant|entry/i.test(match[0])) {
//         return { min: 0, max: 2 };
//       }
//       // Pattern "confirmé/mid-level"
//       if (/confirmé|confirme|mid|intermédiaire|intermediaire/i.test(match[0])) {
//         return { min: 3, max: 5 };
//       }
//       // Pattern "senior/expert"
//       if (/senior|expert|lead|principal|staff/i.test(match[0])) {
//         return { min: 5, max: 99 };
//       }
//       // Pattern avec nombres
//       if (match[1]) {
//         const min = parseInt(match[1]);
//         const max = match[2] ? parseInt(match[2]) : min + 2;
//         return { min, max };
//       }
//     }
//     pattern.lastIndex = 0; // Reset regex
//   }

//   return { min: 0, max: 99 }; // Pas de contrainte trouvée
// }

// /**
//  * Extrait le niveau de formation requis depuis la description
//  */
// function extractFormationLevel(description: string | null): number {
//   if (!description) return 0;

//   const normalizedDesc = normalize(stripHtml(description));

//   // Bac+X
//   const bacMatch = /bac\s*\+\s*(\d+)/i.exec(normalizedDesc);
//   if (bacMatch) {
//     return parseInt(bacMatch[1]);
//   }

//   // Autres niveaux
//   if (/doctorat|phd/i.test(normalizedDesc)) return 8;
//   if (/master|maitrise|maîtrise/i.test(normalizedDesc)) return 5;
//   if (/ingénieur|ingenieur|engineer/i.test(normalizedDesc)) return 5;
//   if (/licence|bachelor/i.test(normalizedDesc)) return 3;
//   if (/bts|dut/i.test(normalizedDesc)) return 2;

//   return 0;
// }

// /**
//  * Calcule le score de correspondance des compétences
//  */
// function calculateCompetenceScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): { score: number; matched: string[]; missing: string[] } {
//   // Collecter toutes les compétences du candidat
//   const candidatCompetences = new Set<string>();

//   // Compétences directes
//   candidat.candidatCompetences.forEach((c) =>
//     candidatCompetences.add(normalize(c.competence))
//   );

//   // Compétences de la liste
//   //   candidat.competencesList.forEach((c) =>
//   //     candidatCompetences.add(normalize(c.nom))
//   //   );

//   // Compétences des expériences
//   candidat.experiences.forEach((exp) => {
//     exp.experienceCompetences.forEach((c) =>
//       candidatCompetences.add(normalize(c.competence))
//     );
//     // Ajouter aussi les mots-clés du poste
//     const posteNormalized = normalize(exp.poste);
//     COMMON_SKILLS.forEach((skill) => {
//       if (posteNormalized.includes(normalize(skill))) {
//         candidatCompetences.add(normalize(skill));
//       }
//     });
//   });

//   // Extraire les compétences de la bio du candidat
//   if (candidat.bio) {
//     const bioSkills = extractSkillsFromDescription(candidat.bio);
//     bioSkills.forEach((skill) => candidatCompetences.add(skill));
//   }

//   // Compétences requises extraites de la description de l'offre
//   const offreCompetences = extractSkillsFromDescription(offre.description);

//   // Ajouter les compétences du titre de l'offre
//   const titleSkills = extractSkillsFromDescription(offre.title);
//   titleSkills.forEach((skill) => offreCompetences.add(skill));

//   if (offreCompetences.size === 0) {
//     return { score: 50, matched: [], missing: [] }; // Score neutre si pas de compétences détectées
//   }

//   // Calculer les correspondances
//   const matched: string[] = [];
//   const missing: string[] = [];

//   offreCompetences.forEach((requiredSkill) => {
//     let found = false;

//     candidatCompetences.forEach((candidatSkill) => {
//       if (
//         candidatSkill === requiredSkill ||
//         candidatSkill.includes(requiredSkill) ||
//         requiredSkill.includes(candidatSkill) ||
//         stringSimilarity(candidatSkill, requiredSkill) > 0.7
//       ) {
//         found = true;
//       }
//     });

//     if (found) {
//       matched.push(requiredSkill);
//     } else {
//       missing.push(requiredSkill);
//     }
//   });

//   const score = (matched.length / offreCompetences.size) * 100;

//   return {
//     score,
//     matched: [...new Set(matched)],
//     missing: [...new Set(missing)],
//   };
// }

// /**
//  * Calcule le score de localisation
//  */
// function calculateLocationScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): number {
//   if (!offre.location) return 100; // Pas de contrainte de localisation

//   const offreLocation = normalize(offre.location);
//   const candidatVille = normalize(candidat.ville);
//   const candidatPays = normalize(candidat.pays);

//   // Correspondance exacte ville
//   if (candidatVille && offreLocation.includes(candidatVille)) {
//     return 100;
//   }

//   // Correspondance pays
//   if (candidatPays && offreLocation.includes(candidatPays)) {
//     return 70;
//   }

//   // Télétravail possible (chercher dans location et description)
//   const descNormalized = normalize(stripHtml(offre.description));
//   if (
//     offreLocation.includes("remote") ||
//     offreLocation.includes("teletravail") ||
//     offreLocation.includes("distance") ||
//     descNormalized.includes("teletravail") ||
//     descNormalized.includes("remote") ||
//     descNormalized.includes("a distance")
//   ) {
//     return 90;
//   }

//   // Similarité partielle
//   const similarity = stringSimilarity(
//     candidatVille || candidatPays,
//     offreLocation
//   );
//   return similarity * 100;
// }

// /**
//  * Calcule les années d'expérience du candidat
//  */
// function calculateTotalExperience(candidat: CandidatForMatching): number {
//   let totalMonths = 0;

//   candidat.experiences.forEach((exp) => {
//     const start = new Date(exp.dateDebut);
//     const end = exp.dateFin ? new Date(exp.dateFin) : new Date();
//     const months =
//       (end.getFullYear() - start.getFullYear()) * 12 +
//       (end.getMonth() - start.getMonth());
//     totalMonths += Math.max(0, months);
//   });

//   return totalMonths / 12; // Retourne en années
// }

// /**
//  * Calcule le score d'expérience
//  */
// function calculateExperienceScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): number {
//   const candidatYears = calculateTotalExperience(candidat);

//   // Extraire les années requises de la description
//   const { min: requiredMin, max: requiredMax } =
//     extractExperienceFromDescription(offre.description);

//   if (requiredMin === 0 && requiredMax === 99) {
//     return 80; // Pas de contrainte claire
//   }

//   // Score basé sur la correspondance
//   if (candidatYears >= requiredMin && candidatYears <= requiredMax) {
//     return 100;
//   } else if (
//     candidatYears >= requiredMin - 1 &&
//     candidatYears <= requiredMax + 2
//   ) {
//     return 80;
//   } else if (candidatYears >= requiredMin - 2) {
//     return 60;
//   } else if (candidatYears > requiredMax) {
//     return 70; // Surqualifié mais acceptable
//   }

//   return 30;
// }

// /**
//  * Calcule le score de correspondance de domaine
//  */
// function calculateDomaineScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): number {
//   const candidatDomaine = normalize(candidat.domaine);
//   const offreTitle = normalize(offre.title);
//   const offreDescription = normalize(stripHtml(offre.description));

//   if (!candidatDomaine) return 50;

//   // Vérifier dans le titre et la description
//   if (
//     offreTitle.includes(candidatDomaine) ||
//     candidatDomaine.includes(offreTitle.split(" ")[0])
//   ) {
//     return 100;
//   }

//   if (offreDescription && offreDescription.includes(candidatDomaine)) {
//     return 80;
//   }

//   // Vérifier les expériences dans le même domaine
//   const hasRelevantExperience = candidat.experiences.some((exp) => {
//     const poste = normalize(exp.poste);
//     return (
//       poste.includes(candidatDomaine) ||
//       stringSimilarity(poste, offreTitle) > 0.5
//     );
//   });

//   if (hasRelevantExperience) {
//     return 70;
//   }

//   return 40;
// }

// /**
//  * Calcule le score de disponibilité
//  */
// function calculateDisponibiliteScore(candidat: CandidatForMatching): number {
//   const statut = normalize(candidat.statut);

//   if (!statut) return 50;

//   if (
//     statut.includes("disponible") ||
//     statut.includes("recherche") ||
//     statut.includes("actif")
//   ) {
//     return 100;
//   }

//   if (statut.includes("preavis") || statut.includes("bientot")) {
//     return 80;
//   }

//   if (statut.includes("ecoute") || statut.includes("ouvert")) {
//     return 70;
//   }

//   if (statut.includes("poste") || statut.includes("emploi")) {
//     return 50;
//   }

//   return 60;
// }

// /**
//  * Calcule le score de formations
//  */
// function calculateFormationScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): number {
//   if (candidat.formations.length === 0 && candidat.niveauEtude.length === 0) {
//     return 40;
//   }

//   const requiredLevel = extractFormationLevel(offre.description);
//   let score = 50;

//   // Calculer le niveau du candidat
//   let candidatLevel = 0;

//   candidat.formations.forEach((formation) => {
//     const diplome = normalize(formation.diplome);

//     if (diplome.includes("doctorat") || diplome.includes("phd")) {
//       candidatLevel = Math.max(candidatLevel, 8);
//     } else if (diplome.includes("master") || diplome.includes("ingenieur")) {
//       candidatLevel = Math.max(candidatLevel, 5);
//     } else if (diplome.includes("licence") || diplome.includes("bachelor")) {
//       candidatLevel = Math.max(candidatLevel, 3);
//     } else if (diplome.includes("bts") || diplome.includes("dut")) {
//       candidatLevel = Math.max(candidatLevel, 2);
//     }
//   });

//   candidat.niveauEtude.forEach((niveau) => {
//     const bacMatch = /bac\s*\+?\s*(\d+)/i.exec(niveau.nom);
//     if (bacMatch) {
//       candidatLevel = Math.max(candidatLevel, parseInt(bacMatch[1]));
//     }
//   });

//   // Comparer les niveaux
//   if (requiredLevel > 0) {
//     if (candidatLevel >= requiredLevel) {
//       score = 100;
//     } else if (candidatLevel >= requiredLevel - 1) {
//       score = 80;
//     } else if (candidatLevel >= requiredLevel - 2) {
//       score = 60;
//     } else {
//       score = 40;
//     }
//   } else {
//     // Pas de niveau requis, bonus pour formations
//     score = 60 + candidatLevel * 5;
//   }

//   // Bonus pour certifications
//   score += candidat.certifications.length * 5;

//   return Math.min(100, score);
// }

// /**
//  * Génère les points forts du match
//  */
// function generateHighlights(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching,
//   scoreDetails: MatchResult["scoreDetails"],
//   matchedCompetences: string[]
// ): string[] {
//   const highlights: string[] = [];

//   if (scoreDetails.competences >= 80 && matchedCompetences.length > 0) {
//     highlights.push(`${matchedCompetences.length} compétences correspondantes`);
//   }

//   if (scoreDetails.localisation >= 90) {
//     highlights.push("Localisation idéale");
//   }

//   const years = calculateTotalExperience(candidat);
//   if (years > 0) {
//     highlights.push(
//       `${Math.round(years)} an${years > 1 ? "s" : ""} d'expérience`
//     );
//   }

//   if (candidat.certifications.length > 0) {
//     highlights.push(
//       `${candidat.certifications.length} certification${
//         candidat.certifications.length > 1 ? "s" : ""
//       }`
//     );
//   }

//   if (scoreDetails.disponibilite >= 90) {
//     highlights.push("Disponible immédiatement");
//   }

//   if (candidat.linkedinUrl) {
//     highlights.push("Profil LinkedIn");
//   }

//   if (candidat.formations.length > 0) {
//     const topFormation = candidat.formations[0];
//     if (topFormation.diplome) {
//       highlights.push(topFormation.diplome);
//     }
//   }

//   return highlights.slice(0, 4); // Maximum 4 highlights
// }

// /**
//  * Calcule le score global de matching entre un candidat et une offre
//  */
// export function calculateMatchScore(
//   candidat: CandidatForMatching,
//   offre: JobOfferForMatching
// ): MatchResult {
//   // Calculer chaque score
//   const competenceResult = calculateCompetenceScore(candidat, offre);
//   const localisationScore = calculateLocationScore(candidat, offre);
//   const experienceScore = calculateExperienceScore(candidat, offre);
//   const domaineScore = calculateDomaineScore(candidat, offre);
//   const disponibiliteScore = calculateDisponibiliteScore(candidat);
//   const formationScore = calculateFormationScore(candidat, offre);

//   const scoreDetails = {
//     competences: Math.round(competenceResult.score),
//     localisation: Math.round(localisationScore),
//     experience: Math.round(experienceScore),
//     domaine: Math.round(domaineScore),
//     disponibilite: Math.round(disponibiliteScore),
//     formations: Math.round(formationScore),
//   };

//   // Calculer le score pondéré global
//   const globalScore =
//     (scoreDetails.competences * WEIGHTS.competences +
//       scoreDetails.localisation * WEIGHTS.localisation +
//       scoreDetails.experience * WEIGHTS.experience +
//       scoreDetails.domaine * WEIGHTS.domaine +
//       scoreDetails.disponibilite * WEIGHTS.disponibilite +
//       scoreDetails.formations * WEIGHTS.formations) /
//     100;

//   const highlights = generateHighlights(
//     candidat,
//     offre,
//     scoreDetails,
//     competenceResult.matched
//   );

//   return {
//     candidat,
//     score: Math.round(globalScore),
//     scoreDetails,
//     matchedCompetences: competenceResult.matched,
//     missingCompetences: competenceResult.missing,
//     highlights,
//   };
// }

// /**
//  * Calcule les matchs pour une offre donnée et retourne les meilleurs candidats
//  */
// export function calculateMatches(
//   candidats: CandidatForMatching[],
//   offre: JobOfferForMatching,
//   options: {
//     minScore?: number;
//     limit?: number;
//   } = {}
// ): MatchResult[] {
//   const { minScore = 30, limit = 50 } = options;

//   const results = candidats
//     .map((candidat) => calculateMatchScore(candidat, offre))
//     .filter((result) => result.score >= minScore)
//     .sort((a, b) => b.score - a.score)
//     .slice(0, limit);

//   return results;
// }

// /**
//  * Retourne la couleur associée au score
//  */
// export function getScoreColor(score: number): string {
//   if (score >= 80) return "text-green-600";
//   if (score >= 60) return "text-blue-600";
//   if (score >= 40) return "text-yellow-600";
//   return "text-red-600";
// }

// /**
//  * Retourne le badge de niveau de match
//  */
// export function getMatchLevel(score: number): {
//   label: string;
//   color: string;
//   bgColor: string;
// } {
//   if (score >= 85) {
//     return {
//       label: "Excellent",
//       color: "text-green-700",
//       bgColor: "bg-green-100",
//     };
//   }
//   if (score >= 70) {
//     return {
//       label: "Très bon",
//       color: "text-blue-700",
//       bgColor: "bg-blue-100",
//     };
//   }
//   if (score >= 55) {
//     return { label: "Bon", color: "text-yellow-700", bgColor: "bg-yellow-100" };
//   }
//   if (score >= 40) {
//     return {
//       label: "Moyen",
//       color: "text-orange-700",
//       bgColor: "bg-orange-100",
//     };
//   }
//   return { label: "Faible", color: "text-red-700", bgColor: "bg-red-100" };
// }

// /**
//  * Extrait les compétences d'une description (utile pour debug/affichage)
//  */
// export function getExtractedSkills(description: string | null): string[] {
//   return [...extractSkillsFromDescription(description)];
// }

// /**
//  * Extrait l'expérience requise d'une description (utile pour debug/affichage)
//  */
// export function getExtractedExperience(description: string | null): {
//   min: number;
//   max: number;
// } {
//   return extractExperienceFromDescription(description);
// }
