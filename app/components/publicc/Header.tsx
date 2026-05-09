"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X, User, Briefcase, Upload, ExternalLink, Plus, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { getCandidat } from "@/action/getCandidat";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { CandidatSheet } from "./CandidatSheet";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "sonner";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCandidatSheetOpen, setIsCandidatSheetOpen] = useState(false);
  const [cvSheet, setCvSheet] = useState(false)
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"login" | "register">("login");
  const router = useRouter();

  const openUserTypeModal = (action: "login" | "register") => {
    setModalAction(action);
    setIsUserTypeModalOpen(true);
  };

  const handleUserTypeSelect = (userType: "candidat" | "recruteur") => {
    setIsUserTypeModalOpen(false);
    if (modalAction === "login") {
      router.push(`/auth/${userType}/login`);
    } else {
      router.push(`/auth/${userType}/register`);
    }
  };

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

  // const { data: session } = useSession(); 
  const { edgestore } = useEdgeStore();
  const queryClient = useQueryClient();

  // const [documents, setDocuments] = useState<{ documentType: string }[]>([]);

  const [uploading, setUploading] = useState(false);
  // const hasCv = documents.some((d) => d.documentType === "cv");



  const handleUpload = async (file: File) => {
    if (!candidat?.id) return;
    setUploading(true);
    try {
      const res = await edgestore.publicFiles.upload({ file });
      const response = await fetch(`/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidatId: candidat.id,
          fileName: file.name,
          fileUrl: res.url,
          fileType: file.type,
          fileSize: file.size,
          documentType: "cv",
        }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["documents", candidat.id] });
        const resDocs = await fetch(`/api/candidats/${candidat.id}/documents`);
        const dataDocs = await resDocs.json();
        const newDocs = dataDocs.success ? dataDocs.data : [];
        // setDocuments(newDocs);
        toast.success("CV enregistré. Vous pouvez continuer.");
        // setShowModal(false);
        setCvSheet(false)
      } else {
        const err = await response.json();
        toast.error(err.error || "Erreur lors de l'upload du CV");
      }
    } catch (e) {
      console.error(e);
      toast.error("Une erreur est survenue lors du téléchargement du CV");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
      handleUpload(file);
    } else if (file) {
      toast.error("Format accepté : PDF, DOC ou DOCX");
    }
    e.target.value = "";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 border-gray-200 z-50  ${pathname == "/a-propos" ||
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
              <Image src="/img/icon2.png" alt="Logo" width={100} height={100} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium ${pathname == "/a-propos" ||
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
              <button
                onClick={() => openUserTypeModal("login")}
                className={`border rounded-full cursor-pointer border-[#a590ff] text-[#a590ff] px-6 py-2 hover:bg-[#a590ff] hover:text-white transition-colors font-medium ${pathname == "/a-propos" ||
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
              <button
                onClick={() => openUserTypeModal("register")}
                className={`rounded-full cursor-pointer bg-[#a590ff] px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium ${pathname == "/a-propos" ||
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
                onClick={() => setCvSheet(true)}
                className="rounded-full cursor-pointer bg-[#a590ff] text-white px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium"
              >
                Charger mon CV
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
              {!candidat ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openUserTypeModal("login");
                    }}
                    className="w-full border rounded-full border-[#a590ff] text-[#a590ff] px-6 py-3 hover:bg-[#a590ff] hover:text-white transition-colors font-medium"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openUserTypeModal("register");
                    }}
                    className="w-full rounded-full bg-[#a590ff] text-white px-6 py-3 hover:bg-[#9580ef] transition-colors font-medium"
                  >
                    Commencer gratuitement
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsCandidatSheetOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded-full bg-[#a590ff] text-white px-6 py-3 hover:bg-[#9580ef] transition-colors font-medium"
                  >
                    Mon espace candidat
                  </button>
                  <button
                    onClick={() => setCvSheet(true)}
                    className="rounded-full cursor-pointer bg-[#a590ff] text-white px-6 py-2 hover:bg-[#9580ef] transition-colors font-medium"
                  >
                    Charger mon CV
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded-full bg-[#a590ff] text-white px-6 py-3 hover:bg-[#9580ef] transition-colors font-medium"
                  >
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <CandidatSheet
        open={isCandidatSheetOpen}
        onOpenChange={setIsCandidatSheetOpen}
      />

      {/* Modal de sélection du type d'utilisateur */}
      <Dialog open={isUserTypeModalOpen} onOpenChange={setIsUserTypeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {modalAction === "login" ? "Connexion" : "Créer un compte"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {modalAction === "login"
                ? "Êtes-vous un candidat ou un recruteur ?"
                : "Quel type de compte souhaitez-vous créer ?"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Option Candidat */}
            <button
              onClick={() => handleUserTypeSelect("candidat")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#a590ff] hover:bg-[#a590ff]/5 transition-all duration-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center group-hover:bg-[#a590ff]/20 transition-colors">
                <User className="w-8 h-8 text-[#a590ff]" />
              </div>
              <span className="font-semibold text-gray-900">Candidat</span>
              <span className="text-xs text-gray-500 text-center">
                Je cherche un emploi
              </span>
            </button>

            {/* Option Recruteur */}
            <button
              onClick={() => handleUserTypeSelect("recruteur")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#a590ff] hover:bg-[#a590ff]/5 transition-all duration-200 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center group-hover:bg-[#a590ff]/20 transition-colors">
                <Briefcase className="w-8 h-8 text-[#a590ff]" />
              </div>
              <span className="font-semibold text-gray-900">Recruteur</span>
              <span className="text-xs text-gray-500 text-center">
                Je recrute des talents
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>



      <Dialog open={cvSheet} onOpenChange={setCvSheet}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        // showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#a590ff]">
              <FileText className="h-5 w-5" />
              CV obligatoire
            </DialogTitle>
            <DialogDescription>
              Pour continuer à utiliser la plateforme, vous devez déposer au moins
              un CV (PDF, DOC ou DOCX). Ce document sera visible par les
              recruteurs.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-[#a590ff]/30 bg-[#a590ff]/5 p-4">
              <p className="text-sm font-medium mb-2">Vous n&apos;avez pas encore de CV ?</p>
              <a
                href="https://cv.ylsix.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#a590ff] hover:underline font-medium"
              >
                <Plus className="h-4 w-4" />
                Créer un CV en ligne sur cv.ylsix.com
                <ExternalLink className="size-4" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Choisissez un modèle, renseignez vos infos puis téléchargez votre CV avant de le déposer ici.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Choisir un fichier (PDF, DOC, DOCX)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="cv-required-upload"
                  disabled={uploading}
                  onChange={onFileChange}
                />
                <Button
                  type="button"
                  className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90 flex-1"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("cv-required-upload")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Téléversement..." : "Télécharger mon CV"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ce modal ne peut pas être fermé tant qu&apos;un CV n&apos;a pas été
                déposé.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
