"use client";
import {
  CheckCircle,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  FileText,
  Zap,
  Globe,
  Settings,
  Bell,
  Search,
  Calendar,
  Lock,
  TrendingUp,
  UserCheck,
  Layout,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const recruteurFeatures = [
  {
    icon: Layout,
    title: "Tableau Kanban interactif",
    description:
      "Visualisez et gérez vos candidatures en temps réel avec un système de drag & drop intuitif. Organisez vos candidats par étapes du processus de recrutement.",
    benefits: [
      "Glisser-déposer pour changer les statuts",
      "Vue d'ensemble instantanée",
      "Filtres avancés par poste, date, tags",
      "Export des données en un clic",
    ],
  },
  {
    icon: Globe,
    title: "Multi-diffusion sur 160+ jobboards",
    description:
      "Publiez vos offres simultanément sur plus de 160 sites d'emploi majeurs en un seul clic. Maximisez votre visibilité et touchez des milliers de candidats qualifiés.",
    benefits: [
      "Indeed, LinkedIn, Monster, Glassdoor",
      "Sites spécialisés par secteur",
      "Distribution internationale",
      "Suivi des performances par source",
    ],
  },
  {
    icon: Users,
    title: "Collaboration d'équipe",
    description:
      "Travaillez efficacement en équipe avec un système de permissions granulaires. Invitez vos collègues et collaborez sur les recrutements.",
    benefits: [
      "Gestion des rôles et permissions",
      "Commentaires et notes internes",
      "Notifications en temps réel",
      "Historique des actions",
    ],
  },
  {
    icon: BarChart3,
    title: "Statistiques détaillées",
    description:
      "Analysez les performances de vos campagnes de recrutement avec des tableaux de bord personnalisables. Optimisez votre stratégie grâce aux données.",
    benefits: [
      "Taux de conversion par source",
      "Temps moyen de recrutement",
      "ROI des campagnes",
      "Rapports exportables",
    ],
  },
  {
    icon: FileText,
    title: "Templates d'offres",
    description:
      "Créez des offres d'emploi professionnelles en quelques minutes avec nos templates personnalisables. Gagnez du temps sur vos publications.",
    benefits: [
      "Bibliothèque de templates",
      "Éditeur WYSIWYG",
      "Branding personnalisé",
      "Sauvegarde automatique",
    ],
  },
  {
    icon: Search,
    title: "Recherche avancée de candidats",
    description:
      "Accédez à une base de données de candidats qualifiés avec des filtres puissants. Trouvez le talent parfait pour votre poste.",
    benefits: [
      "Filtres par compétences, localisation",
      "Recherche par mots-clés",
      "Tri par pertinence",
      "Alertes candidats",
    ],
  },
];

const candidatFeatures = [
  {
    icon: UserCheck,
    title: "Profil professionnel complet",
    description:
      "Créez un profil détaillé qui met en valeur vos compétences, expériences et formations. Soyez visible auprès des recruteurs.",
    benefits: [
      "CV structuré et optimisé",
      "Portfolio de projets",
      "Certifications et diplômes",
      "Visibilité contrôlée",
    ],
  },
  {
    icon: FileText,
    title: "Générateur de CV moderne",
    description:
      "Créez des CV professionnels avec nos templates élégants. Téléchargez en PDF et partagez facilement.",
    benefits: [
      "Plusieurs designs professionnels",
      "Export PDF haute qualité",
      "Personnalisation des couleurs",
      "Mise à jour en temps réel",
    ],
  },
  {
    icon: Target,
    title: "Recherche d'offres intelligente",
    description:
      "Trouvez les opportunités qui vous correspondent vraiment grâce à notre moteur de recherche avancé et nos recommandations personnalisées.",
    benefits: [
      "Recommandations basées sur votre profil",
      "Filtres multicritères",
      "Recherche géolocalisée",
      "Suggestions automatiques",
    ],
  },
  {
    icon: Bell,
    title: "Alertes emploi personnalisées",
    description:
      "Recevez les nouvelles offres correspondant à vos critères directement par email. Ne ratez aucune opportunité.",
    benefits: [
      "Alertes en temps réel",
      "Critères personnalisables",
      "Fréquence ajustable",
      "Multi-alertes",
    ],
  },
  {
    icon: Calendar,
    title: "Suivi des candidatures",
    description:
      "Visualisez l'état de toutes vos candidatures sur un tableau de bord clair. Gardez le contrôle de votre recherche d'emploi.",
    benefits: [
      "Timeline des candidatures",
      "Rappels d'actions",
      "Historique complet",
      "Notes personnelles",
    ],
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description:
      "Communiquez directement avec les recruteurs via notre système de messagerie sécurisé. Planifiez des entretiens facilement.",
    benefits: [
      "Chat en temps réel",
      "Partage de documents",
      "Notifications push",
      "Historique des conversations",
    ],
  },
];

const platformFeatures = [
  {
    icon: Lock,
    title: "Sécurité & Confidentialité",
    description:
      "Vos données sont protégées avec un cryptage de niveau bancaire. Conformité RGPD garantie.",
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description:
      "Interface ultra-rapide et responsive. Accédez à vos recrutements depuis n'importe quel appareil.",
  },
  {
    icon: Settings,
    title: "API & Intégrations",
    description:
      "Connectez Ylsix à vos outils existants (SIRH, ATS, CRM). API REST documentée.",
  },
  {
    icon: TrendingUp,
    title: "Mises à jour continues",
    description:
      "Nouvelles fonctionnalités ajoutées régulièrement. Écoutez vos retours et évoluons ensemble.",
  },
];

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center bg-no-repeat py-12 md:py-32"
        style={{
          backgroundImage: "url('/img/banniereweb_.png')",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-black">
              Une plateforme complète pour révolutionner vos recrutements
            </h1>
            <p className="text-lg md:text-xl mb-8 text-black">
              Découvrez toutes les fonctionnalités qui font de Ylsix la solution
              de recrutement la plus complète du marché
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#a590ff] mb-2">160+</div>
              <div className="text-gray-600">Jobboards connectés</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#a590ff] mb-2">40%</div>
              <div className="text-gray-600">Gain de temps</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#a590ff] mb-2">500+</div>
              <div className="text-gray-600">Entreprises clientes</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#a590ff] mb-2">10K+</div>
              <div className="text-gray-600">Recrutements réussis</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pour les Recruteurs */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 rounded-full font-semibold mb-4 text-sm md:text-base">
              Pour les Recruteurs
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Recrutez plus vite et mieux
            </h2>
            <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto">
              Toutes les fonctionnalités dont vous avez besoin pour gérer vos
              recrutements de A à Z
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recruteurFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl   transition-shadow p-8 border border-gray-100"
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#a590ff]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-[#a590ff] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Séparateur */}
      <div className=" py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à transformer vos recrutements ?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Rejoignez les 500+ entreprises qui nous font confiance
            </p>
            <Link href="/recruteur/dashboard">
              <button className="bg-[#a590ff] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                Commencer gratuitement
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Pour les Candidats */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 rounded-full font-semibold mb-4 text-sm md:text-base">
              Pour les Candidats
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Trouvez l'emploi de vos rêves
            </h2>
            <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto">
              Tous les outils pour booster votre recherche d'emploi et décrocher
              le poste idéal
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {candidatFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl  transition-shadow p-8 border border-gray-100"
              >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#a590ff]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-[#a590ff] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Plateforme Section */}
      <div className="bg-white py-20 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Une plateforme fiable et sécurisée
            </h2>
            <p className="text-gray-600 text-base md:text-xl max-w-3xl mx-auto">
              Nous mettons tout en œuvre pour vous offrir la meilleure
              expérience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-8 h-8 text-[#a590ff]" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-[#a590ff] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Prêt à révolutionner vos recrutements ?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-purple-100">
              Essayez Ylsix gratuitement pendant 14 jours. Aucune carte bancaire
              requise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recruteur/dashboard">
                <button className="bg-white text-[#a590ff] px-8 py-2 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  Démarrer gratuitement
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-transparent border-2 border-white text-white rounded-full px-8 py-2 font-semibold text-lg hover:bg-white hover:text-[#a590ff] transition-colors">
                  Parler à un expert
                </button>
              </Link>
            </div>
            <p className="text-sm text-purple-200 mt-6">
              ✓ 14 jours d'essai gratuit &nbsp;&nbsp;✓ Annulation à tout moment
              &nbsp;&nbsp;✓ Support 24/7
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
