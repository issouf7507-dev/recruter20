"use client";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Share2,
  Bookmark,
  Building2,
  Users,
  Calendar,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useOffer } from "@/lib/hooks/use-offers";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

// Base de données des offres (devrait correspondre à la page de liste)
const allJobs = [
  {
    id: 1,
    title: "Designer Produit",
    company: "Gojek",
    location: "Marina East, Singapour",
    type: "CDI",
    salary: "€3,500-€4,500",
    experience: "3-5 ans",
    remote: "Sur site",
    logo: "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
    tags: ["Design UI", "Recherche UX", "Figma", "Prototypage"],
    postedAt: "Publié il y a 5 min",
    description: `Dans ce rôle, vous créerez du contenu pour une large gamme de clients locaux et internationaux. 
    Ce poste convient aux créatifs basés à Singapour qui souhaitent travailler en interne avec une équipe dynamique.`,
    urgent: true,
    rating: 4.8,
    missions: [
      "Concevoir des interfaces utilisateur intuitives et esthétiques",
      "Réaliser des recherches UX pour comprendre les besoins des utilisateurs",
      "Créer des prototypes interactifs avec Figma",
      "Collaborer avec les développeurs pour l'implémentation",
      "Maintenir et faire évoluer le design system",
      "Présenter les concepts aux parties prenantes",
    ],
    profil: [
      "3 à 5 ans d'expérience en design de produit",
      "Maîtrise de Figma et autres outils de design",
      "Portfolio démontrant des projets réussis",
      "Compétences en recherche UX et tests utilisateurs",
      "Excellentes capacités de communication",
      "Esprit d'équipe et sens du détail",
    ],
    avantages: [
      "Salaire compétitif + bonus annuel",
      "Assurance santé premium",
      "Budget formation de 2000€/an",
      "Équipement Apple dernière génération",
      "25 jours de congés payés",
      "Événements d'équipe mensuels",
      "Café et snacks à volonté",
      "Salle de sport sur place",
    ],
    processus: [
      {
        title: "Entretien RH",
        description: "Discussion sur votre parcours et vos motivations",
        duration: "30 min",
      },
      {
        title: "Portfolio Review",
        description: "Présentation détaillée de vos projets",
        duration: "1h",
      },
      {
        title: "Design Challenge",
        description: "Exercice pratique à réaliser",
        duration: "3-4h",
      },
      {
        title: "Rencontre d'équipe",
        description: "Échange avec l'équipe design",
        duration: "45 min",
      },
    ],
    companyInfo: {
      name: "Gojek",
      size: "1000+ employés",
      sector: "Technologie / Transport",
      founded: "2010",
      website: "www.gojek.com",
      description:
        "Gojek est une super app asiatique leader, offrant des services de transport, livraison et paiement. Nous innovons constamment pour améliorer la vie de millions d'utilisateurs.",
    },
  },
  {
    id: 2,
    title: "Spécialiste Rédaction",
    company: "Odama Studio",
    location: "Paris, France",
    type: "Freelance",
    salary: "€1,600-€1,800",
    experience: "2-4 ans",
    remote: "Télétravail",
    logo: "https://www.untitledui.com/images/avatars/nikolas-gibbons?fm=webp&q=80",
    tags: ["Rédaction", "Marketing", "SEO", "Réseaux sociaux"],
    postedAt: "Publié il y a 3 jours",
    description: `Collaborez avec l'équipe marketing pour optimiser la conversion. 
    Développez des textes inspirants, persuasifs et convaincants pour une large gamme de besoins rédactionnels.`,
    urgent: false,
    rating: 4.6,
    missions: [
      "Rédiger du contenu marketing de qualité",
      "Optimiser le contenu pour le SEO",
      "Créer des publications pour les réseaux sociaux",
      "Collaborer avec l'équipe marketing",
      "Analyser les performances du contenu",
      "Adapter le ton selon les besoins",
    ],
    profil: [
      "2 à 4 ans d'expérience en rédaction",
      "Excellente maîtrise du français",
      "Connaissance du SEO et du marketing digital",
      "Créativité et sens de l'adaptation",
      "Portfolio de contenus rédigés",
      "Autonomie et respect des délais",
    ],
    avantages: [
      "Télétravail 100%",
      "Horaires flexibles",
      "Missions variées et stimulantes",
      "Collaboration avec clients internationaux",
      "Formation continue incluse",
      "Réseau de freelances actif",
    ],
    processus: [
      {
        title: "Entretien de découverte",
        description: "Présentation du poste et de vos compétences",
        duration: "30 min",
      },
      {
        title: "Test de rédaction",
        description: "Exercice pratique sur un brief réel",
        duration: "2h",
      },
      {
        title: "Entretien final",
        description: "Discussion sur les modalités de collaboration",
        duration: "30 min",
      },
    ],
    companyInfo: {
      name: "Odama Studio",
      size: "10-50 employés",
      sector: "Marketing Digital / Création",
      founded: "2018",
      website: "www.odamastudio.fr",
      description:
        "Odama Studio est une agence créative spécialisée dans le contenu digital. Nous aidons les marques à raconter leur histoire de manière authentique et engageante.",
    },
  },
  {
    id: 3,
    title: "Développeur Full Stack",
    company: "Twitter",
    location: "Málaga, Espagne",
    type: "CDI",
    salary: "€1,000-€2,000",
    experience: "3-5 ans",
    remote: "Hybride",
    logo: "https://www.untitledui.com/images/avatars/sienna-hewitt?fm=webp&q=80",
    tags: ["React", "Node.js", "TypeScript", "MongoDB"],
    postedAt: "Publié il y a 3 jours",
    description: `Responsable de la conception, planification et test de projets/produits. 
    Construction de modules efficaces et réutilisables qui amélioreront l'expérience utilisateur dans chaque projet/produit.`,
    urgent: false,
    rating: 4.9,
    missions: [
      "Développer des applications web full-stack",
      "Concevoir l'architecture technique",
      "Écrire du code propre et testé",
      "Collaborer avec l'équipe produit",
      "Optimiser les performances",
      "Participer aux code reviews",
    ],
    profil: [
      "3 à 5 ans d'expérience en développement",
      "Maîtrise de React et Node.js",
      "Connaissance de TypeScript",
      "Expérience avec MongoDB",
      "Pratique des tests unitaires",
      "Anglais professionnel",
    ],
    avantages: [
      "Télétravail 2 jours/semaine",
      "Assurance santé complète",
      "Budget formation",
      "Stock options",
      "Vacances illimitées",
      "Environnement international",
    ],
    processus: [
      {
        title: "Screening RH",
        description: "Entretien téléphonique",
        duration: "30 min",
      },
      {
        title: "Test technique",
        description: "Exercice de code",
        duration: "2-3h",
      },
      {
        title: "Entretien technique",
        description: "Discussion avec l'équipe tech",
        duration: "1h",
      },
      {
        title: "Entretien final",
        description: "Rencontre avec le manager",
        duration: "45 min",
      },
    ],
    companyInfo: {
      name: "Twitter",
      size: "5000+ employés",
      sector: "Réseaux Sociaux / Tech",
      founded: "2006",
      website: "www.twitter.com",
      description:
        "Twitter est une plateforme mondiale de conversation en temps réel. Nous connectons des millions de personnes à travers le monde.",
    },
  },
  {
    id: 4,
    title: "Responsable Marketing",
    company: "TechCorp",
    location: "Berlin, Allemagne",
    type: "CDI",
    salary: "€4,000-€5,500",
    experience: "5+ ans",
    remote: "Hybride",
    logo: "https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80",
    tags: ["Marketing Digital", "Analytique", "Gestion de Campagnes"],
    postedAt: "Publié il y a 1 semaine",
    description: `Dirigez nos initiatives marketing et stimulez la croissance grâce à des campagnes innovantes et des partenariats stratégiques.`,
    urgent: false,
    rating: 4.7,
    missions: [
      "Définir la stratégie marketing",
      "Gérer les campagnes digitales",
      "Analyser les performances",
      "Manager une équipe de 5 personnes",
      "Développer des partenariats",
      "Gérer le budget marketing",
    ],
    profil: [
      "5+ ans d'expérience en marketing",
      "Expérience en management d'équipe",
      "Maîtrise des outils analytics",
      "Connaissance du marketing digital",
      "Excellentes capacités stratégiques",
      "Anglais et allemand courants",
    ],
    avantages: [
      "Salaire attractif + bonus",
      "Télétravail flexible",
      "Voiture de fonction",
      "Assurance premium",
      "30 jours de congés",
      "Formation continue",
    ],
    processus: [
      {
        title: "Entretien RH",
        description: "Discussion initiale",
        duration: "45 min",
      },
      {
        title: "Case Study",
        description: "Présentation d'une stratégie",
        duration: "1h30",
      },
      {
        title: "Rencontre direction",
        description: "Entretien avec le CMO",
        duration: "1h",
      },
    ],
    companyInfo: {
      name: "TechCorp",
      size: "200-500 employés",
      sector: "Technologie / SaaS",
      founded: "2015",
      website: "www.techcorp.de",
      description:
        "TechCorp est un leader européen des solutions SaaS pour les entreprises. Nous innovons pour faciliter la transformation digitale.",
    },
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "DataLabs",
    location: "Amsterdam, Pays-Bas",
    type: "CDI",
    salary: "€5,000-€7,000",
    experience: "3-5 ans",
    remote: "Télétravail",
    logo: "https://www.untitledui.com/images/avatars/jaya-willis?fm=webp&q=80",
    tags: ["Python", "Machine Learning", "TensorFlow", "Analyse de Données"],
    postedAt: "Publié il y a 1 semaine",
    description: `Exploitez les données pour créer des modèles prédictifs innovants et générer des insights business grâce à l'analytique avancée.`,
    urgent: false,
    rating: 4.8,
    missions: [
      "Développer des modèles ML",
      "Analyser des données complexes",
      "Créer des visualisations",
      "Collaborer avec les équipes métier",
      "Optimiser les algorithmes",
      "Présenter les résultats",
    ],
    profil: [
      "3-5 ans en data science",
      "Maîtrise de Python",
      "Expérience en ML/DL",
      "Connaissance de TensorFlow",
      "Compétences en statistiques",
      "Capacité à vulgariser",
    ],
    avantages: [
      "Télétravail 100%",
      "Salaire très compétitif",
      "Budget conférences",
      "Matériel haute performance",
      "Horaires flexibles",
      "Projets innovants",
    ],
    processus: [
      {
        title: "Entretien technique",
        description: "Discussion sur votre expérience",
        duration: "1h",
      },
      {
        title: "Data Challenge",
        description: "Cas pratique d'analyse",
        duration: "4h",
      },
      {
        title: "Présentation",
        description: "Défense de votre solution",
        duration: "1h",
      },
    ],
    companyInfo: {
      name: "DataLabs",
      size: "50-200 employés",
      sector: "Data Science / Analytics",
      founded: "2017",
      website: "www.datalabs.nl",
      description:
        "DataLabs aide les entreprises à exploiter leurs données pour prendre de meilleures décisions stratégiques.",
    },
  },
  {
    id: 6,
    title: "Ingénieur DevOps",
    company: "CloudTech",
    location: "Londres, Royaume-Uni",
    type: "CDI",
    salary: "€4,500-€6,500",
    experience: "4-6 ans",
    remote: "Hybride",
    logo: "https://www.untitledui.com/images/avatars/levi-rocha?fm=webp&q=80",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    postedAt: "Publié il y a 2 semaines",
    description: `Optimisez notre infrastructure cloud et nos processus de déploiement pour assurer l'évolutivité et la fiabilité.`,
    urgent: false,
    rating: 4.9,
    missions: [
      "Gérer l'infrastructure cloud",
      "Automatiser les déploiements",
      "Assurer la disponibilité",
      "Optimiser les performances",
      "Gérer la sécurité",
      "Former les équipes",
    ],
    profil: [
      "4-6 ans en DevOps",
      "Maîtrise de Docker/Kubernetes",
      "Expérience AWS",
      "Connaissance CI/CD",
      "Scripting (Python, Bash)",
      "Esprit d'équipe",
    ],
    avantages: [
      "Salaire attractif",
      "Télétravail 3j/semaine",
      "Certifications payées",
      "Assurance complète",
      "28 jours de congés",
      "Bureau moderne",
    ],
    processus: [
      {
        title: "Entretien RH",
        description: "Présentation du poste",
        duration: "30 min",
      },
      {
        title: "Test technique",
        description: "Exercice d'infrastructure",
        duration: "2h",
      },
      {
        title: "Entretien technique",
        description: "Discussion approfondie",
        duration: "1h30",
      },
    ],
    companyInfo: {
      name: "CloudTech",
      size: "100-500 employés",
      sector: "Cloud Computing",
      founded: "2016",
      website: "www.cloudtech.uk",
      description:
        "CloudTech fournit des solutions cloud innovantes pour les entreprises du monde entier.",
    },
  },
];

