import { PrismaClient } from "../../app/generated/prisma";

if (process.env.NODE_ENV === "production") {
  console.error("❌ Ne jamais exécuter le seed en production !");
  process.exit(1);
}

const prisma = new PrismaClient();

const recruteurId = "cmhhu1y3f000154wr8buk50dg";

// Données réalistes pour les offres
const companies = [
  "TechStart",
  "DataCorp",
  "InnovateLab",
  "CloudSync",
  "DevPro",
  "AppBuilder",
  "CodeFactory",
  "DigitalFlow",
  "SoftWorks",
  "AgileDev",
  "NextGen Solutions",
  "FutureTech",
  "SmartSystems",
  "CyberSecure",
  "NetCom",
  "InfoSoft",
  "CreateZone",
  "BuildIt",
  "LaunchPad",
  "ScaleUp",
];

const titles = [
  "Développeur Full Stack",
  "Ingénieur DevOps",
  "Architecte Cloud",
  "Data Engineer",
  "Product Manager",
  "Développeur React/Node.js",
  "Ingénieur Machine Learning",
  "Scrum Master",
  "Développeur Mobile (React Native)",
  "Chef de Projet IT",
  "Développeur Backend (Python/Django)",
  "Développeur Frontend (Vue.js)",
  "Lead Developer",
  "Infrastructure Engineer",
  "Security Engineer",
  "QA Engineer",
  "UI/UX Designer",
  "Business Analyst",
  "Solution Architect",
  "Site Reliability Engineer",
];

const locations = [
  "Paris, France",
  "Lyon, France",
  "Marseille, France",
  "Toulouse, France",
  "Lille, France",
  "Remote",
  "Bordeaux, France",
  "Nice, France",
  "Nantes, France",
  "Montpellier, France",
  "Hybrid (Paris)",
  "Hybrid (Lyon)",
  "Brussels, Belgium",
  "Geneva, Switzerland",
];

const types = [
  "CDI",
  "CDD",
  "Freelance",
  "Stage",
  "Alternance",
  "Temps partiel",
];

const skills = [
  "JavaScript, React, Node.js",
  "Python, Django, PostgreSQL",
  "AWS, Docker, Kubernetes",
  "Java, Spring Boot, Microservices",
  "C#, .NET, Azure",
  "Go, Kubernetes, Terraform",
  "PHP, Symfony, MySQL",
  "Ruby on Rails, PostgreSQL",
  "DevOps, CI/CD, GitLab",
  "Vue.js, TypeScript, Nuxt.js",
  "Angular, TypeScript, RxJS",
  "Swift, iOS Development",
  "Kotlin, Android Development",
  "Machine Learning, TensorFlow, Python",
  "Data Engineering, Spark, Airflow",
  "Security, Penetration Testing",
  "Blockchain, Solidity, Web3",
  "Gaming, Unity, C#",
];

function generateRandomDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSalary(): { min: number; max: number } {
  const salaries = [
    { min: 35000, max: 45000 },
    { min: 40000, max: 50000 },
    { min: 45000, max: 55000 },
    { min: 50000, max: 60000 },
    { min: 55000, max: 70000 },
    { min: 60000, max: 80000 },
    { min: 70000, max: 90000 },
    { min: 80000, max: 100000 },
    { min: 30000, max: 40000 },
    { min: 25000, max: 35000 },
  ];
  return getRandomElement(salaries);
}

async function seedOffres() {
  console.log("🌱 Starting to seed 50 job offers...");

  try {
    // Vérifier que le recruteur existe
    const recruteur = await prisma.recruteur.findUnique({
      where: { id: recruteurId },
    });

    if (!recruteur) {
      console.error(`❌ Recruteur with ID ${recruteurId} not found`);
      return;
    }

    console.log(
      `✅ Found recruteur: ${recruteur.companyName || recruteur.email}`,
    );

    // Créer 50 offres d'emploi
    const offres = [];

    for (let i = 0; i < 50; i++) {
      const salary = getRandomSalary();
      const company = getRandomElement(companies);
      const title = getRandomElement(titles);
      const location = getRandomElement(locations);
      const type = getRandomElement(types);
      const skillSet = getRandomElement(skills);

      const offre = {
        title: title,
        company: company,
        location: location,
        type: type,
        etat: "active",
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryCurrency: "EUR",
        description: `Nous recherchons un ${title} pour rejoindre notre équipe ${company}. Cette offre représente une excellente opportunité pour évoluer dans un environnement dynamique et innovant.`,
        requirements: `• Diplôme en informatique ou équivalent
• Minimum 2-3 ans d'expérience
• Maîtrise des technologies modernes
• Capacité à travailler en équipe
• Bonnes compétences en communication`,
        benefits: `• Salaire compétitif
• Télétravail partiel possible
• Tickets restaurant
• Mutuelle complémentaire
• 15 jours de congés supplémentaires
• Évolution de carrière`,
        skills: skillSet,
        recruteurId: recruteurId,
        duedate: generateRandomDate(Math.floor(Math.random() * 60) + 30), // Entre 30 et 90 jours
        views: Math.floor(Math.random() * 1000),
      };

      offres.push(offre);
    }

    // Insérer toutes les offres
    const result = await prisma.jobOffer.createMany({
      data: offres,
    });

    console.log(`✅ Successfully created ${result.count} job offers`);
    console.log("🎉 Seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding offers:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedOffres();
