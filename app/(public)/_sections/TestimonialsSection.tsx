"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/public/TestimonialsColumns";

const testimonials = [
  { text: "Ylsix a révolutionné notre processus de recrutement. Le tableau Kanban nous permet de suivre chaque candidature en temps réel. Nous avons réduit notre temps de recrutement de 40%.", image: "https://randomuser.me/api/portraits/women/1.jpg", name: "Sophie Martin", role: "Directrice RH" },
  { text: "La mise en place a été rapide et intuitive. L'interface est moderne et nos équipes l'ont adoptée immédiatement. Un vrai gain de productivité !", image: "https://randomuser.me/api/portraits/men/2.jpg", name: "Thomas Dubois", role: "Responsable Recrutement" },
  { text: "Le système de multi-diffusion sur 160+ jobboards nous fait gagner un temps précieux. Plus besoin de publier manuellement sur chaque plateforme !", image: "https://randomuser.me/api/portraits/women/3.jpg", name: "Marie Leroy", role: "Chargée de Recrutement" },
  { text: "En tant que candidat, j'ai adoré la simplicité de la plateforme. Le générateur de CV est excellent et le suivi des candidatures très clair.", image: "https://randomuser.me/api/portraits/men/4.jpg", name: "Alexandre Petit", role: "Développeur Full-Stack" },
  { text: "La collaboration en équipe est fluide. Nous pouvons tous suivre l'avancement des recrutements et partager nos feedbacks facilement.", image: "https://randomuser.me/api/portraits/women/5.jpg", name: "Camille Bernard", role: "Manager RH" },
  { text: "Les statistiques détaillées nous aident à optimiser nos campagnes de recrutement. Nous savons exactement quelles sources fonctionnent le mieux.", image: "https://randomuser.me/api/portraits/women/6.jpg", name: "Julie Moreau", role: "Analyste Recrutement" },
  { text: "La recherche avancée de candidats est un atout majeur. Les filtres intelligents nous permettent de trouver le profil idéal en quelques clics.", image: "https://randomuser.me/api/portraits/men/7.jpg", name: "Pierre Durand", role: "Talent Acquisition Manager" },
  { text: "Le support client est exceptionnel. L'équipe Ylsix nous a accompagnés tout au long de la mise en place et répond toujours rapidement.", image: "https://randomuser.me/api/portraits/women/8.jpg", name: "Laura Roux", role: "DRH" },
  { text: "Grâce à Ylsix, j'ai trouvé mon emploi actuel en moins de deux semaines. La messagerie intégrée facilite vraiment les échanges avec les recruteurs.", image: "https://randomuser.me/api/portraits/men/9.jpg", name: "Lucas Simon", role: "Chef de Projet Digital" },
];

export function TestimonialsSection() {
  return (
    <div className="mt-20">
      <section className="my-20 relative">
        <div className="container z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
          >
            <div className="text-xl font-bold text-[#a590ff]">Témoignages</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-center mt-5 opacity-75">
              Découvrez les retours d'expérience de nos clients recruteurs et candidats.
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={testimonials.slice(0, 3)} duration={15} />
            <TestimonialsColumn testimonials={testimonials.slice(3, 6)} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={testimonials.slice(6, 9)} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>
    </div>
  );
}
