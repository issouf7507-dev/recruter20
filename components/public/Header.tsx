"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X, Upload, ExternalLink, Plus, FileText, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCandidat } from "@/lib/hooks/use-candidat";
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

const NAV_LINKS = [
  { label: "Offres d'emploi", href: "/offres" },
  { label: "Fonctionnalités", href: "/fonctionnalites" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cvSheet, setCvSheet] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { candidat, handleSignOut } = useCandidat();
  const { edgestore } = useEdgeStore();
  const queryClient = useQueryClient();

  const goToAuth = (action: "login" | "register") => {
    router.push(`/auth?action=${action}`);
  };

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
        toast.success("CV enregistré.");
        setCvSheet(false);
      } else {
        const err = await response.json();
        toast.error(err.error || "Erreur lors de l'upload");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) handleUpload(file);
    else if (file) toast.error("Format accepté : PDF, DOC ou DOCX");
    e.target.value = "";
  };

  return (
    <>
      {/* ── Glass header ──────────────────────────────────── */}
      <header
        className="fixed top-4 left-4 right-4 z-50 flex items-center px-5 pr-2.5"
        style={{
          height: 64,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          borderRadius: 999,
          boxShadow: "0 1px 0 rgba(20,18,32,0.06), 0 14px 30px -16px rgba(20,18,32,0.10)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image src="/img/icon2.png" alt="Ylsix" width={80} height={32} className="h-8 w-auto" />
        </Link>

        <div className="w-px h-5 mx-4 shrink-0" style={{ background: "var(--y-line-2)" }} />
        <span className="hidden md:block text-[11px] font-mono tracking-widest uppercase" style={{ color: "var(--y-ink-3)" }}>
          Recrutement · Afrique
        </span>

        {/* Nav centrée */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                color: pathname === link.href ? "var(--y-ink)" : "var(--y-ink-2)",
                background: pathname === link.href ? "rgba(20,18,32,0.05)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        {!candidat ? (
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <button
              onClick={() => goToAuth("login")}
              className="h-9 px-4 rounded-full text-sm font-medium transition-colors"
              style={{ background: "transparent", color: "var(--y-ink)", boxShadow: "inset 0 0 0 1px var(--y-line-2)" }}
            >
              Se connecter
            </button>
            <button
              onClick={() => goToAuth("register")}
              className="h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
            >
              Commencer <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCvSheet(true)}
              className="h-9 px-4 rounded-full text-sm font-medium flex items-center gap-1.5"
              style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
            >
              <Upload size={13} /> Charger mon CV
            </button>
            <a
              href="/candidat/profil"
              className="h-9 px-4 rounded-full text-sm font-medium flex items-center gap-2"
              style={{ background: "var(--y-bg)", color: "var(--y-ink)" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
              >
                {(candidat.prenom?.[0] ?? "") + (candidat.nom?.[0] ?? "")}
              </span>
              Mon espace
            </a>
          </div>
        )}

        {/* Mobile burger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: "var(--y-bg-soft)" }}
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(14,13,20,0.45)", backdropFilter: "blur(2px)" }} />
          <aside
            className="absolute top-0 right-0 bottom-0 w-[78%] max-w-sm flex flex-col p-5"
            style={{ background: "var(--y-bg-pure)", boxShadow: "-30px 0 60px -10px rgba(20,18,32,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-7">
              <Link href="/" onClick={() => setDrawerOpen(false)}>
                <Image src="/img/icon2.png" alt="Ylsix" width={70} height={28} className="h-7 w-auto" />
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ background: "var(--y-bg-soft)" }}
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] font-mono tracking-widest uppercase mb-3" style={{ color: "var(--y-ink-3)" }}>Navigation</p>
            <nav className="flex flex-col gap-0.5 mb-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium transition-colors"
                  style={{
                    background: pathname === link.href ? "var(--y-primary-50)" : "transparent",
                    color: pathname === link.href ? "var(--y-primary-700)" : "var(--y-ink)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              {!candidat ? (
                <>
                  <button
                    onClick={() => { setDrawerOpen(false); goToAuth("register"); }}
                    className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
                  >
                    Commencer gratuitement <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => { setDrawerOpen(false); goToAuth("login"); }}
                    className="w-full h-12 rounded-full font-medium text-sm"
                    style={{ background: "transparent", color: "var(--y-ink)", boxShadow: "inset 0 0 0 1px var(--y-line-2)" }}
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/candidat/profil"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full h-12 rounded-full font-medium text-sm flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", color: "#fff" }}
                  >
                    Mon espace candidat
                  </a>
                  <button
                    onClick={() => { setDrawerOpen(false); setCvSheet(true); }}
                    className="w-full h-12 rounded-full font-medium text-sm"
                    style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                  >
                    Charger mon CV
                  </button>
                  <button
                    onClick={() => { setDrawerOpen(false); handleSignOut(); }}
                    className="w-full h-12 rounded-full font-medium text-sm"
                    style={{ background: "var(--y-bg-soft)", color: "var(--y-ink-2)" }}
                  >
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Modal CV */}
      <Dialog open={cvSheet} onOpenChange={setCvSheet}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#a590ff]">
              <FileText className="h-5 w-5" /> CV obligatoire
            </DialogTitle>
            <DialogDescription>
              Pour continuer, déposez votre CV (PDF, DOC ou DOCX).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="rounded-lg border border-[#a590ff]/30 bg-[#a590ff]/5 p-4">
              <p className="text-sm font-medium mb-2">Pas encore de CV ?</p>
              <a href="https://cv.ylsix.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#a590ff] hover:underline font-medium">
                <Plus className="h-4 w-4" /> Créer un CV sur cv.ylsix.com <ExternalLink className="size-4" />
              </a>
            </div>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" id="cv-required-upload" disabled={uploading} onChange={onFileChange} />
            <Button
              type="button"
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
              disabled={uploading}
              onClick={() => document.getElementById("cv-required-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Téléversement..." : "Télécharger mon CV"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
