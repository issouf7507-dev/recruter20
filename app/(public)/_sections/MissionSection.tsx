"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const images = [
  { src: "https://www.untitledui.com/images/portraits/megan-sims", alt: "Megan Sims", area: "7 / 5 / 13 / 9" },
  { src: "https://www.untitledui.com/images/portraits/nic-davidson", alt: "Nic Davidson", area: "1 / 7 / 7 / 11" },
  { src: "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80", alt: "Amelie Laurent", area: "3 / 3 / 7 / 7" },
  { src: "https://www.untitledui.com/images/avatars/lily-rose-chedjou?fm=webp&q=80", alt: "Lily-Rose Chedjou", area: "7 / 9 / 11 / 13" },
  { src: "https://www.untitledui.com/images/avatars/levi-rocha?fm=webp&q=80", alt: "Levi Rocha", area: "7 / 1 / 12 / 5" },
];

export function MissionSection() {
  return (
    <div className="mt-16 md:mt-20">
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto grid max-w-container grid-cols-1 gap-16 overflow-hidden px-4 md:px-8 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex max-w-3xl flex-col items-start"
          >
            <h3 className="text-lg md:text-xl font-bold text-[#a590ff]">Notre Mission</h3>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
              Révolutionner le
              <br /> recrutement digital
            </h1>
            <p className="mt-6 md:mt-10 text-gray-500 text-sm md:text-base">
              Notre philosophie est simple : connecter les talents avec les opportunités qui leur correspondent
              vraiment. Nous croyons en une technologie au service de l'humain pour créer des rencontres
              professionnelles réussies.
            </p>
            <div className="mt-6 md:mt-8 flex w-full flex-col sm:flex-row items-stretch gap-3 sm:items-start">
              <Link href="/contact">
                <button className="mt-4 md:mt-10 btn2 liquid w-full md:w-auto">Contactez-nous</button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid h-122 w-[150%] grid-cols-[repeat(12,1fr)] grid-rows-[repeat(12,1fr)] gap-2 justify-self-center sm:h-124 sm:w-[120%] md:w-auto md:gap-4"
          >
            {images.map((img) => (
              <Image
                key={img.alt}
                src={img.src}
                alt={img.alt}
                width={300}
                height={300}
                className="size-full object-cover"
                style={{ gridArea: img.area }}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
