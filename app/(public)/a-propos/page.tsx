"use client";
import { motion } from "framer-motion";
import {
  Target,
  Heart,
  Users,
  TrendingUp,
  Award,
  Globe,
  Zap,
  Shield,
  Briefcase,
  CheckCircle,
  Play,
  Quote,
} from "lucide-react";
import Link from "next/link";

const team = [
  {
    name: "Sophie Martin",
    role: "CEO & Co-fondatrice",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    bio: "15 ans d'expérience dans le recrutement et la tech.",
  },
  {
    name: "Thomas Dubois",
    role: "CTO & Co-fondateur",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Expert en développement produit et UX design.",
  },
  {
    name: "Marie Laurent",
    role: "Head of Product",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Spécialiste en product management et stratégie.",
  },
  {
    name: "Lucas Bernard",
    role: "Head of Growth",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Expert en marketing digital et acquisition.",
  },
];

const features = [
  {
    icon: Users,
    title: "Équipe Professionnelle",
    description:
      "Notre équipe d'experts en recrutement vous accompagne à chaque étape de votre recherche de talents.",
  },
  {
    icon: Target,
    title: "Orientation Résultats",
    description:
      "Nous nous concentrons sur vos objectifs et vous aidons à atteindre vos cibles de recrutement.",
  },
  {
    icon: CheckCircle,
    title: "Garantie de Succès",
    description:
      "Notre approche éprouvée garantit des résultats concrets et mesurables pour votre entreprise.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center bg-no-repeat py-20 md:py-32 h-screen relative"
        style={{ backgroundImage: "url('/img/about-bg.png')" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-900 max-w-4xl mx-auto relative mt-24"
          >
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gray-900 rounded-full opacity-20"></div>
            <div className="absolute top-8 -left-8 w-4 h-4 bg-gray-900 rounded-full opacity-30"></div>
            <div className="absolute -bottom-4 left-1/4 w-6 h-6 bg-gray-900 rounded-full opacity-20"></div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white">
              À propos de nous
            </h1>
            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
              Nous nous assurons que votre idée et votre création sont livrées
              correctement. Notre mission est de révolutionner le recrutement en
              connectant les meilleurs talents avec les entreprises qui les
              méritent.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-white container mx-auto ">
        <div className="  px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className=" "
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              Nous nous assurons que votre idée <br /> et votre création sont
              livrées correctement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-gray-600 leading-relaxed">
              <p>
                Chez Ylsix, nous croyons que chaque entreprise mérite de trouver
                les talents qui correspondent parfaitement à sa culture et ses
                objectifs. Notre plateforme révolutionne le processus de
                recrutement en utilisant des technologies avancées et une
                approche humaine.
              </p>
              <p>
                Nous nous engageons à fournir des solutions de recrutement
                innovantes qui permettent aux entreprises de se concentrer sur
                ce qui compte le plus : leur croissance et leur développement.
                Notre équipe d'experts travaille sans relâche pour garantir des
                résultats exceptionnels.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video/Quote Section */}
      <div className="bg-gray-50 py-20 md:py-32 container mx-auto">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ">
            {/* Video Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop"
                  alt="Notre équipe en action"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  </button>
                </div>
              </div>

              {/* Quote Card */}
              <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
                <Quote className="w-8 h-8 text-yellow-400 mb-4" />
                <blockquote className="text-xl font-bold text-gray-900 mb-4">
                  "Créer un impact, ensemble"
                </blockquote>
                <cite className="text-gray-600 font-medium">
                  Fondateur de Ylsix
                </cite>
              </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Nous autonomisons les propriétaires de petites entreprises
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Notre mission est de démocratiser l'accès aux meilleurs
                  talents pour toutes les entreprises, quelle que soit leur
                  taille. Nous croyons que chaque entreprise mérite de
                  travailler avec des professionnels exceptionnels.
                </p>
                <div className="relative pl-6 border-l-4 border-[#a590ff]">
                  <p className="italic">
                    "Grâce à notre plateforme, les petites entreprises peuvent
                    maintenant rivaliser avec les grandes corporations dans la
                    recherche de talents. C'est notre engagement envers
                    l'égalité des chances dans le monde du travail."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#a590ff] py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Nous aidons les entreprises à grandir plus vite et plus grand
            </h2>
            <p className="text-lg text-white leading-relaxed">
              Notre approche innovante et nos outils avancés permettent aux
              entreprises de transformer leur processus de recrutement et
              d'attirer les meilleurs talents.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-[#fff] rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-[#a590ff]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-gray-900 py-20 md:py-32"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Prêt à transformer votre recrutement ?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à
            Ylsix pour leurs besoins en recrutement.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/offres"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Voir les offres
            </Link>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
}