export default function OffreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const { candidat } = useCandidat();
  const { hasApplied, createCandidature } = useCandidatures(candidat?.id);

  // Trouver l'offre correspondante
  // const jobDetail = allJobs.find((job) => job.id === parseInt(params.id));

  // Offres similaires (exclure l'offre actuelle)

  const { id } = React.use(params); // 🔹 Déstructure après "unwrap"

  const { data: jobDetail, isLoading } = useOffer(id);
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["documents", candidat?.id],
    queryFn: async () => {
      if (!candidat?.id) return [];
      const response = await fetch(`/api/candidats/${candidat?.id}/documents`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  console.log(documents);

  const similarJobs = allJobs
    .filter((job) => job.id !== parseInt(id))
    .slice(0, 3);

  // Si l'offre n'existe pas, rediriger ou afficher un message
  if (!jobDetail || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          {/* <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Offre non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            Cette offre d'emploi n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/offres"
            className="bg-[#a590ff] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9580ef] transition-colors inline-block"
          >
            Retour aux offres
          </Link> */}
        </div>
      </div>
    );
  }

  const handleShare = () => {
    // if (navigator.share) {
    //   navigator.share({
    //     title: jobDetail.title,
    //     text: `Découvrez cette offre d'emploi : ${jobDetail.title} chez ${jobDetail.company}`,
    //     url: window.location.href,
    //   });
    // } else {
    setShowShareModal(true);
    // }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Lien copié dans le presse-papier !");
    setShowShareModal(false);
  };

  const handlePostulerModal = () => {
    if (
      candidat &&
      documents?.some((document: any) => document.documentType === "cv")
    ) {
      setShowPostulerModal(true);
    } else if (
      !documents?.some((document: any) => document.documentType === "cv")
    ) {
      setShowDocumentsModal(true);
    } else {
      window.location.href = "/auth/candidat/login";
    }
  };

  // console.log("hasApplied", hasApplied(jobDetail?.id));
  const handlePostuler = async () => {
    if (!candidat?.id || !jobDetail?.id) {
      alert("Erreur lors de la postulation");
      return;
    }

    // Vérifier si déjà postulé
    if (hasApplied(jobDetail.id)) {
      alert("Vous avez déjà postulé à cette offre");
      setShowPostulerModal(false);
      return;
    }

    createCandidature.mutate(
      {
        jobOfferId: jobDetail.id,
        message: applicationMessage || undefined,
        cv: candidat?.cv || undefined,
      },
      {
        onSuccess: (data) => {
          setShowPostulerModal(false);
          setApplicationMessage("");
          alert(data.message || "Candidature envoyée avec succès !");
        },
        onError: (error: any) => {
          alert(
            error.message || "Une erreur est survenue lors de la postulation"
          );
        },
      }
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/offres"
            className="flex items-center gap-2 text-white hover:text-[#a590ff] transition-colors w-fit cursor-pointer hover:scale-105 hover:text-white bg-[#a590ff] px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux offres</span>
          </Link>
        </div>
      </div> */}

      {/* Job Header */}
      <div
        className=" bg-cover bg-center bg-no-repeat py-8 md:py-12"
        style={{
          backgroundImage: "url('/img/banniereweb_.png')",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={""}
                alt={jobDetail.company}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    {/* {jobDetail.urgent && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                        Urgently hiring
                      </span>
                    )} */}
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                      {jobDetail.title}
                    </h1>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-lg md:text-xl text-gray-700 font-medium">
                        {jobDetail.company}
                      </p>
                      {/* <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {jobDetail.rating}
                        </span>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="p-3 cursor-pointer text-gray-600 hover:text-[#a590ff] transition-all hover:scale-105"
                      title="Partager l'offre"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 md:gap-4 mb-6 text-sm md:text-base text-gray-600">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.location}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.type}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    {new Date(jobDetail.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2  bg-gray-50 px-3 py-2 rounded-lg font-semibold">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.salaryMax} - {jobDetail.salaryMin}{" "}
                    {jobDetail.salaryCurrency}
                  </span>
                </div>

                {/* <div className="flex flex-wrap gap-2 mb-6">
                  {jobDetail.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-50 text-[#a590ff] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border border-purple-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div> */}

                <button
                  className="w-full md:w-auto bg-[#a590ff] hover:bg-[#9580ef] text-white px-8 py-2 rounded-full font-semibold text-lg transition-all cursor-pointer"
                  onClick={handlePostulerModal}
                  disabled={hasApplied(jobDetail?.id)}
                >
                  {hasApplied(jobDetail?.id)
                    ? "Candidature envoyée"
                    : candidat
                    ? "Postuler maintenant"
                    : "Connectez-vous pour postuler"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-6 md:p-8 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Description du poste
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {jobDetail.description}
              </p>
            </motion.div>
            {/* Missions */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA Sticky */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl bg-gray-50 p-6 sticky top-24 border border-gray-200"
            >
              <button
                className="w-full bg-[#a590ff] hover:bg-[#9580ef] text-white px-6 py-2 rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-xl hover:scale-105 mb-3
              
              "
                onClick={handlePostulerModal}
                disabled={hasApplied(jobDetail?.id)}
              >
                {hasApplied(jobDetail?.id)
                  ? "Candidature envoyée"
                  : candidat
                  ? "Postuler maintenant"
                  : "Connectez-vous pour postuler"}
              </button>
              <p className="text-sm text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Postulez en moins de 2 minutes
              </p>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Publié</span>
                  <span className="text-gray-700 font-medium">
                    {new Date(jobDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Candidatures</span>
                  <span className="text-[#a590ff] font-semibold">
                    {Math.floor(Math.random() * 50) + 10} reçues
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Vues</span>
                  <span className="text-gray-700 font-medium">
                    {Math.floor(Math.random() * 500) + 100}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  À propos de {jobDetail.company}
                </h3>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 text-sm">
                  <Users className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Taille</p>
                    <p className="text-gray-700 font-medium">
                      {/* {jobDetail.companyInfo.size} */}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Secteur</p>
                    <p className="text-gray-700 font-medium">
                      {/* {jobDetail} */}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Fondée en</p>
                    <p className="text-gray-700 font-medium">
                      {/* {jobDetail.companyInfo.founded} */}
                    </p>
                  </div>
                </div>
                {/* {jobDetail.companyInfo.website && (
                  <div className="flex items-start gap-3 text-sm">
                    <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Site web</p>
                      <a
                        href={`https://${jobDetail.companyInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a590ff] hover:underline font-medium"
                      >
                        {jobDetail.companyInfo.website}
                      </a>
                    </div>
                  </div>
                )} */}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {jobDetail.description}
              </p>
              <Link
                href="#"
                className="text-[#a590ff] hover:underline font-semibold text-sm flex items-center gap-1 group"
              >
                Voir toutes les offres
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </motion.div>

            {/* Remote Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-bold text-gray-900">Mode de travail</h3>
              </div>
              <p className="text-gray-700 font-medium text-lg">
                {/* {jobDetail.remote} */}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Similar Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Offres similaires
            </h2>
            <Link
              href="/offres"
              className="text-[#a590ff] hover:underline font-semibold text-sm md:text-base"
            >
              Voir toutes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/offres/${job.id}`}>
                  <div className="bg-white rounded-xl transition-all p-6 cursor-pointer  border border-gray-200  hover:border-[#a590ff] h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900 mb-1 hover:text-[#a590ff] transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-[#a590ff] font-bold text-lg">
                        {job.salary}
                      </span>
                      <span className="bg-purple-50 text-[#a590ff] px-3 py-1 rounded-full text-xs font-medium">
                        Voir l'offre
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Partager cette offre</h3>
            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Copier le lien</span>
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  jobDetail.title
                )}&body=${encodeURIComponent(window.location.href)}`}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Partager par email</span>
              </a>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-[#a590ff] hover:bg-[#9580ef]  rounded-full font-semibold text-white transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}

      {/*  */}

      <AlertDialog open={showPostulerModal} onOpenChange={setShowPostulerModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Postuler à : {jobDetail?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Ajoutez un message personnalisé pour vous démarquer (optionnel)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label
              htmlFor="app-message"
              className="text-sm font-medium mb-2 block"
            >
              Message de motivation
            </Label>
            <Textarea
              id="app-message"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
              className="min-h-[120px]"
            />
            {candidat?.cv && (
              <p className="text-sm text-muted-foreground mt-2">
                ✓ Votre CV sera automatiquement joint à la candidature
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createCandidature.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#a590ff] hover:bg-[#9580ef] text-white"
              onClick={handlePostuler}
              disabled={createCandidature.isPending}
            >
              {createCandidature.isPending ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Postuler"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/*  */}
      <AlertDialog
        open={showDocumentsModal}
        onOpenChange={setShowDocumentsModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Documents requis</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devez télécharger un CV pour postuler à cette offre. Allez
              dans votre espace candidat dans la section "Documents" pour
              télécharger votre CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#a590ff] hover:bg-[#9580ef] text-white"
              // onClick={handleDocuments}
            >
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
