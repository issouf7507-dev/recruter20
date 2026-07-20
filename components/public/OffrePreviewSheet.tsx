"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Wallet, Clock, ArrowRight, Building2, Loader2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";

// Aperçu rapide d'une offre depuis la liste, sans quitter la page — avec candidature intégrée.
export function OffrePreviewSheet({
  offre,
  onClose,
}: {
  offre: any | null;
  onClose: () => void;
}) {
  const open = !!offre;

  const { candidat } = useCandidat();
  const { hasApplied, createCandidature } = useCandidatures(candidat?.id);
  const { data: documents } = useQuery({
    queryKey: ["documents", candidat?.id],
    queryFn: async () => {
      if (!candidat?.id) return [];
      const response = await fetch(`/api/candidats/${candidat?.id}/documents`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!candidat?.id,
  });

  const [showApply, setShowApply] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [message, setMessage] = useState("");

  const applied = offre ? hasApplied(offre.id) : false;
  const hasCv = documents?.some((d: any) => d.documentType === "cv");

  const handleApplyClick = () => {
    if (!candidat) {
      window.location.href = "/auth/candidat/login";
      return;
    }
    if (!hasCv) {
      setShowDocs(true);
      return;
    }
    setShowApply(true);
  };

  const submitApply = () => {
    if (!candidat?.id || !offre?.id) return;
    if (hasApplied(offre.id)) {
      setShowApply(false);
      return;
    }
    createCandidature.mutate(
      {
        jobOfferId: offre.id,
        message: message || undefined,
        cv: candidat?.cv || undefined,
      },
      {
        onSuccess: (data: any) => {
          setShowApply(false);
          setMessage("");
          alert(data.message || "Candidature envoyée avec succès !");
        },
        onError: (error: any) => {
          alert(error.message || "Une erreur est survenue lors de la postulation");
        },
      }
    );
  };

  const meta = offre
    ? ([
        offre.location ? { icon: MapPin, label: offre.location } : null,
        offre.type ? { icon: Briefcase, label: offre.type } : null,
        offre.salary ? { icon: Wallet, label: `${offre.salary} ${offre.salaryCurrency ?? ""}`.trim() } : null,
        offre.postedAt ? { icon: Clock, label: offre.postedAt } : null,
      ].filter(Boolean) as { icon: any; label: string }[])
    : [];

  const applyLabel = applied
    ? "Candidature envoyée"
    : candidat
      ? "Postuler"
      : "Connectez-vous pour postuler";

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col gap-0"
          style={{ background: "var(--y-bg)" }}
        >
          {offre && (
            <>
              <SheetHeader className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid var(--y-line)" }}>
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                  >
                    {offre.logo ? (
                      <img src={offre.logo} alt={offre.company} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <SheetDescription className="text-sm font-medium m-0" style={{ color: "var(--y-ink-2)" }}>
                      {offre.company}
                    </SheetDescription>
                    <SheetTitle className="text-xl font-semibold tracking-[-0.02em] mt-0.5" style={{ color: "var(--y-ink)" }}>
                      {offre.title}
                    </SheetTitle>
                  </div>
                </div>

                {meta.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {meta.map((m, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                        style={{ background: "var(--y-bg-pure)", color: "var(--y-ink-2)", boxShadow: "inset 0 0 0 1px var(--y-line-2)" }}
                      >
                        <m.icon size={12} /> {m.label}
                      </span>
                    ))}
                  </div>
                )}
              </SheetHeader>

              {/* Corps scrollable — description */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--y-ink-3)" }}>
                  Description du poste
                </h3>
                {offre.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: offre.description }}
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--y-ink-2)" }}
                  />
                ) : (
                  <p className="text-sm" style={{ color: "var(--y-ink-3)" }}>
                    Aucune description fournie. Consultez l&apos;offre complète pour plus de détails.
                  </p>
                )}
              </div>

              {/* Footer CTA */}
              <div
                className="px-6 py-4 flex flex-col gap-2.5"
                style={{ borderTop: "1px solid var(--y-line)", background: "var(--y-bg-pure)" }}
              >
                <button
                  onClick={handleApplyClick}
                  disabled={applied}
                  className="h-11 rounded-full text-sm font-medium flex items-center justify-center gap-2 text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{
                    background: applied
                      ? "var(--y-bg-soft)"
                      : "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))",
                    color: applied ? "var(--y-ink-3)" : "#fff",
                    boxShadow: applied ? "none" : "var(--y-shadow-violet)",
                  }}
                >
                  {applyLabel}
                </button>
                <Link
                  href={`/offres/${offre.id}`}
                  className="h-11 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
                >
                  Voir l&apos;offre complète <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogue candidature */}
      <AlertDialog open={showApply} onOpenChange={setShowApply}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Postuler à : {offre?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Ajoutez un message personnalisé pour vous démarquer (optionnel)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="preview-app-message" className="text-sm font-medium mb-2 block">
              Message de motivation
            </Label>
            <Textarea
              id="preview-app-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
              className="min-h-[120px]"
            />
            {candidat?.cv && (
              <p className="text-sm text-muted-foreground mt-2">
                ✓ Votre CV sera automatiquement joint à la candidature
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createCandidature.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
              onClick={submitApply}
              disabled={createCandidature.isPending}
            >
              {createCandidature.isPending ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Postuler"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue documents requis */}
      <AlertDialog open={showDocs} onOpenChange={setShowDocs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Documents requis</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devez télécharger un CV pour postuler à cette offre. Rendez-vous dans votre
              espace candidat, section « Documents », pour ajouter votre CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Link href="/candidat/documents">
              <AlertDialogAction
                className="text-white hover:opacity-90 w-full"
                style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
              >
                Ajouter mon CV
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
