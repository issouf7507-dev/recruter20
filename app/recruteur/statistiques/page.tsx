"use client";
import { RequirePlan } from "@/components/shared/RequirePlan";

import { useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useOffers } from "@/lib/hooks/use-offers";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBriefcase,
  IconMail,
  IconCalendar,
  IconDownload,
  IconMapPin,
  IconStar,
  IconPrinter,
} from "@tabler/icons-react";

interface CandidatureStat {
  id: string;
  candidatId: string;
  status: string;
  favorite?: boolean | null;
  rating?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  jobOffer?: { id: string; title: string } | null;
  candidat?: {
    ville?: string | null;
    candidatCompetences?: { competence: string }[];
    competencesList?: { nom: string }[];
  } | null;
}

interface OffreStat {
  id: string;
  etat?: string;
  duedate?: Date | string;
  createdAt: Date | string;
}

const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "3 derniers mois" },
  { value: "365", label: "12 derniers mois" },
  { value: "all", label: "Toutes les données" },
];

const PERIOD_LABELS: Record<string, string> = Object.fromEntries(
  PERIOD_OPTIONS.map((o) => [o.value, o.label])
);

export default function StatistiquesRapportsPage() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const { data: offersData, isLoading: isLoadingOffers } = useOffers(
    { recruteurId: recruteurId ?? undefined, limit: 500 },
    { enabled: !!recruteurId }
  );
  const { candidaturesRecruteur, isLoadingRecruteur: isLoadingCandidatures } =
    useCandidatures(recruteurId ?? undefined);

  const offers = (offersData?.items ?? []) as OffreStat[];
  const candidatures = (candidaturesRecruteur ?? []) as CandidatureStat[];
  const isLoading = isLoadingOffers || isLoadingCandidatures;

  const [periode, setPeriode] = useState("30");
  const [vue, setVue] = useState("global");

  const periodCutoff = useMemo(() => {
    if (periode === "all") return null;
    const d = new Date();
    d.setDate(d.getDate() - parseInt(periode, 10));
    return d;
  }, [periode]);

  const periodCandidatures = useMemo(() => {
    if (!periodCutoff) return candidatures;
    return candidatures.filter((c) => new Date(c.createdAt) >= periodCutoff);
  }, [candidatures, periodCutoff]);

  const offresStats = useMemo(() => {
    const now = new Date();
    const actives = offers.filter(
      (o) =>
        o.etat === "active" && (!o.duedate || new Date(o.duedate) >= now)
    ).length;
    const expirees = offers.filter(
      (o) =>
        o.etat === "expiree" ||
        (o.etat === "active" && o.duedate && new Date(o.duedate) < now)
    ).length;
    const brouillons = offers.filter((o) => o.etat === "brouillon").length;
    const nouvelles = periodCutoff
      ? offers.filter((o) => new Date(o.createdAt) >= periodCutoff).length
      : offers.length;
    return { total: offers.length, actives, expirees, brouillons, nouvelles };
  }, [offers, periodCutoff]);

  const candidaturesStats = useMemo(() => {
    const total = periodCandidatures.length;
    const enAttente = periodCandidatures.filter(
      (c) => c.status === "EN_ATTENTE"
    ).length;
    const enRevision = periodCandidatures.filter(
      (c) => c.status === "EN_REVISION"
    ).length;
    const acceptees = periodCandidatures.filter(
      (c) => c.status === "ACCEPTE"
    ).length;
    const refusees = periodCandidatures.filter(
      (c) => c.status === "REFUSE"
    ).length;
    return { total, enAttente, enRevision, acceptees, refusees };
  }, [periodCandidatures]);

  const candidatsStats = useMemo(() => {
    const allIds = new Set(candidatures.map((c) => c.candidatId));
    const periodIds = new Set(periodCandidatures.map((c) => c.candidatId));
    const favorisIds = new Set(
      candidatures.filter((c) => c.favorite).map((c) => c.candidatId)
    );
    const contactesIds = new Set(
      candidatures
        .filter((c) => c.status !== "EN_ATTENTE")
        .map((c) => c.candidatId)
    );
    return {
      total: allIds.size,
      surPeriode: periodIds.size,
      favoris: favorisIds.size,
      contactes: contactesIds.size,
    };
  }, [candidatures, periodCandidatures]);

  const performanceStats = useMemo(() => {
    const total = candidaturesStats.total;
    const tauxConversion =
      total > 0 ? (candidaturesStats.acceptees / total) * 100 : 0;
    const traitees = total - candidaturesStats.enAttente;
    const tauxReponse = total > 0 ? (traitees / total) * 100 : 0;

    const traiteesAvecDelai = periodCandidatures.filter(
      (c) => c.status !== "EN_ATTENTE"
    );
    const tempsMoyenTraitement =
      traiteesAvecDelai.length > 0
        ? traiteesAvecDelai.reduce(
            (sum, c) =>
              sum +
              (new Date(c.updatedAt).getTime() -
                new Date(c.createdAt).getTime()),
            0
          ) /
          traiteesAvecDelai.length /
          (1000 * 60 * 60 * 24)
        : 0;

    const noted = candidatures.filter((c) => !!c.rating && c.rating > 0);
    const noteMoyenne =
      noted.length > 0
        ? noted.reduce((sum, c) => sum + (c.rating ?? 0), 0) / noted.length
        : 0;

    return { tauxConversion, tauxReponse, tempsMoyenTraitement, noteMoyenne, noted: noted.length };
  }, [candidaturesStats, periodCandidatures, candidatures]);

  const evolution = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
      });
    }
    const countByMonth = (items: { createdAt: string | Date }[]) => {
      const counts: Record<string, number> = {};
      months.forEach((m) => (counts[m.key] = 0));
      items.forEach((item) => {
        const d = new Date(item.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key in counts) counts[key]++;
      });
      return months.map((m) => ({ mois: m.label, valeur: counts[m.key] }));
    };
    return {
      candidatures: countByMonth(candidatures),
      offres: countByMonth(offers),
    };
  }, [candidatures, offers]);

  const topCompetences = useMemo(() => {
    const candidatSkills = new Map<string, Set<string>>();
    periodCandidatures.forEach((c) => {
      if (!c.candidat) return;
      const skills = new Set<string>();
      (c.candidat.competencesList ?? []).forEach((s) => skills.add(s.nom));
      (c.candidat.candidatCompetences ?? []).forEach((s) =>
        skills.add(s.competence)
      );
      if (skills.size > 0) candidatSkills.set(c.candidatId, skills);
    });
    const total = candidatSkills.size;
    const counts: Record<string, number> = {};
    candidatSkills.forEach((skills) => {
      skills.forEach((skill) => {
        counts[skill] = (counts[skill] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, count]) => ({
        nom,
        candidats: count,
        pourcentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      }));
  }, [periodCandidatures]);

  const topOffres = useMemo(() => {
    const counts = new Map<string, { titre: string; count: number }>();
    periodCandidatures.forEach((c) => {
      const id = c.jobOffer?.id;
      if (!id) return;
      const entry = counts.get(id) ?? { titre: c.jobOffer?.title ?? "—", count: 0 };
      entry.count++;
      counts.set(id, entry);
    });
    const total = candidaturesStats.total || 1;
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((o) => ({
        titre: o.titre,
        candidatures: o.count,
        pourcentage: Math.round((o.count / total) * 1000) / 10,
      }));
  }, [periodCandidatures, candidaturesStats]);

  const lieux = useMemo(() => {
    const villesByCandidat = new Map<string, string>();
    periodCandidatures.forEach((c) => {
      if (c.candidat?.ville) villesByCandidat.set(c.candidatId, c.candidat.ville);
    });
    const counts: Record<string, number> = {};
    villesByCandidat.forEach((ville) => {
      counts[ville] = (counts[ville] ?? 0) + 1;
    });
    const total = villesByCandidat.size || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lieu, count]) => ({
        lieu,
        candidats: count,
        pourcentage: Math.round((count / total) * 1000) / 10,
      }));
  }, [periodCandidatures]);

  const recommandations = useMemo(() => {
    const positifs: string[] = [];
    const ameliorations: string[] = [];

    if (candidaturesStats.acceptees > 0) {
      positifs.push(
        `${candidaturesStats.acceptees} candidature(s) acceptée(s) sur la période`
      );
    }
    if (offresStats.actives > 0) {
      positifs.push(`${offresStats.actives} offre(s) active(s) actuellement`);
    }
    if (topOffres.length > 0) {
      positifs.push(
        `"${topOffres[0].titre}" est l'offre la plus populaire (${topOffres[0].candidatures} candidature(s))`
      );
    }
    if (performanceStats.noted > 0) {
      positifs.push(
        `Note moyenne des candidats : ${performanceStats.noteMoyenne.toFixed(1)}/5`
      );
    }

    if (candidaturesStats.enAttente > 0) {
      ameliorations.push(
        `${candidaturesStats.enAttente} candidature(s) en attente de traitement`
      );
    }
    if (offresStats.expirees > 0) {
      ameliorations.push(
        `${offresStats.expirees} offre(s) expirée(s) à renouveler ou supprimer`
      );
    }
    if (performanceStats.tauxReponse < 50 && candidaturesStats.total > 0) {
      ameliorations.push(
        `Taux de réponse encore faible (${performanceStats.tauxReponse.toFixed(1)}%)`
      );
    }
    if (offresStats.brouillons > 0) {
      ameliorations.push(
        `${offresStats.brouillons} offre(s) en brouillon à publier`
      );
    }

    return { positifs, ameliorations };
  }, [candidaturesStats, offresStats, topOffres, performanceStats]);

  const generateRapport = () => {
    window.print();
  };

  const exportData = () => {
    const rows: (string | number)[][] = [];
    rows.push(["Statistiques et rapports"]);
    rows.push(["Période", PERIOD_LABELS[periode] ?? periode]);
    rows.push([]);
    rows.push(["Offres"]);
    rows.push(["Total", offresStats.total]);
    rows.push(["Actives", offresStats.actives]);
    rows.push(["Expirées", offresStats.expirees]);
    rows.push(["Brouillons", offresStats.brouillons]);
    rows.push(["Nouvelles (période)", offresStats.nouvelles]);
    rows.push([]);
    rows.push(["Candidatures (période)"]);
    rows.push(["Total", candidaturesStats.total]);
    rows.push(["En attente", candidaturesStats.enAttente]);
    rows.push(["En révision", candidaturesStats.enRevision]);
    rows.push(["Acceptées", candidaturesStats.acceptees]);
    rows.push(["Refusées", candidaturesStats.refusees]);
    rows.push([]);
    rows.push(["Candidats"]);
    rows.push(["Total", candidatsStats.total]);
    rows.push(["Sur la période", candidatsStats.surPeriode]);
    rows.push(["Favoris", candidatsStats.favoris]);
    rows.push(["Contactés", candidatsStats.contactes]);
    rows.push([]);
    rows.push(["Performance"]);
    rows.push(["Taux de conversion (%)", performanceStats.tauxConversion.toFixed(1)]);
    rows.push(["Taux de réponse (%)", performanceStats.tauxReponse.toFixed(1)]);
    rows.push([
      "Temps moyen de traitement (jours)",
      performanceStats.tempsMoyenTraitement.toFixed(1),
    ]);
    rows.push([]);
    rows.push(["Top compétences", "Candidats", "Pourcentage"]);
    topCompetences.forEach((c) =>
      rows.push([c.nom, c.candidats, `${c.pourcentage}%`])
    );
    rows.push([]);
    rows.push(["Top offres (candidatures)", "Candidatures", "Pourcentage"]);
    topOffres.forEach((o) =>
      rows.push([o.titre, o.candidatures, `${o.pourcentage}%`])
    );
    rows.push([]);
    rows.push(["Répartition géographique", "Candidats", "Pourcentage"]);
    lieux.forEach((l) => rows.push([l.lieu, l.candidats, `${l.pourcentage}%`]));

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistiques-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCandidaturesEvolution = Math.max(
    ...evolution.candidatures.map((e) => e.valeur),
    1
  );
  const maxOffresEvolution = Math.max(
    ...evolution.offres.map((e) => e.valeur),
    1
  );

  const showOffres = vue === "global" || vue === "offres";
  const showCandidats = vue === "global" || vue === "candidats";
  const showPerformance = vue === "global" || vue === "performance";

  return (
    <RequirePlan minPlan="PME" featureName="Statistiques et rapports">
      <>
      <SiteHeader title="Statistiques et rapports" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconChartBar className="h-6 w-6" />
                  Statistiques et rapports
                </h1>
                <p className="text-muted-foreground mt-2">
                  Analysez vos performances de recrutement et générez des
                  rapports détaillés
                </p>
              </div>

              {/* Contrôles */}
              <Card className="mb-6 print:hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Période</label>
                        <Select value={periode} onValueChange={setPeriode}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERIOD_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vue</label>
                        <Select value={vue} onValueChange={setVue}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Globale</SelectItem>
                            <SelectItem value="offres">Par offres</SelectItem>
                            <SelectItem value="candidats">
                              Par candidats
                            </SelectItem>
                            <SelectItem value="performance">
                              Performance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={generateRapport}>
                        <IconPrinter className="h-4 w-4" />
                        Générer rapport
                      </Button>
                      <Button variant="outline" onClick={exportData}>
                        <IconDownload className="h-4 w-4" />
                        Exporter données (CSV)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Chargement des statistiques...
                </div>
              ) : (
              <>
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Offres actives
                        </p>
                        <p className="text-2xl font-bold">
                          {offresStats.actives}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {offresStats.total} au total
                        </p>
                      </div>
                      <IconBriefcase className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Candidatures
                        </p>
                        <p className="text-2xl font-bold">
                          {candidaturesStats.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          sur {PERIOD_LABELS[periode]?.toLowerCase()}
                        </p>
                      </div>
                      <IconMail className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Taux de conversion
                        </p>
                        <p className="text-2xl font-bold">
                          {performanceStats.tauxConversion.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {candidaturesStats.acceptees} accepté(s) sur{" "}
                          {candidaturesStats.total}
                        </p>
                      </div>
                      <IconTrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Temps moyen de traitement
                        </p>
                        <p className="text-2xl font-bold">
                          {performanceStats.tempsMoyenTraitement > 0
                            ? `${performanceStats.tempsMoyenTraitement.toFixed(1)}j`
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          Du dépôt à la décision
                        </p>
                      </div>
                      <IconCalendar className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Évolution des candidatures */}
                {(showOffres || showCandidats) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconChartBar className="h-5 w-5" />
                      Évolution des candidatures
                    </CardTitle>
                    <CardDescription>
                      Nombre de candidatures reçues par mois (6 derniers mois)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {evolution.candidatures.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium capitalize">
                            {item.mois}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.valeur / maxCandidaturesEvolution) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {item.valeur}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Évolution des offres */}
                {showOffres && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBriefcase className="h-5 w-5" />
                      Évolution des offres publiées
                    </CardTitle>
                    <CardDescription>
                      Nombre d'offres créées par mois (6 derniers mois)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {evolution.offres.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium capitalize">
                            {item.mois}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.valeur / maxOffresEvolution) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {item.valeur}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Top compétences */}
                {showCandidats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUsers className="h-5 w-5" />
                      Top compétences des candidats
                    </CardTitle>
                    <CardDescription>
                      Compétences les plus représentées chez vos candidats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topCompetences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune donnée de compétences disponible.
                      </p>
                    ) : (
                    <div className="space-y-4">
                      {topCompetences.map((competence, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{competence.nom}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {competence.candidats} candidat(s)
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {competence.pourcentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                    )}
                  </CardContent>
                </Card>
                )}
              </div>

              {/* Analyses détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top offres */}
                {showOffres && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBriefcase className="h-5 w-5" />
                      Offres les plus demandées
                    </CardTitle>
                    <CardDescription>
                      Offres ayant reçu le plus de candidatures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topOffres.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune candidature sur cette période.
                      </p>
                    ) : (
                    <div className="space-y-3">
                      {topOffres.map((offre, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm gap-2">
                            <span className="truncate">{offre.titre}</span>
                            <span className="font-medium shrink-0">
                              {offre.candidatures}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${offre.pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </CardContent>
                </Card>
                )}

                {/* Répartition géographique */}
                {showCandidats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMapPin className="h-5 w-5" />
                      Répartition géographique
                    </CardTitle>
                    <CardDescription>
                      Localisation des candidats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lieux.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune donnée de localisation disponible.
                      </p>
                    ) : (
                    <div className="space-y-3">
                      {lieux.map((lieu, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{lieu.lieu}</span>
                            <span className="font-medium">
                              {lieu.candidats}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${lieu.pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </CardContent>
                </Card>
                )}

                {/* Indicateurs de performance */}
                {showPerformance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconTrendingUp className="h-5 w-5" />
                      Indicateurs clés
                    </CardTitle>
                    <CardDescription>Métriques de performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de réponse</span>
                        <span className="font-bold text-green-600">
                          {performanceStats.tauxReponse.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Note moyenne des candidats</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">
                            {performanceStats.noted > 0
                              ? performanceStats.noteMoyenne.toFixed(1)
                              : "—"}
                          </span>
                          <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Candidats favoris</span>
                        <span className="font-bold">
                          {candidatsStats.favoris}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Candidats contactés</span>
                        <span className="font-bold">
                          {candidatsStats.contactes}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Candidats au total</span>
                        <span className="font-bold">
                          {candidatsStats.total}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>

              {/* Résumé et recommandations */}
              {showPerformance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconChartBar className="h-5 w-5" />
                    Résumé et recommandations
                  </CardTitle>
                  <CardDescription>
                    Analyse de vos performances et suggestions d'amélioration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-600">
                        Points positifs
                      </h4>
                      {recommandations.positifs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Pas encore assez de données.
                        </p>
                      ) : (
                      <ul className="space-y-2 text-sm">
                        {recommandations.positifs.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-600">
                        Axes d'amélioration
                      </h4>
                      {recommandations.ameliorations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Rien à signaler pour le moment.
                        </p>
                      ) : (
                      <ul className="space-y-2 text-sm">
                        {recommandations.ameliorations.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}
              </>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    </RequirePlan>
  );
}
