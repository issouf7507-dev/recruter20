"use client";

import { useState, useCallback, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  IconBriefcase,
  IconMapPin,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
  IconLoader,
  IconCheck,
  IconX,
  IconMedal,
  IconTrophy,
  IconFileText,
} from "@tabler/icons-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidatCompetence {
  id: string;
  candidatId: string;
  competence: string;
  createdAt: string;
}

interface CandidatureRecruteur {
  id: string;
  candidatId: string;
  jobOfferId: string;
  status: string;
  rating: number | null;
  message: string | null;
  cv: string | null;
  favorite: boolean;
  duedate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  jobOffer: {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
  };
  candidat: {
    id: string;
    userId: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    cv: string | null;
    bio: string | null;
    ville: string | null;
    pays: string | null;
    domaine: string | null;
    image: string | null;
    user: { email: string };
    candidatCompetences: CandidatCompetence[];
  };
}

interface MatchResult {
  candidatId: string;
  score: number;
  strengths: string[];
  missing: string[];
  recommendation: string;
  summary: string;
}

interface OffreGroup {
  jobOfferId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  candidatures: CandidatureRecruteur[];
}

interface MatchingParOffreProps {
  candidaturesRecruteur: CandidatureRecruteur[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(nom: string) {
  return nom
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function scoreStyles(score: number) {
  if (score >= 70)
    return {
      ring: "border-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  if (score >= 45)
    return {
      ring: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
    };
  return {
    ring: "border-red-500",
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
  };
}

function scoreLabel(score: number) {
  if (score >= 70) return "Excellent";
  if (score >= 45) return "Partiel";
  return "Faible";
}

function rankIcon(rank: number) {
  if (rank === 0)
    return (
      <IconTrophy className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
    );
  if (rank === 1)
    return (
      <IconMedal className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
    );
  if (rank === 2)
    return (
      <IconMedal className="h-5 w-5 shrink-0 text-amber-700/80" aria-hidden />
    );
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold text-muted-foreground">
      {rank + 1}
    </span>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function recommendationBadgeClass(rec: string) {
  if (rec === "Fortement recommandé")
    return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (rec === "Recommandé")
    return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300";
  if (rec === "À considérer")
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200";
  return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function analyzeCandidat(
  candidature: CandidatureRecruteur,
  jobDescription: string
): Promise<MatchResult> {
  const competences = candidature.candidat.candidatCompetences
    .map((c) => c.competence)
    .join(", ");

  const candidatInfo = `
Nom : ${candidature.candidat.nom} ${candidature.candidat.prenom}
Bio : ${candidature.candidat.bio || "Non renseignée"}
Domaine : ${candidature.candidat.domaine || "Non renseigné"}
Compétences : ${competences || "Non renseignées"}
Message de motivation : ${candidature.message || "Aucun"}
  `.trim();

  const response = await fetch("/api/matching", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidatInfo,
      jobDescription: stripHtml(jobDescription),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${err}`);
  }

  const parsed = await response.json();

  return {
    candidatId: candidature.candidatId,
    score: parsed.score ?? 0,
    strengths: parsed.strengths ?? [],
    missing: parsed.missing ?? [],
    recommendation: parsed.recommendation ?? "Non recommandé",
    summary: parsed.summary ?? "",
  };
}

// ─── CandidatRow ─────────────────────────────────────────────────────────────

function CandidatRow({
  candidature,
  rank,
  result,
}: {
  candidature: CandidatureRecruteur;
  rank: number;
  result: MatchResult;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = scoreStyles(result.score);

  return (
    <Card
      className={cn(
        "mb-2.5 gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md",
        rank === 0 &&
          "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className="flex cursor-pointer items-center gap-3 px-4 py-3.5 md:gap-4 md:px-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex w-7 shrink-0 items-center justify-center">
          {rankIcon(rank)}
        </div>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={candidature.candidat.image || ""} />
          <AvatarFallback className="text-sm font-semibold">
            {getInitials(candidature.candidat.nom)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-foreground">
            {candidature.candidat.nom} {candidature.candidat.prenom}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {candidature.candidat.user.email}
          </div>
        </div>
        <div className="hidden min-w-0 flex-2 flex-wrap gap-1.5 sm:flex">
          {candidature.candidat.candidatCompetences.slice(0, 3).map((c) => (
            <Badge key={c.id} variant="secondary" className="font-medium">
              {c.competence}
            </Badge>
          ))}
          {candidature.candidat.candidatCompetences.length > 3 && (
            <span className="self-center text-xs text-muted-foreground">
              +{candidature.candidat.candidatCompetences.length - 3}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <div
            className={cn(
              "flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full border-[3px] bg-background",
              s.ring,
              s.bg
            )}
          >
            <span className={cn("text-base font-black leading-none", s.text)}>
              {result.score}
            </span>
            <span className={cn("text-[9px] font-bold", s.text)}>%</span>
          </div>
          <span className={cn("text-[10px] font-semibold", s.text)}>
            {scoreLabel(result.score)}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "hidden shrink-0 text-xs font-semibold md:inline-flex",
            recommendationBadgeClass(result.recommendation)
          )}
        >
          {result.recommendation}
        </Badge>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <IconChevronUp className="h-4 w-4" />
          ) : (
            <IconChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {expanded && (
        <CardContent className="border-t bg-muted/30 px-4 pb-5 pt-4 md:px-5">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <p className="text-sm italic leading-relaxed text-muted-foreground md:col-span-2">
              {result.summary}
            </p>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Points forts
              </div>
              <ul className="space-y-2">
                {result.strengths.map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                Points manquants
              </div>
              <ul className="space-y-2">
                {result.missing.map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <IconX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {candidature.cv && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  window.open(candidature.cv!, "_blank");
                }}
              >
                <IconFileText className="mr-1.5 h-4 w-4" />
                Voir CV
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── OffreMatchCard ───────────────────────────────────────────────────────────

function OffreMatchCard({ group }: { group: OffreGroup }) {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setResults([]);
    setDone(false);
    setError("");
    setProgress(0);

    const total = group.candidatures.length;
    const all: MatchResult[] = [];
    const batchSize = 3;

    for (let i = 0; i < group.candidatures.length; i += batchSize) {
      const batch = group.candidatures.slice(i, i + batchSize);
      try {
        const batchResults = await Promise.all(
          batch.map((c) => analyzeCandidat(c, group.description))
        );
        all.push(...batchResults);
      } catch {
        setError(
          "Erreur lors de l'analyse. Vérifiez votre clé ANTHROPIC_API_KEY dans .env.local"
        );
        setLoading(false);
        return;
      }
      setProgress(Math.round((all.length / total) * 100));
    }

    all.sort((a, b) => b.score - a.score);
    setResults(all);
    setDone(true);
    setLoading(false);
  }, [group]);

  const typeLabel: Record<string, string> = {
    cdi: "CDI",
    cdd: "CDD",
    stage: "Stage",
    "temps-partiel": "Temps partiel",
    freelance: "Freelance",
  };

  return (
    <Card className="mb-6 gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b bg-muted/40 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
            <IconBriefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg leading-tight">
              {group.title}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span>{group.company}</span>
              <span className="inline-flex items-center gap-1">
                <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                {group.location}
              </span>
              <Badge variant="secondary" className="text-xs font-semibold">
                {typeLabel[group.type] || group.type}
              </Badge>
            </CardDescription>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="font-semibold">
            {group.candidatures.length} candidat
            {group.candidatures.length > 1 ? "s" : ""}
          </Badge>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="font-semibold"
          >
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Analyse… {progress}%
              </>
            ) : done ? (
              <>
                <IconSparkles className="mr-2 h-4 w-4" />
                Relancer
              </>
            ) : (
              <>
                <IconSparkles className="mr-2 h-4 w-4" />
                Analyser avec IA
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {loading && (
        <div className="px-1 pt-0">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      <CardContent className="pt-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {!done && !loading && (
          <div className="py-8 text-center text-muted-foreground">
            <IconSparkles className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">
              Cliquez sur <strong className="text-foreground">Analyser avec IA</strong>{" "}
              pour classer automatiquement les {group.candidatures.length} candidat
              {group.candidatures.length > 1 ? "s" : ""} par compatibilité.
            </p>
          </div>
        )}

        {loading &&
          group.candidatures.map((c) => (
            <div
              key={c.id}
              className="mb-2 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 opacity-80"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.candidat.image || ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(c.candidat.nom)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">
                  {c.candidat.nom} {c.candidat.prenom}
                </div>
                <div className="text-xs text-muted-foreground">
                  Analyse en cours…
                </div>
              </div>
              <IconLoader className="h-4 w-4 shrink-0 animate-spin text-primary" />
            </div>
          ))}

        {done &&
          results.map((result, idx) => {
            const candidature = group.candidatures.find(
              (c) => c.candidatId === result.candidatId
            );
            if (!candidature) return null;
            return (
              <CandidatRow
                key={candidature.id}
                candidature={candidature}
                rank={idx}
                result={result}
              />
            );
          })}
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MatchingParOffre({
  candidaturesRecruteur,
}: MatchingParOffreProps) {
  const groupsMap = new Map<string, OffreGroup>();

  for (const c of candidaturesRecruteur) {
    if (!groupsMap.has(c.jobOfferId)) {
      groupsMap.set(c.jobOfferId, {
        jobOfferId: c.jobOfferId,
        title: c.jobOffer.title,
        company: c.jobOffer.company,
        location: c.jobOffer.location,
        type: c.jobOffer.type,
        description: c.jobOffer.description,
        candidatures: [],
      });
    }
    groupsMap.get(c.jobOfferId)!.candidatures.push(c);
  }

  const groups = Array.from(groupsMap.values()).filter(
    (g) => g.candidatures.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconSparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Matching IA par offre
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Classez automatiquement les candidats par compatibilité pour chaque
            poste
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">
              Aucune candidature disponible pour le matching.
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <OffreMatchCard key={group.jobOfferId} group={group} />
        ))
      )}
    </div>
  );
}

export default MatchingParOffre;
