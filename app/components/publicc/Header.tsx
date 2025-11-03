"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { getCandidat } from "@/action/getCandidat";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { CandidatSheet } from "./CandidatSheet";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCandidatSheetOpen, setIsCandidatSheetOpen] = useState(false);

  const links = [
    {
      label: "Offres d'emploi",
      href: "/offres",
    },
    {
      label: "Fonctionnalités",
      href: "/fonctionnalites",
    },
    {
      label: "Tarifs",
      href: "/tarifs",
    },

    {
      label: "À propos",
      href: "/a-propos",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  const pathname = usePathname();

  const isOffreDetail = pathname.startsWith("/offres/");

  const { candidat, handleSignOut } = useCandidat();

  return (
    <header
      className={`fixed top-0 left-0 right-0 border-gray-200 z-50  ${
        pathname == "/a-propos" ||
        isOffreDetail ||
        pathname == "/offres" ||
        pathname == "/fonctionnalites" ||
        pathname == "/contact"
          ? "bg-[#a590ff]"
          : "bg-white "
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-[#a590ff] transition-colors"
            >
              Ylsix
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium ${
                  pathname == "/a-propos" ||
                  isOffreDetail ||
                  pathname == "/offres" ||
                  pathname == "/fonctionnalites" ||
                  pathname == "/contact"
                    ? "text-white hover:text-white"
                    : "text-black hover:text-[#a590ff]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          {!candidat ? (
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/auth/recruteur/login">
                <button
                  className={`border rounded-full cursor-pointerborder-[#a590ff] text-[#a590ff] px-6 py-2 hover:bg-[#a590ff] hover:text-white transition-colors font-medium ${
                    pathname == "/a-propos" ||
                    pathname == "/fonctionnalites" ||
                    pathname == "/contact" ||
                    isOffreDetail ||
                    pathname == "/offres"
                      ? "bg-[#ffff] text-[#a590ff]"
                      : ""
                  }`}
                >
                  Se connecter
                </button>
              </Link>
              <Link href="/auth/recruteur/register">
                <button
                  className={`rounded-full cursor-pointer bg-[#a590ff]  px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium ${
                    pathname == "/a-propos" ||
                    isOffreDetail ||
                    pathname == "/offres" ||
                    pathname == "/fonctionnalites" ||
                    pathname == "/contact"
                      ? "bg-[#ffff] text-[#a590ff]"
                      : "text-white"
                  }`}
                >
                  Commencer
                </button>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => setIsCandidatSheetOpen(true)}
                className="rounded-full cursor-pointer bg-[#a590ff] text-white px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium"
              >
                Mon espace candidat
              </button>
              <button
                className="rounded-full cursor-pointer bg-[#a590ff] text-white px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium"
                onClick={() => handleSignOut()}
              >
                Se déconnecter
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#a590ff] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#a590ff] transition-colors font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
              <Link href="/auth/recruteur/login">
                <button
                  className={
                    "w-full border rounded-full border-[#a590ff] text-[#a590ff] px-6 py-3 hover:bg-[#a590ff] hover:text-white transition-colors font-medium"
                  }
                >
                  Se connecter
                </button>
              </Link>
              <Link href="/auth/recruteur/register">
                <button className="w-full rounded-full bg-[#a590ff] text-white px-6 py-3 hover:bg-[#9580ef] transition-colors font-medium">
                  Commencer gratuitement
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <CandidatSheet
        open={isCandidatSheetOpen}
        onOpenChange={setIsCandidatSheetOpen}
      />
    </header>
  );
};

export default Header;
