"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconMapPin, IconBriefcase, IconSchool, IconMail,
  IconShare, IconCircleCheck, IconSearch, IconEar,
  IconCalendar, IconCircleX, IconLoader,
} from "@tabler/icons-react";
import { use } from "react";

const STATUT_ICONS: Record<string, { icon: typeof IconCircleCheck; color: string; label: string }> = {
  "disponible": { icon: IconCircleCheck, color: "text-green-500", label: "Disponible immédiatement" },
  "recherche-active": { icon: IconSearch, color: "text-blue-500", label: "En recherche active" },
  "a-lecoute": { icon: IconEar, color: "text-purple-500", label: "À l'écoute d'opportunités" },
  "en-poste": { icon: IconCircleX, color: "text-red-500", label: "En poste" },
};

export default function ProfilPublicPage({ params }: { params: Promise<{ candidatId: string }> }) {
  const { candidatId } = use(params);
  const [candidat, setCandidat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/candidats/${candidatId}`)
      .then((r) => r.json())
      .then((json) => { setCandidat(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [candidatId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!candidat) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Profil introuvable.</p>
    </div>
  );

  const initials = ((candidat.prenom?.[0] ?? "") + (candidat.nom?.[0] ?? "")).toUpperCase() || "?";
  const statutCfg = candidat.statut ? STATUT_ICONS[candidat.statut] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={candidat.image ?? ""} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{candidat.prenom} {candidat.nom}</h1>
                  {candidat.domaine && <p className="text-muted-foreground">{candidat.domaine}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    {(candidat.ville || candidat.pays) && (
                      <span className="flex items-center gap-1">
                        <IconMapPin className="h-4 w-4" />{[candidat.ville, candidat.pays].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {candidat.user?.email && (
                      <a href={`mailto:${candidat.user.email}`} className="flex items-center gap-1 hover:text-primary">
                        <IconMail className="h-4 w-4" />{candidat.user.email}
                      </a>
                    )}
                  </div>
                  {statutCfg && (
                    <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${statutCfg.color}`}>
                      <statutCfg.icon className="h-4 w-4" />
                      {statutCfg.label}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <IconShare className="h-4 w-4 mr-2" />
                {copied ? "Lien copié !" : "Partager"}
              </Button>
            </div>

            {candidat.bio && (
              <>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground leading-relaxed">{candidat.bio}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Compétences */}
        {candidat.candidatCompetences?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Compétences</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidat.candidatCompetences.map((c: any) => (
                  <Badge key={c.id} variant="secondary">{c.competence}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expériences */}
        {candidat.experiences?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><IconBriefcase className="h-4 w-4" />Expériences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {candidat.experiences.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{exp.poste}</p>
                      <p className="text-sm text-muted-foreground">{exp.entreprise}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0 ml-4">
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        {new Date(exp.dateDebut).getFullYear()} – {exp.dateFin ? new Date(exp.dateFin).getFullYear() : "présent"}
                      </div>
                      {exp.localisation && <div className="flex items-center gap-1 mt-0.5"><IconMapPin className="h-3 w-3" />{exp.localisation}</div>}
                    </div>
                  </div>
                  {exp.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Formations */}
        {candidat.formations?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><IconSchool className="h-4 w-4" />Formations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {candidat.formations.map((f: any) => (
                <div key={f.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{f.diplome}</p>
                    <p className="text-sm text-muted-foreground">{f.etablissement} · {f.domaine}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {new Date(f.dateDebut).getFullYear()} – {f.dateFin ? new Date(f.dateFin).getFullYear() : "présent"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Profil partagé via <a href="/" className="text-[#a590ff] hover:underline">Ylsix</a>
        </p>
      </div>
    </div>
  );
}
