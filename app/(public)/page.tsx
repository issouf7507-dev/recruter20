"use client";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  Dribbble,
  Linkedin,
  ShieldCheckIcon,
  UserIcon,
  X,
  ChevronDown,
  User,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TestimonialsColumn } from "@/app/components/publicc/TestimonialsColumns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CvRequiredModal } from "@/app/components/publicc/CvRequiredModal";

const teamMembers = [
  {
    name: "Amélie Laurent",
    title: "Founder & CEO",
    summary:
      "Experte en recrutement digital avec plus de 15 ans d'expérience en RH.",
    avatarUrl:
      "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
    socials: [
      {
        icon: X,
        href: "https://x.com/",
      },
      {
        icon: Linkedin,
        href: "https://www.linkedin.com/",
      },
      {
        icon: Dribbble,
        href: "https://dribbble.com/",
      },
    ],
  },
  {
    name: "Nikolas Gibbons",
    title: "Directeur Technique",
    summary:
      "Spécialiste des plateformes SaaS et de l'intelligence artificielle appliquée au recrutement.",
    avatarUrl:
      "https://www.untitledui.com/images/avatars/nikolas-gibbons?fm=webp&q=80",
    socials: [
      {
        icon: X,
        href: "https://x.com/",
      },
      {
        icon: Linkedin,
        href: "https://www.linkedin.com/",
      },
      {
        icon: Dribbble,
        href: "https://dribbble.com/",
      },
    ],
  },
  {
    name: "Sienna Hewitt",
    title: "Directrice Produit",
    summary:
      "Ancienne responsable RH chez LinkedIn, passionnée par l'expérience utilisateur.",
    avatarUrl:
      "https://www.untitledui.com/images/avatars/sienna-hewitt?fm=webp&q=80",
    socials: [
      {
        icon: X,
        href: "https://x.com/",
      },
      {
        icon: Linkedin,
        href: "https://www.linkedin.com/",
      },
      {
        icon: Dribbble,
        href: "https://dribbble.com/",
      },
    ],
  },
];
const testimonials = [
  {
    text: "Ylsix a révolutionné notre processus de recrutement. Le tableau Kanban nous permet de suivre chaque candidature en temps réel. Nous avons réduit notre temps de recrutement de 40%.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sophie Martin",
    role: "Directrice RH",
  },
  {
    text: "La mise en place a été rapide et intuitive. L'interface est moderne et nos équipes l'ont adoptée immédiatement. Un vrai gain de productivité !",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Thomas Dubois",
    role: "Responsable Recrutement",
  },
  {
    text: "Le système de multi-diffusion sur 160+ jobboards nous fait gagner un temps précieux. Plus besoin de publier manuellement sur chaque plateforme !",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Marie Leroy",
    role: "Chargée de Recrutement",
  },
  {
    text: "En tant que candidat, j'ai adoré la simplicité de la plateforme. Le générateur de CV est excellent et le suivi des candidatures très clair.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Alexandre Petit",
    role: "Développeur Full-Stack",
  },
  {
    text: "La collaboration en équipe est fluide. Nous pouvons tous suivre l'avancement des recrutements et partager nos feedbacks facilement.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Camille Bernard",
    role: "Manager RH",
  },
  {
    text: "Les statistiques détaillées nous aident à optimiser nos campagnes de recrutement. Nous savons exactement quelles sources fonctionnent le mieux.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Julie Moreau",
    role: "Analyste Recrutement",
  },
  {
    text: "La recherche avancée de candidats est un atout majeur. Les filtres intelligents nous permettent de trouver le profil idéal en quelques clics.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Pierre Durand",
    role: "Talent Acquisition Manager",
  },
  {
    text: "Le support client est exceptionnel. L'équipe Ylsix nous a accompagnés tout au long de la mise en place et répond toujours rapidement.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Laura Roux",
    role: "DRH",
  },
  {
    text: "Grâce à Ylsix, j'ai trouvé mon emploi actuel en moins de deux semaines. La messagerie intégrée facilite vraiment les échanges avec les recruteurs.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Lucas Simon",
    role: "Chef de Projet Digital",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const faqData = [
  {
    question: "Comment fonctionne la période d'essai gratuite ?",
    answer:
      "Vous bénéficiez de 14 jours d'essai gratuit sur le plan Pro, sans carte bancaire requise. Vous pouvez annuler à tout moment avant la fin de la période d'essai.",
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez passer d'un plan à un autre à tout moment. Les changements sont effectifs immédiatement et la facturation est ajustée au prorata.",
  },
  {
    question: "Quels jobboards sont inclus dans la multi-diffusion ?",
    answer:
      "Notre réseau comprend plus de 160 jobboards majeurs incluant Indeed, LinkedIn, Monster, Glassdoor, et de nombreux sites spécialisés par secteur et région.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Absolument. Nous utilisons un cryptage de niveau bancaire (SSL/TLS) et sommes conformes au RGPD. Vos données sont hébergées en Europe sur des serveurs sécurisés.",
  },
  {
    question: "Comment fonctionne le support client ?",
    answer:
      "Le plan Starter bénéficie d'un support par email sous 48h. Les plans Pro et Entreprise ont accès au support prioritaire 24/7 par chat, email et téléphone.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Non, nos tarifs sont transparents. Le prix affiché inclut toutes les fonctionnalités du plan. Aucun frais d'installation, de formation ou de mise en place.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <button
        onClick={onClick}
        className="flex w-full items-start justify-between gap-4 text-left focus:outline-none group"
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-gray-600 pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);
  const router = useRouter();

  const [modalAction, setModalAction] = useState<"login" | "register">("login");
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);

  const openUserTypeModal = (action: "login" | "register") => {
    setModalAction(action);
    setIsUserTypeModalOpen(true);
  };
  const handleUserTypeSelect = (userType: "candidat" | "recruteur") => {
    setIsUserTypeModalOpen(false);
    if (modalAction === "login") {
      router.push(`/auth/${userType}/login`);
    } else {
      router.push(`/auth/${userType}/register`);
    }
  };
  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <CvRequiredModal />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:h-[800px] bg-center bg-no-repeat bg-cover rounded-lg relative flex items-center justify-start"
        style={{ backgroundImage: "url('/img/hero-image.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 rounded-lg"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white z-30 px-4 sm:px-6 md:px-12 lg:px-20 pb-32 sm:pb-40 md:pb-48 lg:pb-0"
        >
          <p className="text-sm sm:text-base md:text-lg">
            Recrutez des talents ou trouvez votre prochain emploi.
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-[#a590ff] mt-3 md:mt-4">
            Trouvez le candidat idéal
            <br /> pour votre entreprise
          </h1>
          {/* <Link href="/auth/recruteur/login"> */}
          <button
            className="mt-4 sm:mt-6 md:mt-10 btn liquid"
            onClick={() => openUserTypeModal("login")}
          >
            Commencer maintenant
          </button>
          {/* </Link> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="backdrop-blur-custom shadow-lg absolute w-[92%] sm:w-[90%] -bottom-[280px] sm:-bottom-[240px] md:-bottom-44 lg:-bottom-36 left-1/2 -translate-x-1/2 rounded-xl z-30"
        >
          <div className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="flex items-center gap-3">
                <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 opacity-50 shrink-0" />
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold">
                    Recrutez des talents
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Trouvez le candidat idéal
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="w-10 h-10 sm:w-12 sm:h-12 opacity-50 shrink-0" />
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold">
                    Collaborez avec vos équipes
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Facilitez la collaboration
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                <ShieldCheckIcon className="w-10 h-10 sm:w-12 sm:h-12 opacity-50 shrink-0" />
                <div>
                  <p className="text-base sm:text-lg md:text-xl font-bold">
                    Simplifiez votre quotidien
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Gagnez du temps et de l'argent
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-3 md:gap-4">
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black">
                    Diffusez vos offres sur plus de 160 jobboards simultanément
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base mt-1 sm:mt-2 text-gray-600">
                    Maximisez votre visibilité et touchez des milliers de
                    candidats qualifiés en un seul clic.
                  </p>
                </div>
                <div className="w-full md:w-auto mt-3 md:mt-0">
                  <Link href="/recruteur/dashboard">
                    <button className="btn2 liquid w-full md:w-auto whitespace-nowrap">
                      Publier une offre
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Section Statistiques */}
      <div className="mt-[320px] sm:mt-[280px] md:mt-56 lg:mt-52">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ylsix en chiffres
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Des résultats concrets pour nos utilisateurs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-6xl font-bold text-[#a590ff] mb-2">10K+</h3>
                <p className="text-gray-600 text-lg">Recrutements réussis</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-6xl font-bold text-[#a590ff] mb-2">500+</h3>
                <p className="text-gray-600 text-lg">Entreprises clientes</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-6xl font-bold text-[#a590ff] mb-2">40%</h3>
                <p className="text-gray-600 text-lg">Gain de temps moyen</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-6xl font-bold text-[#a590ff] mb-2">160+</h3>
                <p className="text-gray-600 text-lg">Jobboards connectés</p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 md:mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg md:text-xl font-bold text-[#a590ff]">
              Fonctionnalités Avancées
            </h3>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
              Recrutez plus vite, <br /> recrutez mieux
            </h1>

            <p className="mt-6 md:mt-10 text-gray-500 text-sm md:text-base">
              Ylsix vous offre tous les outils nécessaires pour optimiser votre
              processus de recrutement de A à Z. Du sourcing à l'embauche, gérez
              l'ensemble de vos recrutements sur une seule plateforme intuitive
              et performante. Gagnez du temps et de l'efficacité.
            </p>

            <Link href="/offres">
              <button className="mt-6 md:mt-10 btn2 liquid w-full md:w-auto">
                Trouver un emploi
              </button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-[#a590ff] text-white h-52  rounded-lg px-10 py-4"
            >
              <UserIcon className="w-12 h-12 opacity-50" />
              <h1 className="text-2xl font-bold mb-4">Tableau Kanban</h1>
              <p>
                Suivez vos candidatures en temps réel avec un système intuitif
                de drag & drop.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#a590ff] text-white h-52  rounded-lg px-10 py-4 "
            >
              <BriefcaseIcon className="w-12 h-12 opacity-50" />
              <h1 className="text-2xl font-bold mb-4">Multi-diffusion</h1>
              <p>
                Publiez sur 160+ jobboards en un seul clic et maximisez votre
                visibilité.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-[#a590ff] text-white h-52  rounded-lg px-10 py-4 "
            >
              <ShieldCheckIcon className="w-12 h-12 opacity-50" />
              <h1 className="text-2xl font-bold mb-4">Collaboration</h1>
              <p>
                Travaillez en équipe avec un système de permissions et de
                partage avancé.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-[#a590ff] text-white h-52  rounded-lg px-10 py-4 "
            >
              <UserIcon className="w-12 h-12 opacity-50" />
              <h1 className="text-2xl font-bold mb-4">Statistiques</h1>
              <p>
                Analysez vos performances et optimisez vos campagnes de
                recrutement.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <div>
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 className="text-lg md:text-xl font-bold text-[#a590ff]">
              Notre Équipe
            </h3>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
              Une équipe passionnée <br /> d'experts en recrutement
            </h1>
          </motion.div>

          <section className=" py-16 md:py-24 bg-white">
            <div className="px-4 md:px-8 place-items-center grid">
              <div className="mt-12 md:mt-16">
                <ul className="grid w-full grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 ">
                  {teamMembers.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center gap-4 md:gap-5"
                    >
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-primary">
                          {item.name}
                        </h3>
                        <p className="text-md text-[#a590ff]">{item.title}</p>
                        <p className="text-sm text-gray-500 mt-2 max-w-xs">
                          {item.summary}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </section> */}

          <section className=" py-16 lg:py-24 bg-white">
            <div className="mx-auto grid max-w-container grid-cols-1 gap-16 overflow-hidden px-4 md:px-8 lg:grid-cols-2 lg:items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="flex max-w-3xl flex-col items-start"
              >
                <h3 className="text-lg md:text-xl font-bold text-[#a590ff]">
                  Notre Mission
                </h3>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
                  Révolutionner le
                  <br /> recrutement digital
                </h1>
                <p className="mt-6 md:mt-10 text-gray-500 text-sm md:text-base">
                  Notre philosophie est simple : connecter les talents avec les
                  opportunités qui leur correspondent vraiment. Nous croyons en
                  une technologie au service de l'humain pour créer des
                  rencontres professionnelles réussies.
                </p>

                {/* Action Buttons */}
                <div className="mt-6 md:mt-8 flex w-full flex-col sm:flex-row items-stretch gap-3 sm:items-start">
                  <Link href="/contact">
                    <button className="mt-4 md:mt-10 btn2 liquid w-full md:w-auto">
                      Contactez-nous
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Image Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="grid h-122 w-[150%] grid-cols-[repeat(12,1fr)] grid-rows-[repeat(12,1fr)] gap-2 justify-self-center sm:h-124 sm:w-[120%] md:w-auto md:gap-4"
              >
                <img
                  src="https://www.untitledui.com/images/portraits/megan-sims"
                  className="size-full object-cover"
                  alt="Megan Sims"
                  style={{ gridArea: "7 / 5 / 13 / 9" }}
                />
                <img
                  src="https://www.untitledui.com/images/portraits/nic-davidson"
                  className="size-full object-cover"
                  alt="Nic Davidson"
                  style={{ gridArea: "1 / 7 / 7 / 11" }}
                />
                <img
                  src="https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80"
                  className="size-full object-cover"
                  alt="Amelie Laurent"
                  style={{ gridArea: "3 / 3 / 7 / 7" }}
                />
                <img
                  src="https://www.untitledui.com/images/avatars/lily-rose-chedjou?fm=webp&q=80"
                  className="size-full object-cover"
                  alt="Lily-Rose Chedjou"
                  style={{ gridArea: "7 / 9 / 11 / 13" }}
                />
                <img
                  src="https://www.untitledui.com/images/avatars/levi-rocha?fm=webp&q=80"
                  className="size-full object-cover"
                  alt="Levi Rocha"
                  style={{ gridArea: "7 / 1 / 12 / 5" }}
                />
              </motion.div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-20">
        <section className=" my-20 relative">
          <div className="container z-10 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
            >
              <div className="flex justify-center">
                <div className="text-xl font-bold text-[#a590ff]">
                  Témoignages
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
                Ce que disent nos utilisateurs
              </h2>
              <p className="text-center mt-5 opacity-75">
                Découvrez les retours d'expérience de nos clients recruteurs et
                candidats.
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={firstColumn} duration={15} />
              <TestimonialsColumn
                testimonials={secondColumn}
                className="hidden md:block"
                duration={19}
              />
              <TestimonialsColumn
                testimonials={thirdColumn}
                className="hidden lg:block"
                duration={17}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Section Pricing */}
      <div className="mt-16 md:mt-20">
        <section className=" py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h3 className="text-lg md:text-xl font-bold text-[#a590ff] mb-2">
                Tarifs
              </h3>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Des plans adaptés à vos besoins
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Commencez gratuitement, évoluez quand vous êtes prêt
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plan Gratuit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">
                  Pour découvrir la plateforme
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">Gratuit</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>1 offre d'emploi active</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Tableau Kanban basique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Accès à la base candidats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Support par email</span>
                  </li>
                </ul>
                <Link href="/recruteur/dashboard">
                  <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                    Commencer
                  </button>
                </Link>
              </motion.div>

              {/* Plan Pro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className=" rounded-2xl p-8 shadow-2xl  transform scale-105 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-4 py-1 rounded-full text-sm font-bold">
                  Populaire
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className=" mb-6">Pour les recruteurs actifs</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">XXX XOF</span>
                  <span className="">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Offres illimitées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Multi-diffusion sur 160+ jobboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Tableau Kanban avancé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Statistiques détaillées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Support prioritaire 24/7</span>
                  </li>
                </ul>
                <Link href="/recruteur/dashboard">
                  <button className="w-full py-3 px-6 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors">
                    Essayer 14 jours gratuits
                  </button>
                </Link>
              </motion.div>

              {/* Plan Entreprise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-2xl font-bold mb-2">Entreprise</h3>
                <p className="text-gray-600 mb-6">Pour les grandes équipes</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">Sur mesure</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Tout du plan Pro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Utilisateurs illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>API & Intégrations personnalisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Account Manager dédié</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>Formation sur site</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                    Nous contacter
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Section FAQ */}
      <div className="mt-16 md:mt-20">
        <section className=" py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Questions fréquentes
              </h2>
              <p className="text-gray-600 text-base md:text-lg">
                Tout ce que vous devez savoir sur le produit et la facturation.
              </p>
            </div>

            <div className="space-y-2">
              {faqData.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQIndex === index}
                  onClick={() =>
                    setOpenFAQIndex(openFAQIndex === index ? null : index)
                  }
                />
              ))}
            </div>

            {/* Still have questions section */}
            <div className="mt-16 flex flex-col items-center gap-6 rounded-2xl bg-gray-50 px-6 py-10 text-center">
              <div className="flex items-end -space-x-4">
                <img
                  src="https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80"
                  alt="Marco Kelly"
                  className="w-12 h-12 rounded-full object-cover ring-4 ring-white"
                />
                <img
                  src="https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80"
                  alt="Amelie Laurent"
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white z-10"
                />
                <img
                  src="https://www.untitledui.com/images/avatars/jaya-willis?fm=webp&q=80"
                  alt="Jaya Willis"
                  className="w-12 h-12 rounded-full object-cover ring-4 ring-white"
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Vous avez encore des questions ?
                </h4>
                <p className="text-gray-500">
                  Vous ne trouvez pas la réponse que vous cherchez ? N'hésitez
                  pas à contacter notre équipe.
                </p>
              </div>
              <Link href="/contact">
                <button className="px-6 py-3 bg-[#a590ff] hover:bg-[#9580ef] text-white font-semibold rounded-lg transition-colors shadow-sm">
                  Nous contacter
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-20">
        <section className=" my-20 relative">
          <div className="container z-10 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
            >
              <div className="flex justify-center">
                <div className="text-xl font-bold text-[#a590ff]">
                  Prêt à démarrer ?
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
                Rejoignez des milliers d'utilisateurs satisfaits
              </h2>
              <p className="text-center mt-5 text-gray-500">
                Commencez gratuitement et découvrez comment Ylsix peut
                transformer votre recrutement.
              </p>

              <Link href="/auth/recruteur/login">
                <button className=" mt-10 btn2 liquid ">
                  Essayer gratuitement
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Modal de sélection du type d'utilisateur */}
      <Dialog open={isUserTypeModalOpen} onOpenChange={setIsUserTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {modalAction === "login" ? "Connexion" : "Créer un compte"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {modalAction === "login"
                ? "Êtes-vous un candidat ou un recruteur ?"
                : "Quel type de compte souhaitez-vous créer ?"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Option Candidat */}
            <button
              onClick={() => handleUserTypeSelect("candidat")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#a590ff] hover:bg-[#a590ff]/5 transition-all duration-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center group-hover:bg-[#a590ff]/20 transition-colors">
                <User className="w-8 h-8 text-[#a590ff]" />
              </div>
              <span className="font-semibold text-gray-900">Candidat</span>
              <span className="text-xs text-gray-500 text-center">
                Je cherche un emploi
              </span>
            </button>

            {/* Option Recruteur */}
            <button
              onClick={() => handleUserTypeSelect("recruteur")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#a590ff] hover:bg-[#a590ff]/5 transition-all duration-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center group-hover:bg-[#a590ff]/20 transition-colors">
                <Briefcase className="w-8 h-8 text-[#a590ff]" />
              </div>
              <span className="font-semibold text-gray-900">Recruteur</span>
              <span className="text-xs text-gray-500 text-center">
                Je recrute des talents
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
