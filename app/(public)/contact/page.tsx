"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  HelpCircle,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

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
    contact: "+225 05 44 65 94 90",
    link: "tel:+2250544659490",
  },
  {
    icon: MapPin,
    title: "Adresse",
    description: "Visitez nos bureaux",
    contact: "Cocody-Abatta, Abidjan — Côte d'Ivoire",
    link: "https://maps.google.com/?q=Cocody+Abatta+Abidjan",
  },
];

const HORAIRES = [
  { jour: "Lundi - Vendredi", heures: "9h00 - 18h00" },
  { jour: "Samedi", heures: "10h00 - 16h00" },
  { jour: "Dimanche", heures: "Fermé", ferme: true },
];

const faqs = [
  {
    question: "Comment publier une offre d'emploi ?",
    answer:
      "Créez un compte recruteur, complétez votre profil entreprise, puis cliquez sur « Publier une offre ». Suivez les étapes et votre offre sera en ligne en quelques minutes.",
  },
  {
    question: "Combien coûte la publication d'une offre ?",
    answer:
      "Le plan Découverte est gratuit. Les plans payants démarrent ensuite selon vos besoins en offres et en fonctionnalités — le détail est sur la page Tarifs, en FCFA.",
  },
  {
    question: "Comment puis-je voir les candidatures ?",
    answer:
      "Toutes vos candidatures sont accessibles depuis votre tableau de bord recruteur. Vous recevez également une notification par email à chaque nouvelle candidature.",
  },
  {
    question: "Puis-je modifier une offre après publication ?",
    answer:
      "Oui, vous pouvez modifier vos offres à tout moment depuis votre espace recruteur. Les modifications sont appliquées immédiatement.",
  },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "", // honeypot
};

const fieldStyle = {
  background: "var(--y-bg-soft)",
  color: "var(--y-ink)",
  boxShadow: "inset 0 0 0 1px var(--y-line)",
};

export default function ContactPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error ?? "L'envoi a échoué. Réessayez ou écrivez-nous à contact@ylsix.com.");
        return;
      }

      setSubmitted(true);
      setFormData(INITIAL_FORM);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pb-24" style={{ background: "var(--y-bg)" }}>
      {/* ── Héros ── */}
      <section className="pt-28 px-6 md:px-12 lg:px-20">
        <div
          className="relative overflow-hidden max-w-7xl mx-auto rounded-[32px] px-8 md:px-12 py-14 md:py-20 text-center"
          style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
        >
          <div
            className="yl-orb"
            style={{ width: 400, height: 400, top: -160, left: -100, background: "rgba(255,255,255,0.14)" }}
          />
          <div
            className="yl-stripes absolute opacity-40"
            style={{ width: 140, height: 140, bottom: -40, right: 32, borderRadius: 24 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <p className="text-sm font-semibold" style={{ color: "#e0d6ff" }}>
              Nous écrire
            </p>
            <h1
              className="mt-3 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em]"
              style={{ color: "#fff" }}
            >
              Contactez-nous
            </h1>
            <p className="mt-5 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.78)" }}>
              Une question, un besoin de recrutement, un partenariat ? Notre équipe basée à
              Abidjan vous répond sous 24 heures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Moyens de contact ── */}
      <section className="px-6 md:px-12 lg:px-20 -mt-10 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.link}
              target={method.link.startsWith("http") ? "_blank" : undefined}
              rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-md)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
              >
                <method.icon size={22} />
              </div>
              <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                {method.title}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--y-ink-3)" }}>
                {method.description}
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: "var(--y-primary-700)" }}>
                {method.contact}
              </p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Formulaire + infos ── */}
      <section className="mt-20 md:mt-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-start">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl p-7 md:p-10"
            style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
          >
            <div className="flex items-center gap-4 mb-7">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
              >
                <MessageSquare size={22} />
              </div>
              <h2
                className="text-2xl md:text-3xl font-semibold tracking-[-0.02em]"
                style={{ color: "var(--y-ink)" }}
              >
                Envoyez-nous un message
              </h2>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-8 text-center"
                style={{ background: "rgba(22,163,74,0.08)", boxShadow: "inset 0 0 0 1px rgba(22,163,74,0.2)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-white"
                  style={{ background: "var(--y-success)" }}
                >
                  <Check size={26} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: "var(--y-ink)" }}>
                  Message envoyé
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--y-ink-2)" }}>
                  Nous avons bien reçu votre message et vous répondrons sous 24 heures ouvrées.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-medium"
                  style={{ color: "var(--y-primary-700)" }}
                >
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl p-4"
                    style={{ background: "rgba(220,38,38,0.07)", boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.2)" }}
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <span className="text-sm" style={{ color: "var(--y-ink-2)" }}>
                      {error}
                    </span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--y-ink-2)" }}
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
                    placeholder="Awa Koné"
                    className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-shadow focus:ring-2"
                    style={fieldStyle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--y-ink-2)" }}
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
                      placeholder="awa@exemple.ci"
                      className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-shadow focus:ring-2"
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--y-ink-2)" }}
                    >
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+225 07 00 00 00 00"
                      className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-shadow focus:ring-2"
                      style={fieldStyle}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--y-ink-2)" }}
                  >
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-shadow focus:ring-2 appearance-none"
                    style={fieldStyle}
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
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--y-ink-2)" }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Décrivez votre demande…"
                    className="w-full p-4 rounded-xl text-sm outline-none resize-none transition-shadow focus:ring-2"
                    style={fieldStyle}
                  />
                </div>

                {/* Honeypot anti-bot — masqué aux utilisateurs et aux lecteurs d'écran */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-full text-sm font-medium text-white flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)",
                    boxShadow: "var(--y-shadow-violet)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Envoyer le message
                    </>
                  )}
                </button>

                <p className="text-xs text-center" style={{ color: "var(--y-ink-4)" }}>
                  Vos données servent uniquement à traiter votre demande.
                </p>
              </form>
            )}
          </motion.div>

          {/* Infos complémentaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            {/* Horaires */}
            <div
              className="rounded-3xl p-7 md:p-8"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                >
                  <Clock size={20} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                  Horaires d&apos;ouverture
                </h2>
              </div>
              <div className="flex flex-col">
                {HORAIRES.map((h, i) => (
                  <div
                    key={h.jour}
                    className="flex justify-between items-center py-3"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--y-line)" }}
                  >
                    <span className="text-sm" style={{ color: "var(--y-ink-2)" }}>
                      {h.jour}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: h.ferme ? "var(--y-ink-4)" : "var(--y-ink)" }}
                    >
                      {h.heures}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div
              className="rounded-3xl p-7 md:p-8"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                >
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                  Questions fréquentes
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl overflow-hidden">
                    <summary
                      className="cursor-pointer list-none px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-medium rounded-2xl transition-colors"
                      style={{ background: "var(--y-bg-soft)", color: "var(--y-ink)" }}
                    >
                      {faq.question}
                      <ChevronDown
                        size={16}
                        className="shrink-0 transition-transform group-open:rotate-180"
                        style={{ color: "var(--y-primary-700)" }}
                      />
                    </summary>
                    <p
                      className="px-4 pt-3 pb-2 text-sm leading-relaxed"
                      style={{ color: "var(--y-ink-2)" }}
                    >
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>

              <Link
                href="/tarifs"
                className="mt-6 inline-flex text-sm font-medium"
                style={{ color: "var(--y-primary-700)" }}
              >
                Voir le détail des tarifs →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
