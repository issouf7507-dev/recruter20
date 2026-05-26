"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqData = [
  { question: "Comment fonctionne la période d'essai gratuite ?", answer: "Vous bénéficiez de 14 jours d'essai gratuit sur le plan Pro, sans carte bancaire requise. Vous pouvez annuler à tout moment avant la fin de la période d'essai." },
  { question: "Puis-je changer de plan à tout moment ?", answer: "Oui, vous pouvez passer d'un plan à un autre à tout moment. Les changements sont effectifs immédiatement et la facturation est ajustée au prorata." },
  { question: "Quels jobboards sont inclus dans la multi-diffusion ?", answer: "Notre réseau comprend plus de 160 jobboards majeurs incluant Indeed, LinkedIn, Monster, Glassdoor, et de nombreux sites spécialisés par secteur et région." },
  { question: "Mes données sont-elles sécurisées ?", answer: "Absolument. Nous utilisons un cryptage de niveau bancaire (SSL/TLS) et sommes conformes au RGPD. Vos données sont hébergées en Europe sur des serveurs sécurisés." },
  { question: "Comment fonctionne le support client ?", answer: "Le plan Starter bénéficie d'un support par email sous 48h. Les plans Pro et Entreprise ont accès au support prioritaire 24/7 par chat, email et téléphone." },
  { question: "Y a-t-il des frais cachés ?", answer: "Non, nos tarifs sont transparents. Le prix affiché inclut toutes les fonctionnalités du plan. Aucun frais d'installation, de formation ou de mise en place." },
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <button onClick={onClick} className="flex w-full items-start justify-between gap-4 text-left focus:outline-none group">
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
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

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-16 md:mt-20">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-gray-600 text-base md:text-lg">Tout ce que vous devez savoir sur le produit et la facturation.</p>
          </div>

          <div className="space-y-2">
            {faqData.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-6 rounded-2xl bg-gray-50 px-6 py-10 text-center">
            <div className="flex items-end -space-x-4">
              {[
                { src: "https://www.untitledui.com/images/avatars/marco-kelly?fm=webp&q=80", alt: "Marco Kelly", cls: "w-12 h-12" },
                { src: "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80", alt: "Amelie Laurent", cls: "w-14 h-14 z-10" },
                { src: "https://www.untitledui.com/images/avatars/jaya-willis?fm=webp&q=80", alt: "Jaya Willis", cls: "w-12 h-12" },
              ].map((img) => (
                <Image key={img.alt} src={img.src} alt={img.alt} width={56} height={56} className={`${img.cls} rounded-full object-cover ring-4 ring-white`} />
              ))}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Vous avez encore des questions ?</h4>
              <p className="text-gray-500">Vous ne trouvez pas la réponse que vous cherchez ? N'hésitez pas à contacter notre équipe.</p>
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
  );
}
