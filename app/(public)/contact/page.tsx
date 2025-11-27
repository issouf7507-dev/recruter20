"use client";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Notre équipe vous répond sous 24h",
    contact: "contact@ylsix.com",
    link: "mailto:contact@ylsix.com",
  },
  {
    icon: Phone,
    title: "Téléphone",
    description: "Lun-Ven 9h-18h",
    contact: "+225 0544659490",
    link: "tel:+2250544659490",
  },
  {
    icon: MapPin,
    title: "Adresse",
    description: "Visitez nos bureaux",
    contact: "Cocody- Abatta ( Abidjan - Cote d'Ivoire)",
    link: "https://maps.google.com",
  },
];

const faqs = [
  {
    question: "Comment publier une offre d'emploi ?",
    answer:
      "Créez un compte recruteur, complétez votre profil entreprise, puis cliquez sur 'Publier une offre'. Suivez les étapes et votre offre sera en ligne en quelques minutes.",
  },
  {
    question: "Combien coûte la publication d'une offre ?",
    answer:
      "Nous proposons un plan gratuit avec 3 offres, et des plans payants à partir de 99€/mois pour des offres illimitées. Consultez notre page Tarifs pour plus de détails.",
  },
  {
    question: "Comment puis-je voir les candidatures ?",
    answer:
      "Toutes vos candidatures sont accessibles depuis votre tableau de bord recruteur. Vous recevez également des notifications par email pour chaque nouvelle candidature.",
  },
  {
    question: "Puis-je modifier une offre après publication ?",
    answer:
      "Oui, vous pouvez modifier vos offres à tout moment depuis votre espace recruteur. Les modifications sont appliquées immédiatement.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi du formulaire
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);

    // Réinitialiser le formulaire après 3 secondes
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className=" bg-[#a590ff] py-16 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Une question ? Une demande particulière ? Notre équipe est là pour
              vous aider.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.link}
              target={method.link.startsWith("http") ? "_blank" : undefined}
              rel={
                method.link.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6  "
            >
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <method.icon className="w-6 h-6 text-[#a590ff]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{method.description}</p>
              <p className="text-[#a590ff] font-semibold">{method.contact}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#a590ff]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Envoyez-nous un message
              </h2>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Message envoyé !
                </h3>
                <p className="text-gray-600">
                  Nous avons bien reçu votre message et nous vous répondrons
                  dans les plus brefs délais.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent transition-colors"
                      placeholder="jean@exemple.fr"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent transition-colors"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent transition-colors"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="sales">Question commerciale</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent transition-colors resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#a590ff] hover:bg-[#9580ef] text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Office Hours */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#a590ff]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Horaires d'ouverture
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">
                    Lundi - Vendredi
                  </span>
                  <span className="text-gray-900 font-semibold">
                    9h00 - 18h00
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Samedi</span>
                  <span className="text-gray-900 font-semibold">
                    10h00 - 16h00
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Dimanche</span>
                  <span className="text-gray-500">Fermé</span>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-[#a590ff]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Questions fréquentes
                </h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <summary className="cursor-pointer p-4 hover:bg-gray-50 transition-colors font-semibold text-gray-900 flex items-center justify-between">
                      {faq.question}
                      <span className="text-[#a590ff] group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="p-4 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-[#a590ff] mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">
                    123 Avenue des Champs-Élysées
                  </p>
                  <p className="text-gray-600">75008 Paris, France</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
