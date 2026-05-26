"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTASection() {
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
            <div className="text-xl font-bold text-[#a590ff]">Prêt à démarrer ?</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
              Rejoignez des milliers d'utilisateurs satisfaits
            </h2>
            <p className="text-center mt-5 text-gray-500">
              Commencez gratuitement et découvrez comment Ylsix peut transformer votre recrutement.
            </p>
            <Link href="/auth/recruteur/login">
              <button className="mt-10 btn2 liquid">Essayer gratuitement</button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
