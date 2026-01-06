/**
 * Script de test pour le système de matching
 *
 * Exécuter avec: pnpm exec tsx scripts/test-matching.ts
 * ou npx tsx scripts/test-matching.ts
 */

import {
  calculateMatchScore,
  calculateMatches,
  getExtractedSkills,
  getExtractedExperience,
  getScoreColor,
  getMatchLevel,
  type CandidatForMatching,
  type JobOfferForMatching,
} from "../lib/matching/scoring";

// ========== DONNÉES DE TEST ==========

// Offre d'emploi de test avec description riche
const offreTest: JobOfferForMatching = {
  id: "offre-test-1",
  title: "Développeur Full Stack React / Node.js",
  description: `
    <h2>À propos du poste</h2>
    <p>Nous recherchons un <strong>Développeur Full Stack</strong> passionné avec 3-5 ans d'expérience 
    pour rejoindre notre équipe technique.</p>
    
    <h3>Compétences requises</h3>
    <ul>
      <li>Maîtrise de <strong>React</strong> et <strong>TypeScript</strong></li>
      <li>Expérience avec <strong>Node.js</strong> et <strong>Express</strong></li>
      <li>Connaissance de <strong>PostgreSQL</strong> ou <strong>MySQL</strong></li>
      <li><strong>Docker</strong> et notions de CI/CD</li>
      <li>Git et méthodologies Agile/Scrum</li>
    </ul>
    
    <h3>Nice to have</h3>
    <ul>
      <li>Expérience avec Next.js</li>
      <li>Connaissance de AWS ou GCP</li>
      <li>Tests unitaires avec Jest</li>
    </ul>
    
    <h3>Formation</h3>
    <p>Bac+5 en informatique ou équivalent</p>
    
    <h3>Conditions</h3>
    <p>Télétravail partiel possible. Anglais professionnel requis.</p>
  `,
  company: "TechCorp",
  location: "Paris, France",
  type: "CDI",
};

