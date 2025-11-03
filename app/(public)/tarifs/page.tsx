"use client";
import { motion } from "framer-motion";
import { Check, X, Zap, Users, Building2, Crown, Mail } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Gratuit",
    description: "Pour découvrir la plateforme",
    price: "0",
    period: "gratuit",
    icon: Users,
    color: "gray",
    features: [
      { text: "Publier jusqu'à 3 offres", included: true },
      { text: "Accès au vivier de candidats", included: true },
      { text: "Réception de candidatures", included: true },
      { text: "Support par email", included: true },
      { text: "Mise en avant des offres", included: false },
      { text: "Statistiques avancées", included: false },
      { text: "Support prioritaire", included: false },
      { text: "Gestionnaire de compte dédié", included: false },
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Professionnel",
    description: "Pour les recruteurs actifs",
    price: "99",
    period: "mois",
    icon: Building2,
    color: "purple",
    features: [
      { text: "Offres illimitées", included: true },
      { text: "Accès au vivier de candidats", included: true },
      { text: "Réception de candidatures", included: true },
      { text: "Support par email", included: true },
      { text: "Mise en avant des offres", included: true },
      { text: "Statistiques avancées", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Gestionnaire de compte dédié", included: false },
    ],
    cta: "Commencer l'essai gratuit",
    popular: true,
  },
  {
    name: "Entreprise",
    description: "Pour les grandes organisations",
    price: "Sur mesure",
    period: "",
    icon: Crown,
    color: "gold",
    features: [
      { text: "Offres illimitées", included: true },
      { text: "Accès au vivier de candidats", included: true },
      { text: "Réception de candidatures", included: true },
      { text: "Support par email", included: true },
      { text: "Mise en avant des offres", included: true },
      { text: "Statistiques avancées", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Gestionnaire de compte dédié", included: true },
    ],
    cta: "Nous contacter",
    popular: false,
  },
];

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez changer de plan à tout moment. Les modifications sont appliquées immédiatement et le prix est proratisé.",
  },
  {
    question: "Y a-t-il une période d'essai gratuite ?",
    answer:
      "Oui, tous nos plans payants incluent une période d'essai gratuite de 14 jours. Aucune carte bancaire n'est requise pour commencer.",
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons toutes les cartes bancaires majeures (Visa, Mastercard, American Express), ainsi que les virements bancaires pour les plans Entreprise.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel. Aucun engagement, aucune pénalité.",
  },
  {
    question: "Offrez-vous des réductions pour les associations ?",
    answer:
      "Oui, nous offrons des tarifs préférentiels pour les associations et organisations à but non lucratif. Contactez-nous pour plus d'informations.",
  },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center bg-no-repeat py-12 md:py-32"
        style={{
          backgroundImage: "url('/img/banniereweb_1.png')",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-black"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Choisissez votre plan
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Des tarifs simples et transparents pour tous les besoins.
              Commencez gratuitement et évoluez à votre rythme.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl  p-8 border-2 transition-all  ${
                plan.popular
                  ? "border-[#a590ff] scale-105 md:scale-110"
                  : "border-gray-200 hover:border-[#a590ff]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Plus populaire
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center `}
                >
                  <plan.icon className={`w-6 h-6 text-[#a590ff]`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.name}s
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  {plan.price === "Sur mesure" ? (
                    <span className="text-4xl font-bold text-gray-900">
                      Sur mesure
                    </span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price}€
                      </span>
                      {plan.period && (
                        <span className="text-gray-600">/ {plan.period}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-[#a590ff] shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 rounded-full font-semibold text-lg transition-all ${
                  plan.popular
                    ? "bg-[#a590ff] text-white hover:bg-[#9580ef] shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 bg-white rounded-2xl border border-gray-200 p-8 md:p-12 max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Toutes les fonctionnalités
            </h2>
            <p className="text-lg text-gray-600">
              Des outils puissants pour recruter efficacement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Zap,
                title: "Publication rapide",
                description:
                  "Créez et publiez vos offres en quelques clics avec notre interface intuitive",
              },
              {
                icon: Users,
                title: "Gestion des candidats",
                description:
                  "Suivez et gérez toutes vos candidatures depuis un seul tableau de bord",
              },
              {
                icon: Building2,
                title: "Page entreprise",
                description:
                  "Créez votre page entreprise personnalisée pour attirer les meilleurs talents",
              },
              {
                icon: Mail,
                title: "Notifications email",
                description:
                  "Recevez des notifications instantanées pour chaque nouvelle candidature",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-[#a590ff]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-gray-600">
              Vous avez des questions ? Nous avons les réponses.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl border border-gray-200 p-6  transition-shadow"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-24  bg-[#a590ff]  rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des centaines d'entreprises qui font confiance à
            Recruteur20 pour leurs recrutements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#a590ff] px-8 py-2 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors ">
              Commencer gratuitement
            </button>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-2 rounded-full font-semibold text-lg hover:bg-white hover:text-[#a590ff] transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
