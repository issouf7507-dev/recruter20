"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSparkles,
  IconBriefcase,
  IconMapPin,
  IconUser,
  IconCheck,
  IconX,
  IconLoader2,
  IconSearch,
  IconRobot,
  IconTrophy,
  IconArrowRight,
  IconAlertCircle,
  IconSettings,
  IconChevronDown,
  IconChevronUp,
  IconMail,
} from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useOffers } from "@/lib/hooks/use-offers";
import { useSearchCandidates } from "@/lib/hooks/use-candidats";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchResult {
  candidatId: string;
  score: number;
  niveau: "excellent" | "bon" | "moyen" | "faible";
  forces: string[];
  manques: string[];
  resume: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

const NIVEAU_CONFIG = {
  excellent: { color: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200", label: "Excellent" },
  bon:       { color: "bg-blue-500",  text: "text-blue-700",  bg: "bg-blue-50 border-blue-200",  label: "Bon" },
  moyen:     { color: "bg-yellow-500",text: "text-yellow-700",bg: "bg-yellow-50 border-yellow-200",label: "Moyen" },
  faible:    { color: "bg-red-500",   text: "text-red-700",   bg: "bg-red-50 border-red-200",    label: "Faible" },
};

function getInitials(s: string) {
  return s.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function transformCandidat(c: any) {
  return {
    id: c.id,
    nom: `${c.prenom || ""} ${c.nom || ""}`.trim() || c.user?.name || "Candidat",
    avatar: c.image || c.user?.image || "",
    lieu: c.ville ? `${c.ville}${c.pays ? `, ${c.pays}` : ""}` : c.pays || "",
    domaine: c.domaine || "",
    competences: c.candidatCompetences?.map((x: any) => x.competence) || [],
    experience: c.experiences?.length
      ? `${Math.floor(c.experiences.reduce((acc: number, e: any) => {
          const start = new Date(e.dateDebut);
          const end = e.dateFin ? new Date(e.dateFin) : new Date();
          return acc + (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        }, 0) / 12)} ans`
      : "Débutant",
  };
}

// ─── Étapes ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Choisir une offre" },
  { id: 2, label: "Sélectionner des candidats" },
  { id: 3, label: "Résultats IA" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchingAIPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOffre, setSelectedOffre] = useState<{ id: string; title: string; company?: string } | null>(null);
  const [selectedCandidats, setSelectedCandidats] = useState<Set<string>>(new Set());
  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Vérifier si la clé API est configurée
  useEffect(() => {
    if (!recruteurId) return;
    fetch(`/api/recruteurs/${recruteurId}/claude-key`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setHasKey(d.data.hasKey); })
      .catch(() => {});
  }, [recruteurId]);

  // Offres du recruteur
  const { data: offresData } = useOffers(
    { recruteurId: recruteurId || undefined, limit: 100, etat: "active" },
    { enabled: !!recruteurId }
  );
  const offres = offresData?.items ?? [];

  // Candidats (step 2)
  const { data: candidatsData, isLoading: isLoadingCandidats } = useSearchCandidates({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  });
  const candidats = useMemo(() => (candidatsData?.items ?? []).map(transformCandidat), [candidatsData]);

  // Conversation
  const { createConversation } = useCandidatures(recruteurId || undefined);

  // Toggle sélection candidat
  const toggleCandidat = useCallback((id: string) => {
    setSelectedCandidats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      if (next.size >= 10) { toast.error("Maximum 10 candidats par analyse"); return prev; }
      next.add(id);
      return next;
    });
  }, []);

  // Lancer l'analyse
  const handleAnalyze = async () => {
    if (!recruteurId || !selectedOffre) return;
    if (selectedCandidats.size === 0) { toast.error("Sélectionnez au moins 1 candidat"); return; }

    setIsMatching(true);
    try {
      const res = await fetch("/api/matching-ai/candidats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruteurId,
          candidatIds: Array.from(selectedCandidats),
          jobOfferId: selectedOffre.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || data.message || "Erreur";
        toast.error(msg);
        if (msg.includes("clé") || msg.includes("Paramètre")) router.push("/recruteur/parametres");
        return;
      }
      setResults(data.data.results);
      setStep(3);
      toast.success(`${data.data.results.length} profil(s) analysé(s) !`);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsMatching(false);
    }
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <>
      <SiteHeader title="Matching IA" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-5 py-4 md:py-6 px-4 lg:px-6 max-w-5xl mx-auto w-full">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <IconRobot className="h-6 w-6 text-primary" />
                Matching IA — Claude
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Analysez la compatibilité de vos candidats avec une offre grâce à Claude (Anthropic).
              </p>
            </div>

            {/* Alerte clé manquante */}
            {hasKey === false && (
              <Link href="/recruteur/parametres">
                <Button variant="outline" size="sm" className="shrink-0 text-yellow-600 border-yellow-300 bg-yellow-50">
                  <IconAlertCircle className="h-4 w-4 mr-1.5" />
                  Configurer la clé API
                </Button>
              </Link>
            )}
            {hasKey === true && (
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 shrink-0">
                <IconCheck className="h-3.5 w-3.5 mr-1" /> Clé API Claude active
              </Badge>
            )}
          </div>

          {/* Alerte clé manquante étendue */}
          {hasKey === false && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 flex items-start gap-3">
                <IconAlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Clé API Claude manquante</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Pour utiliser le matching IA, configurez votre clé API Claude dans les Paramètres → onglet IA.
                    Obtenez votre clé sur{" "}
                    <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                      console.anthropic.com
                    </a>
                  </p>
                </div>
                <Link href="/recruteur/parametres">
                  <Button size="sm" className="shrink-0">
                    <IconSettings className="h-4 w-4 mr-1" /> Configurer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      step > s.id ? "bg-primary text-white"
                        : step === s.id ? "bg-primary text-white ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.id ? <IconCheck className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Étape 1 : Choisir une offre ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IconBriefcase className="h-4 w-4" />
                    Quelle offre voulez-vous matcher ?
                  </CardTitle>
                  <CardDescription>
                    Choisissez une offre active — l&apos;IA analysera les candidats par rapport à ce poste.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offres.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconBriefcase className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Aucune offre active.</p>
                      <Link href="/recruteur/offres/creer">
                        <Button variant="outline" size="sm" className="mt-3">Créer une offre</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {offres.map((offre) => (
                        <button
                          key={offre.id}
                          type="button"
                          onClick={() => setSelectedOffre({ id: offre.id, title: offre.title, company: offre.company || undefined })}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            selectedOffre?.id === offre.id
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{offre.title}</p>
                              {offre.company && (
                                <p className="text-xs text-muted-foreground mt-0.5">{offre.company}</p>
                              )}
                              {offre.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <IconMapPin className="h-3 w-3" /> {offre.location}
                                </p>
                              )}
                            </div>
                            {selectedOffre?.id === offre.id && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <IconCheck className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  disabled={!selectedOffre || hasKey === false}
                  onClick={() => setStep(2)}
                >
                  Sélectionner les candidats <IconArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : Sélectionner les candidats ─────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Offre sélectionnée */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3 flex items-center gap-3">
                  <IconBriefcase className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedOffre?.title}</p>
                    {selectedOffre?.company && (
                      <p className="text-xs text-muted-foreground">{selectedOffre.company}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="shrink-0 text-xs">
                    Changer
                  </Button>
                </CardContent>
              </Card>

              {/* Recherche */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un candidat..."
                        className="pl-9"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {selectedCandidats.size}/10 sélectionné{selectedCandidats.size > 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {isLoadingCandidats ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                      <IconLoader2 className="h-4 w-4 animate-spin" /> Chargement...
                    </div>
                  ) : candidats.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-6">Aucun candidat trouvé.</p>
                  ) : (
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {candidats.map((c) => {
                        const selected = selectedCandidats.has(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCandidat(c.id)}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              selected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                            }`}>
                              {selected && <IconCheck className="h-3 w-3 text-white" />}
                            </div>

                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="text-xs">{getInitials(c.nom)}</AvatarFallback>
                              <AvatarImage src={c.avatar} />
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{c.nom}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                {c.domaine && <span className="truncate">{c.domaine}</span>}
                                {c.lieu && (
                                  <span className="flex items-center gap-1 shrink-0">
                                    <IconMapPin className="h-3 w-3" /> {c.lieu}
                                  </span>
                                )}
                              </div>
                              {c.competences.length > 0 && (
                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                  {c.competences.slice(0, 3).map((comp: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {comp}
                                    </Badge>
                                  ))}
                                  {c.competences.length > 3 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      +{c.competences.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <span className="text-xs text-muted-foreground shrink-0">{c.experience}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={selectedCandidats.size === 0 || isMatching || hasKey === false}
                  className="min-w-36"
                >
                  {isMatching ? (
                    <><IconLoader2 className="h-4 w-4 mr-1.5 animate-spin" /> Analyse en cours...</>
                  ) : (
                    <><IconSparkles className="h-4 w-4 mr-1.5" /> Analyser {selectedCandidats.size > 0 ? `(${selectedCandidats.size})` : ""}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Étape 3 : Résultats ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Résumé */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      <IconSparkles className="h-4 w-4 text-primary" />
                      {results.length} profil{results.length > 1 ? "s" : ""} analysé{results.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pour l&apos;offre : <span className="font-medium">{selectedOffre?.title}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => { setStep(2); setResults([]); }}>
                      Modifier la sélection
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setStep(1); setSelectedOffre(null); setSelectedCandidats(new Set()); setResults([]); }}>
                      Nouvelle analyse
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Légende scores */}
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(NIVEAU_CONFIG).map(([k, v]) => (
                  <span key={k} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${v.bg} ${v.text} font-medium`}>
                    <span className={`w-2 h-2 rounded-full ${v.color}`} />
                    {v.label}
                  </span>
                ))}
              </div>

              {/* Cards résultats */}
              <div className="space-y-3">
                {results.map((result, rank) => {
                  const c = candidats.find((x) => x.id === result.candidatId);
                  const config = NIVEAU_CONFIG[result.niveau];
                  const expanded = expandedId === result.candidatId;

                  return (
                    <motion.div
                      key={result.candidatId}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rank * 0.06 }}
                    >
                      <Card className={`border-2 ${config.bg}`}>
                        <CardContent className="p-4">
                          {/* Header card */}
                          <div className="flex items-start gap-4">
                            {/* Rank */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${config.color}`}>
                              {rank === 0 ? <IconTrophy className="h-4 w-4" /> : rank + 1}
                            </div>

                            {/* Avatar */}
                            <Avatar className="h-12 w-12 shrink-0">
                              <AvatarFallback className="text-sm font-semibold">
                                {getInitials(c?.nom ?? "?")}
                              </AvatarFallback>
                              <AvatarImage src={c?.avatar} />
                            </Avatar>

                            {/* Infos candidat */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">{c?.nom ?? result.candidatId.slice(0, 8)}</span>
                                <Badge className={`text-xs font-bold ${config.text} ${config.bg} border`}>
                                  {config.label}
                                </Badge>
                              </div>
                              {c?.domaine && (
                                <p className="text-xs text-muted-foreground mt-0.5">{c.domaine}</p>
                              )}
                              {/* Résumé IA */}
                              <p className={`text-sm mt-2 ${config.text}`}>{result.resume}</p>
                            </div>

                            {/* Score circulaire */}
                            <div className="shrink-0 text-center">
                              <div className={`text-3xl font-black tabular-nums ${config.text}`}>
                                {result.score}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                /100
                              </div>
                            </div>
                          </div>

                          {/* Barre de score */}
                          <Progress value={result.score} className="mt-3 h-1.5" />

                          {/* Forces & manques (toujours visibles) */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {result.forces.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1.5">
                                  ✓ Points forts
                                </p>
                                <ul className="space-y-1">
                                  {result.forces.map((f, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <IconCheck className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {result.manques.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1.5">
                                  ✗ Points manquants
                                </p>
                                <ul className="space-y-1">
                                  {result.manques.map((m, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <IconX className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                      {m}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const offer = results.find((r) => r.candidatId === result.candidatId);
                                if (!offer || !selectedOffre) return;
                                if (!recruteurId) { toast.error("Recruteur non identifié"); return; }
                                createConversation.mutate({
                                  candidatId: result.candidatId,
                                  jobOfferId: selectedOffre.id,
                                  recruteurId,
                                });
                              }}
                              disabled={createConversation.isPending}
                            >
                              <IconMail className="h-3.5 w-3.5 mr-1" /> Contacter
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
