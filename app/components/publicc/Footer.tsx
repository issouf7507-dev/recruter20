import Link from "next/link";
import React from "react";
import Image from "next/image";

const Footer = () => {
  const navigationLinks = [
    { label: "Offres d'emploi", href: "/offres" },
    { label: "Fonctionnalités", href: "/fonctionnalites" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "X (Twitter)",
      href: "https://x.com/",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 22"
          fill="none"
          aria-label="X (formerly Twitter)"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.9455 22L10.396 14.0901L3.44886 22H0.509766L9.09209 12.2311L0.509766 0H8.05571L13.286 7.45502L19.8393 0H22.7784L14.5943 9.31648L23.4914 22H15.9455ZM19.2185 19.77H17.2398L4.71811 2.23H6.6971L11.7121 9.25316L12.5793 10.4719L19.2185 19.77Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-label="LinkedIn"
        >
          <path
            d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5563 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2938 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516V20.4516Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-label="Facebook"
        >
          <path
            d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-label="GitHub"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[#a590ff] py-12 md:pt-16 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col justify-between gap-x-8 gap-y-12 lg:flex-row">
          {/* Logo et description */}
          <div className="flex flex-col gap-8 md:items-start">
            <div className="flex w-full flex-col gap-6 md:max-w-xs md:gap-8">
              <Link
                href="/"
                className="text-2xl font-bold text-white hover:text-white/90 transition-colors"
              >
                <Image
                  src="/img/icon2.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </Link>
              <p className="text-white/80 text-sm md:text-base">
                La plateforme de recrutement qui connecte les talents avec les
                opportunités. Recrutez plus vite, recrutez mieux.
              </p>
            </div>

            {/* Navigation */}
            <nav>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/90 hover:text-white transition-colors text-sm md:text-base font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col gap-4">
            <p className="text-white font-semibold text-lg">
              Prêt à commencer ?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/recruteur/register">
                <button className="bg-white text-[#a590ff] px-6 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">
                  Créer un compte
                </button>
              </Link>
              <Link href="/auth/recruteur/login">
                <button className="border border-white text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white/10 transition-colors whitespace-nowrap">
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 flex flex-col-reverse justify-between gap-6 border-t border-white/20 pt-8 md:mt-16 md:flex-row md:items-center">
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()} Ylsix. Tous droits réservés.
          </p>

          {/* Social links */}
          <ul className="flex gap-5">
            {socialLinks.map((social) => (
              <li key={social.name}>
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex text-white/80 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
