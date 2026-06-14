/**
 * Seed de données de test — YLSIX
 * Usage : npm run seed:test
 * Cible : recruteur r225@gmail.com (ID fixe ci-dessous)
 */
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../app/generated/prisma";
import { randomBytes } from "crypto";

if (process.env.NODE_ENV === "production") {
  console.error("❌ Ne jamais exécuter le seed en production !");
  process.exit(1);
}

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "recruteur",
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

const RECRUTEUR_ID = "cmq6kw7z20000gak2a66gemzc"; // r225@gmail.com / asaaw

// ── Helpers ────────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function cuid(): string { return `c${randomBytes(11).toString("hex")}`; }
function daysFromNow(n: number): Date { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function daysAgo(n: number): Date { return daysFromNow(-n); }

// ── Data africaine réaliste ────────────────────────────────────────────────────
const PRENOMS_M = ["Moussa", "Ibrahim", "Kofi", "Seydou", "Mamadou", "Aboubacar", "Youssouf", "Cheick", "Issa", "Souleymane", "Adama", "Oumar"];
const PRENOMS_F = ["Fatou", "Aminata", "Mariam", "Aicha", "Kadiatou", "Fatoumata", "Bintou", "Hawa", "Rokia", "Oumou", "Ndeye", "Astou"];
const NOMS = ["Diallo", "Konaté", "Traoré", "Coulibaly", "Touré", "Diarra", "Keita", "Camara", "Bah", "Sow", "Sy", "Cissé", "Ouédraogo", "Sawadogo"];
const VILLES = ["Abidjan", "Dakar", "Bamako", "Ouagadougou", "Conakry", "Lomé", "Cotonou", "Abuja", "Accra", "Douala"];
const DOMAINES = ["Informatique", "Finance", "Marketing", "RH", "Logistique", "Commercial", "Comptabilité", "Droit", "Santé", "Éducation"];
const COMPETENCES = [
  ["JavaScript", "React", "Node.js"],
  ["Python", "Django", "PostgreSQL"],
  ["Java", "Spring Boot", "MySQL"],
  ["Comptabilité", "Excel", "SAP"],
  ["Marketing digital", "SEO", "Google Ads"],
  ["RH", "Recrutement", "SIRH"],
  ["Vente", "Négociation", "CRM"],
  ["Logistique", "Supply Chain", "ERP"],
  ["Communication", "Relations publiques", "Rédaction"],
  ["Finance", "Audit", "Contrôle de gestion"],
];
const BIOS = [
  "Professionnel passionné avec plus de 5 ans d'expérience dans mon domaine. Je cherche à rejoindre une équipe dynamique pour relever de nouveaux défis.",
  "Diplômé de l'ISCAE avec une solide expérience en entreprise. Orienté résultats et toujours prêt à m'adapter à de nouveaux environnements.",
  "Expert technique avec une forte capacité d'analyse. J'ai contribué à plusieurs projets d'envergure nationale et sous-régionale.",
  "Jeune professionnel ambitieux, ouvert aux opportunités d'évolution dans un contexte panafricain. Fort de 3 ans d'expérience terrain.",
  "Manager opérationnel avec une expertise reconnue. Habitué à gérer des équipes multiculturelles et des projets complexes.",
];

// ── Job offers réalistes (pour màj + nouvelles en brouillon) ───────────────────
const OFFRES_DATA = [
  {
    id: "cmq6l8tsd0003gak270pgmio8",
    title: "Développeur Full Stack JavaScript",
    description: "Nous recherchons un développeur Full Stack pour rejoindre notre équipe tech à Abidjan. Vous travaillerez sur notre plateforme RH panafricaine en pleine croissance.\n\nVos missions :\n- Développement de nouvelles fonctionnalités (Next.js, Node.js)\n- Maintenance et amélioration de l'existant\n- Participation aux revues de code et au sprint planning\n- Collaboration avec les équipes design et produit\n\nProfil recherché :\n• 3+ ans d'expérience en développement web\n• Maîtrise de React/Next.js et Node.js\n• Connaissance de TypeScript et des bases de données SQL",
    location: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaryMin: 400000,
    salaryMax: 700000,
    salaryCurrency: "XOF",
    etat: "active",
    duedate: daysFromNow(45),
  },
  {
    id: "cmq6l9fdq0004gak258majb0x",
    title: "Responsable Ressources Humaines",
    description: "Dans le cadre de notre expansion, nous recrutons un(e) Responsable RH pour piloter notre stratégie humaine. Vous serez le partenaire RH de la direction générale.\n\nVos missions :\n- Gestion du cycle de vie des collaborateurs (recrutement à offboarding)\n- Mise en place de la politique de formation\n- Suivi des indicateurs RH et reporting mensuel\n- Animation des relations sociales\n\nProfil recherché :\n• Bac+4/5 en GRH ou équivalent\n• 4+ ans d'expérience en RH opérationnel\n• Connaissance du droit du travail ivoirien",
    location: "Dakar, Sénégal",
    type: "CDI",
    salaryMin: 350000,
    salaryMax: 550000,
    salaryCurrency: "XOF",
    etat: "active",
    duedate: daysFromNow(30),
  },
];

// ── Candidats ─────────────────────────────────────────────────────────────────
function makeCandidats() {
  const candidats = [];
  for (let i = 0; i < 15; i++) {
    const isFemale = i % 3 === 0;
    const prenom = isFemale ? pick(PRENOMS_F) : pick(PRENOMS_M);
    const nom = pick(NOMS);
    const ville = pick(VILLES);
    const domaine = pick(DOMAINES);
    const userId = cuid();
    const candidatId = cuid();
    candidats.push({
      userId,
      candidatId,
      prenom,
      nom,
      email: `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@gmail.com`,
      password: "$2b$10$fixedHashForTestOnly.fixedHashForTestOnly",
      ville,
      pays: "Côte d'Ivoire",
      domaine,
      bio: pick(BIOS),
      dateNaissance: new Date(1990 + (i % 10), i % 12, (i % 28) + 1),
      competences: COMPETENCES[i % COMPETENCES.length],
      anneesExp: 2 + (i % 8),
    });
  }
  return candidats;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Démarrage du seed de données de test YLSIX...\n");

  // 1. Vérifier que le recruteur existe
  const recruteur = await prisma.recruteur.findUnique({ where: { id: RECRUTEUR_ID } });
  if (!recruteur) {
    console.error(`❌ Recruteur ${RECRUTEUR_ID} introuvable. Avez-vous bien créé le compte r225@gmail.com ?`);
    process.exit(1);
  }
  console.log(`✅ Recruteur trouvé : ${recruteur.companyName || recruteur.email}`);

  // 2. Activer un abonnement PME pour pouvoir tester toutes les features
  await prisma.abonnement.upsert({
    where: { recruteurId: RECRUTEUR_ID },
    create: {
      recruteurId: RECRUTEUR_ID,
      plan: "PME",
      statut: "ACTIF",
      dateDebut: new Date(),
      dateFin: daysFromNow(30),
    },
    update: {
      plan: "PME",
      statut: "ACTIF",
      dateDebut: new Date(),
      dateFin: daysFromNow(30),
    },
  });
  console.log("✅ Abonnement PME activé (30 jours)");

  // 3. Mettre à jour les offres existantes avec de vraies données
  for (const offre of OFFRES_DATA) {
    const { id, ...data } = offre;
    await prisma.jobOffer.update({ where: { id }, data });
  }
  console.log("✅ 2 offres existantes mises à jour avec données réalistes");

  // 4. Créer les colonnes Kanban
  const existingCols = await prisma.kanbanColumn.count({ where: { recruteurId: RECRUTEUR_ID } });
  if (existingCols === 0) {
    const kanbanCols = [
      { name: "Nouvelles candidatures", color: "#6366f1", order: 1, isDefault: true },
      { name: "En révision", color: "#f59e0b", order: 2 },
      { name: "Entretien planifié", color: "#3b82f6", order: 3 },
      { name: "Offre envoyée", color: "#8b5cf6", order: 4 },
      { name: "Accepté", color: "#10b981", order: 5 },
      { name: "Refusé", color: "#ef4444", order: 6 },
    ];
    for (const col of kanbanCols) {
      await prisma.kanbanColumn.create({ data: { ...col, recruteurId: RECRUTEUR_ID } });
    }
    console.log("✅ 6 colonnes Kanban créées");
  } else {
    console.log(`ℹ️  Colonnes Kanban déjà présentes (${existingCols})`);
  }

  // 5. Créer les candidats
  const candidats = makeCandidats();
  const createdCandidatIds: string[] = [];
  const createdUserIds: string[] = [];

  for (const c of candidats) {
    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      // Trouver le candidat associé
      const cand = await prisma.candidat.findUnique({ where: { userId: existing.id } });
      if (cand) createdCandidatIds.push(cand.id);
      createdUserIds.push(existing.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        id: c.userId,
        email: c.email,
        name: `${c.prenom} ${c.nom}`,
        type: "CANDIDAT",
        emailVerified: true,
        password: c.password,
      },
    });

    const candidat = await prisma.candidat.create({
      data: {
        id: c.candidatId,
        userId: user.id,
        prenom: c.prenom,
        nom: c.nom,
        ville: c.ville,
        pays: "Côte d'Ivoire",
        domaine: c.domaine,
        bio: c.bio,
        dateNaissance: c.dateNaissance,
        statut: "En recherche",
      },
    });
    createdCandidatIds.push(candidat.id);
    createdUserIds.push(user.id);

    // Compétences
    for (const comp of c.competences) {
      await prisma.candidatCompetence.upsert({
        where: { candidatId_competence: { candidatId: candidat.id, competence: comp } },
        create: { candidatId: candidat.id, competence: comp },
        update: {},
      });
    }

    // Expérience
    const companies = ["Orange CI", "MTN", "Ecobank", "SFI", "BICICI", "BSIC", "Jumia", "Kobo360", "Wave", "Moov Africa"];
    await prisma.experience.create({
      data: {
        candidatId: candidat.id,
        poste: `${c.domaine} Senior`,
        entreprise: pick(companies),
        localisation: c.ville,
        typeContrat: "CDI",
        dateDebut: daysAgo(c.anneesExp * 365),
        dateFin: daysAgo(60),
        description: `Poste de ${c.domaine} avec gestion de projets transversaux et encadrement d'une petite équipe.`,
      },
    });
  }
  console.log(`✅ ${createdCandidatIds.length} candidats créés/retrouvés`);

  // 6. Créer les candidatures sur les 2 offres
  const statuts = ["EN_ATTENTE", "EN_ATTENTE", "EN_ATTENTE", "EN_REVISION", "EN_REVISION", "ACCEPTE", "REFUSE", "EN_ATTENTE"] as const;
  let appCount = 0;

  for (let i = 0; i < createdCandidatIds.length; i++) {
    const candidatId = createdCandidatIds[i];
    // Répartir sur les 2 offres
    const offreId = OFFRES_DATA[i % 2].id;

    const existing = await prisma.application.findFirst({ where: { candidatId, jobOfferId: offreId } });
    if (existing) continue;

    const statut = statuts[i % statuts.length];
    const app = await prisma.application.create({
      data: {
        candidatId,
        jobOfferId: offreId,
        status: statut,
        message: `Bonjour, je suis très intéressé(e) par ce poste et je pense que mon profil correspond bien à vos attentes. Je suis disponible pour un entretien à votre convenance.`,
        rating: statut === "ACCEPTE" ? 4 + (i % 2) : statut === "REFUSE" ? 1 + (i % 2) : null,
        createdAt: daysAgo(30 - i),
      },
    });
    appCount++;

    // Note sur quelques candidatures
    if (i % 3 === 0) {
      await prisma.applicationNote.create({
        data: {
          applicationId: app.id,
          content: pick([
            "Profil intéressant, à recontacter pour un entretien téléphonique.",
            "Bon niveau technique, expérience pertinente.",
            "CV bien structuré. À préqualifier par téléphone.",
            "Correspond bien au profil recherché. Programmer un entretien RH.",
          ]),
          authorId: RECRUTEUR_ID,
          authorName: recruteur.companyName || "Recruteur",
          authorType: "RECRUTEUR",
        },
      });
    }

    // Entretien planifié pour les acceptés
    if (statut === "ACCEPTE" || (statut === "EN_REVISION" && i < 5)) {
      await prisma.entretien.create({
        data: {
          applicationId: app.id,
          recruteurId: RECRUTEUR_ID,
          titre: `Entretien ${i % 2 === 0 ? "technique" : "RH"} — ${OFFRES_DATA[i % 2].title}`,
          dateHeure: daysFromNow(5 + (i % 10)),
          type: pick(["VISIO", "PRESENTIEL", "TELEPHONE"]) as any,
          lieu: i % 3 === 0 ? "Cocody, Abidjan" : undefined,
          notes: "Préparer les questions techniques. Vérifier disponibilité du candidat.",
          statut: "PLANIFIE",
        },
      });
    }

    // Conversation + messages pour quelques candidatures
    if (i < 6) {
      const existingConv = await prisma.conversation.findFirst({
        where: { jobOfferId: offreId, candidatId, recruteurId: RECRUTEUR_ID },
      });
      if (!existingConv) {
        const conv = await prisma.conversation.create({
          data: {
            jobOfferId: offreId,
            candidatId,
            recruteurId: RECRUTEUR_ID,
          },
        });
        // Messages
        const msgs = [
          { senderType: "CANDIDAT" as const, content: "Bonjour, j'ai postulé à votre offre. Mon profil vous intéresse-t-il ?" },
          { senderType: "RECRUTEUR" as const, content: "Bonjour, merci pour votre candidature ! Votre profil est effectivement intéressant. Êtes-vous disponible pour un échange cette semaine ?" },
          { senderType: "CANDIDAT" as const, content: "Bien sûr, je suis disponible jeudi ou vendredi en après-midi." },
          { senderType: "RECRUTEUR" as const, content: "Parfait, je vous propose vendredi à 15h en visio. Je vous enverrai le lien par email." },
        ];
        for (let m = 0; m < msgs.length; m++) {
          const senderId = msgs[m].senderType === "RECRUTEUR" ? RECRUTEUR_ID : candidatId;
          await prisma.message.create({
            data: {
              conversationId: conv.id,
              senderId,
              senderType: msgs[m].senderType,
              content: msgs[m].content,
              isRead: m < msgs.length - 1,
              createdAt: daysAgo(7 - m),
            },
          });
        }
      }
    }
  }

  console.log(`✅ ${appCount} candidatures créées avec notes, entretiens et conversations`);

  // 7. Résumé
  const [totalOffres, totalApps, totalCandidats, totalConvs, totalEntretiens, totalKanban] = await Promise.all([
    prisma.jobOffer.count({ where: { recruteurId: RECRUTEUR_ID } }),
    prisma.application.count({ where: { jobOffer: { recruteurId: RECRUTEUR_ID } } }),
    prisma.candidat.count(),
    prisma.conversation.count({ where: { recruteurId: RECRUTEUR_ID } }),
    prisma.entretien.count({ where: { recruteurId: RECRUTEUR_ID } }),
    prisma.kanbanColumn.count({ where: { recruteurId: RECRUTEUR_ID } }),
  ]);

  console.log("\n📊 Résumé de la base de données :");
  console.log(`   Offres d'emploi    : ${totalOffres}`);
  console.log(`   Candidatures       : ${totalApps}`);
  console.log(`   Candidats          : ${totalCandidats}`);
  console.log(`   Conversations      : ${totalConvs}`);
  console.log(`   Entretiens         : ${totalEntretiens}`);
  console.log(`   Colonnes Kanban    : ${totalKanban}`);
  console.log("\n🎉 Seed terminé avec succès !");
  console.log(`\n👉 Connectez-vous avec : r225@gmail.com`);
}

main()
  .catch((e) => { console.error("❌ Erreur seed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