// Candidats de test avec différents profils
const candidatsTest: CandidatForMatching[] = [
  // Candidat 1: Excellent match
  {
    id: "candidat-1",
    nom: "Dupont",
    prenom: "Jean",
    image: null,
    ville: "Paris",
    pays: "France",
    domaine: "Développement Web",
    statut: "En recherche active",
    bio: "Développeur passionné spécialisé en React et Node.js. J'aime créer des applications performantes et scalables.",
    linkedinUrl: "https://linkedin.com/in/jeandupont",
    candidatCompetences: [
      { competence: "React" },
      { competence: "TypeScript" },
      { competence: "Node.js" },
      { competence: "PostgreSQL" },
      { competence: "Docker" },
      { competence: "Git" },
    ],
    competencesList: [
      { nom: "JavaScript", niveau: 5, categorie: "Frontend" },
      { nom: "React", niveau: 5, categorie: "Frontend" },
      { nom: "Node.js", niveau: 4, categorie: "Backend" },
    ],
    experiences: [
      {
        poste: "Développeur Full Stack",
        entreprise: "StartupXYZ",
        typeContrat: "CDI",
        dateDebut: new Date("2020-01-01"),
        dateFin: null,
        experienceCompetences: [
          { competence: "React" },
          { competence: "Express" },
          { competence: "MySQL" },
        ],
      },
      {
        poste: "Développeur Frontend Junior",
        entreprise: "AgenceWeb",
        typeContrat: "CDI",
        dateDebut: new Date("2018-06-01"),
        dateFin: new Date("2019-12-31"),
        experienceCompetences: [
          { competence: "JavaScript" },
          { competence: "HTML/CSS" },
        ],
      },
    ],
    formations: [
      {
        diplome: "Master Informatique",
        domaine: "Génie Logiciel",
        etablissement: "Université Paris-Saclay",
      },
    ],
    niveauEtude: [{ nom: "Bac+5" }],
    certifications: [{ nom: "AWS Certified Developer" }],
    user: {
      email: "jean.dupont@email.com",
      name: "Jean Dupont",
    },
  },

  // Candidat 2: Bon match mais moins d'expérience
  {
    id: "candidat-2",
    nom: "Martin",
    prenom: "Sophie",
    image: null,
    ville: "Lyon",
    pays: "France",
    domaine: "Développement Web",
    statut: "À l'écoute d'opportunités",
    bio: "Jeune développeuse passionnée par le JavaScript et les nouvelles technologies.",
    linkedinUrl: null,
    candidatCompetences: [
      { competence: "JavaScript" },
      { competence: "React" },
      { competence: "Node.js" },
    ],
    competencesList: [
      { nom: "React", niveau: 4, categorie: "Frontend" },
      { nom: "CSS", niveau: 4, categorie: "Frontend" },
    ],
    experiences: [
      {
        poste: "Développeuse Web Junior",
        entreprise: "WebAgency",
        typeContrat: "CDI",
        dateDebut: new Date("2022-09-01"),
        dateFin: null,
        experienceCompetences: [
          { competence: "React" },
          { competence: "Tailwind" },
        ],
      },
    ],
    formations: [
      {
        diplome: "Licence Informatique",
        domaine: "Développement",
        etablissement: "Université Lyon 1",
      },
    ],
    niveauEtude: [{ nom: "Bac+3" }],
    certifications: [],
    user: {
      email: "sophie.martin@email.com",
      name: "Sophie Martin",
    },
  },

  // Candidat 3: Profil data/backend, match moyen
  {
    id: "candidat-3",
    nom: "Bernard",
    prenom: "Pierre",
    image: null,
    ville: "Bordeaux",
    pays: "France",
    domaine: "Data Engineering",
    statut: "En poste",
    bio: "Data Engineer avec expertise Python et Big Data. Passionné par l'analyse de données.",
    linkedinUrl: "https://linkedin.com/in/pierrebernard",
    candidatCompetences: [
      { competence: "Python" },
      { competence: "SQL" },
      { competence: "Spark" },
      { competence: "AWS" },
    ],
    competencesList: [
      { nom: "Python", niveau: 5, categorie: "Backend" },
      { nom: "PostgreSQL", niveau: 4, categorie: "Database" },
    ],
    experiences: [
      {
        poste: "Data Engineer",
        entreprise: "DataCorp",
        typeContrat: "CDI",
        dateDebut: new Date("2019-03-01"),
        dateFin: null,
        experienceCompetences: [
          { competence: "Python" },
          { competence: "PostgreSQL" },
          { competence: "Docker" },
        ],
      },
    ],
    formations: [
      {
        diplome: "Ingénieur",
        domaine: "Data Science",
        etablissement: "École Centrale",
      },
    ],
    niveauEtude: [{ nom: "Bac+5" }],
    certifications: [{ nom: "GCP Professional Data Engineer" }],
    user: {
      email: "pierre.bernard@email.com",
      name: "Pierre Bernard",
    },
  },

  // Candidat 4: Profil senior surqualifié
  {
    id: "candidat-4",
    nom: "Leroy",
    prenom: "Marc",
    image: null,
    ville: "Paris",
    pays: "France",
    domaine: "Architecture logicielle",
    statut: "Disponible immédiatement",
    bio: "Tech Lead / Architecte avec 10+ ans d'expérience. Expert React, Node.js et Cloud.",
    linkedinUrl: "https://linkedin.com/in/marcleroy",
    candidatCompetences: [
      { competence: "React" },
      { competence: "TypeScript" },
      { competence: "Node.js" },
      { competence: "AWS" },
      { competence: "Docker" },
      { competence: "Kubernetes" },
      { competence: "PostgreSQL" },
      { competence: "MongoDB" },
    ],
    competencesList: [
      { nom: "Architecture", niveau: 5, categorie: "Autre" },
      { nom: "React", niveau: 5, categorie: "Frontend" },
      { nom: "Node.js", niveau: 5, categorie: "Backend" },
    ],
    experiences: [
      {
        poste: "Tech Lead",
        entreprise: "BigTech",
        typeContrat: "CDI",
        dateDebut: new Date("2018-01-01"),
        dateFin: null,
        experienceCompetences: [
          { competence: "React" },
          { competence: "TypeScript" },
          { competence: "AWS" },
        ],
      },
      {
        poste: "Senior Developer",
        entreprise: "StartupABC",
        typeContrat: "CDI",
        dateDebut: new Date("2014-06-01"),
        dateFin: new Date("2017-12-31"),
        experienceCompetences: [
          { competence: "Node.js" },
          { competence: "Express" },
        ],
      },
    ],
    formations: [
      {
        diplome: "Ingénieur Informatique",
        domaine: "Génie Logiciel",
        etablissement: "EPITA",
      },
    ],
    niveauEtude: [{ nom: "Bac+5" }],
    certifications: [
      { nom: "AWS Solutions Architect" },
      { nom: "Kubernetes Administrator" },
    ],
    user: {
      email: "marc.leroy@email.com",
      name: "Marc Leroy",
    },
  },

  // Candidat 5: Profil mobile, faible match
  {
    id: "candidat-5",
    nom: "Petit",
    prenom: "Julie",
    image: null,
    ville: "Marseille",
    pays: "France",
    domaine: "Développement Mobile",
    statut: "En recherche",
    bio: "Développeuse mobile iOS/Android. Passionnée par les apps et le design.",
    linkedinUrl: null,
    candidatCompetences: [
      { competence: "Swift" },
      { competence: "Kotlin" },
      { competence: "Flutter" },
      { competence: "Firebase" },
    ],
    competencesList: [
      { nom: "iOS", niveau: 5, categorie: "Mobile" },
      { nom: "Android", niveau: 4, categorie: "Mobile" },
    ],
    experiences: [
      {
        poste: "Développeuse Mobile",
        entreprise: "AppStudio",
        typeContrat: "CDI",
        dateDebut: new Date("2021-01-01"),
        dateFin: null,
        experienceCompetences: [
          { competence: "Flutter" },
          { competence: "Dart" },
        ],
      },
    ],
    formations: [
      {
        diplome: "BTS Informatique",
        domaine: "Développement",
        etablissement: "Lycée Technologique",
      },
    ],
    niveauEtude: [{ nom: "Bac+2" }],
    certifications: [],
    user: {
      email: "julie.petit@email.com",
      name: "Julie Petit",
    },
  },
];

