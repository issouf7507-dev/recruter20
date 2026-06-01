"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconCircleCheck, IconCircle, IconArrowRight } from "@tabler/icons-react";

interface ProfilCompletionProps {
  candidat: any;
}

interface Step {
  label: string;
  done: boolean;
  url: string;
}

export function ProfilCompletion({ candidat }: ProfilCompletionProps) {
  if (!candidat) return null;

  const steps: Step[] = [
    { label: "Photo de profil", done: !!candidat.image, url: "/candidat/profil" },
    { label: "Biographie", done: !!candidat.bio && candidat.bio.length > 20, url: "/candidat/profil" },
    { label: "Compétences (3+)", done: (candidat.candidatCompetences?.length ?? 0) >= 3, url: "/candidat/profil" },
    { label: "CV uploadé", done: !!candidat.cv, url: "/candidat/documents" },
    { label: "Expérience professionnelle", done: (candidat.experiences?.length ?? 0) > 0, url: "/candidat/experiences" },
    { label: "Formation", done: (candidat.formations?.length ?? 0) > 0, url: "/candidat/experiences" },
    { label: "Statut de disponibilité", done: !!candidat.statut, url: "/candidat/profil" },
    { label: "Localisation", done: !!candidat.ville || !!candidat.pays, url: "/candidat/profil" },
  ];

  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  const missing = steps.filter((s) => !s.done).slice(0, 3);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Complétion du profil</span>
          <Badge
            className={pct === 100 ? "bg-green-100 text-green-800 border-0" : "bg-purple-100 text-purple-800 border-0"}
          >
            {pct}%
          </Badge>
        </div>
        <Progress value={pct} className="h-2" />
        {missing.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-muted-foreground font-medium">Pour améliorer votre profil :</p>
            {missing.map((s) => (
              <a key={s.label} href={s.url} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary group">
                <IconCircle className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span className="flex-1">{s.label}</span>
                <IconArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        )}
        {pct === 100 && (
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <IconCircleCheck className="h-4 w-4" />
            Profil complet — vous maximisez vos chances !
          </div>
        )}
      </CardContent>
    </Card>
  );
}
