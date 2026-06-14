"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PaymentButton } from "@/components/shared/PaymentButton";
import { PLAN_LIST, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { BookOpen, Users, Megaphone, ChevronRight } from "lucide-react";

const OTHER_PILLARS = [
  {
    icon: BookOpen,
    title: "CVthèque Premium",
    description: "Accédez à la base de talents panafricaine. À partir de 10 000 FCFA / mois.",
    href: "/tarifs?tab=cvtheque",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    title: "Recrutement à succès",
    description: "Cabinet digital : vous ne payez qu'à la réussite. Dès 150 000 FCFA.",
    href: "/tarifs?tab=recrutement",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    icon: Megaphone,
    title: "Publicité RH",
    description: "Offres sponsorisées, bannières, newsletter RH. Dès 10 000 FCFA.",
    href: "/tarifs?tab=publicite",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
];

export function PricingSection() {
  return (
    <div className="mt-16 md:mt-20">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-lg md:text-xl font-bold text-[#a590ff] mb-2">Tarifs ATS SaaS</h3>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Des plans adaptés à vos besoins</h2>
            <p className="text-gray-600 text-base md:text-lg">Commencez gratuitement, évoluez quand vous êtes prêt</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {PLAN_LIST.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "rounded-2xl p-8 transition-shadow relative",
                  plan.popular
                    ? "shadow-2xl scale-105 bg-white border-2 border-[#a590ff]"
                    : "bg-white shadow-lg border border-gray-200 hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-4 py-1 rounded-full text-sm font-bold">
                    Populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-5xl font-bold">Gratuit</span>
                  ) : (
                    <>
                      <span className="text-4xl md:text-5xl font-bold">
                        {plan.price.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span>/{plan.period}</span>
                    </>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#a590ff] mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {plan.id === "decouverte" ? (
                  <Link href="/auth/recruteur/register">
                    <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                      Commencer gratuitement
                    </button>
                  </Link>
                ) : (
                  <PaymentButton planId={plan.id as Exclude<PlanId, "decouverte">}>
                    S'abonner
                  </PaymentButton>
                )}
              </motion.div>
            ))}
          </div>

          {/* 3 autres piliers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Découvrez aussi nos autres services</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {OTHER_PILLARS.map((pillar) => (
                <Link key={pillar.title} href={pillar.href}>
                  <div className={`rounded-xl p-5 border-2 ${pillar.color} hover:shadow-md transition-all group cursor-pointer`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <pillar.icon className={`w-5 h-5 ${pillar.iconColor}`} />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{pillar.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{pillar.description}</p>
                    <span className="text-xs font-semibold text-[#a590ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Voir les tarifs <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