// ========== TESTS ==========

console.log("🧪 TEST DU SYSTÈME DE MATCHING\n");
console.log("=".repeat(60));

// Test 1: Extraction des compétences de la description
console.log("\n📋 TEST 1: Extraction des compétences de la description\n");
const extractedSkills = getExtractedSkills(offreTest.description);
console.log("Compétences détectées:", extractedSkills);
console.log(`Total: ${extractedSkills.length} compétences\n`);

// Test 2: Extraction de l'expérience requise
console.log("⏱️  TEST 2: Extraction de l'expérience requise\n");
const extractedExp = getExtractedExperience(offreTest.description);
console.log(
  `Expérience requise: ${extractedExp.min}-${extractedExp.max} ans\n`
);

// Test 3: Calcul du score pour chaque candidat
console.log("=".repeat(60));
console.log("\n🎯 TEST 3: Matching des candidats\n");
console.log(`Offre: ${offreTest.title}`);
console.log(`Entreprise: ${offreTest.company}`);
console.log(`Localisation: ${offreTest.location}\n`);
console.log("-".repeat(60));

candidatsTest.forEach((candidat, index) => {
  const result = calculateMatchScore(candidat, offreTest);
  const matchLevel = getMatchLevel(result.score);

  console.log(`\n👤 Candidat ${index + 1}: ${candidat.prenom} ${candidat.nom}`);
  console.log(`   📍 ${candidat.ville}, ${candidat.pays}`);
  console.log(`   💼 ${candidat.domaine}`);
  console.log(`   📊 Statut: ${candidat.statut}`);
  console.log("");
  console.log(`   🎯 SCORE GLOBAL: ${result.score}% (${matchLevel.label})`);
  console.log("   📈 Détails:");
  console.log(`      - Compétences: ${result.scoreDetails.competences}%`);
  console.log(`      - Localisation: ${result.scoreDetails.localisation}%`);
  console.log(`      - Expérience: ${result.scoreDetails.experience}%`);
  console.log(`      - Domaine: ${result.scoreDetails.domaine}%`);
  console.log(`      - Disponibilité: ${result.scoreDetails.disponibilite}%`);
  console.log(`      - Formations: ${result.scoreDetails.formations}%`);
  console.log("");
  console.log(
    `   ✅ Compétences matchées: ${
      result.matchedCompetences.join(", ") || "Aucune"
    }`
  );
  console.log(
    `   ❌ Compétences manquantes: ${
      result.missingCompetences.join(", ") || "Aucune"
    }`
  );
  console.log(
    `   ⭐ Points forts: ${result.highlights.join(" | ") || "Aucun"}`
  );
  console.log("-".repeat(60));
});

// Test 4: Classement global
console.log("\n🏆 TEST 4: Classement des meilleurs candidats\n");
const matches = calculateMatches(candidatsTest, offreTest, {
  minScore: 0,
  limit: 10,
});

console.log("Classement par score décroissant:\n");
matches.forEach((match, index) => {
  const level = getMatchLevel(match.score);
  console.log(
    `${index + 1}. ${match.candidat.prenom} ${match.candidat.nom} - ${
      match.score
    }% (${level.label})`
  );
});

// Test 5: Filtrage par score minimum
console.log("\n🔍 TEST 5: Filtrage par score minimum (≥50%)\n");
const filteredMatches = calculateMatches(candidatsTest, offreTest, {
  minScore: 50,
  limit: 10,
});

console.log(`${filteredMatches.length} candidat(s) avec score ≥ 50%:\n`);
filteredMatches.forEach((match) => {
  console.log(
    `- ${match.candidat.prenom} ${match.candidat.nom}: ${match.score}%`
  );
});

console.log("\n" + "=".repeat(60));
console.log("✅ TESTS TERMINÉS");
console.log("=".repeat(60));
