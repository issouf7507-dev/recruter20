"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useOffers } from "@/lib/hooks/use-offers";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_REVISION: "En révision",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

const chartConfig = {
  count: {
    label: "Candidatures",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function RecruteurDashboardPage() {
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const { data: offersData } = useOffers(
    { recruteurId: recruteurId ?? undefined, limit: 500 },
    { enabled: !!recruteurId }
  );
  const {
    candidaturesRecruteur,
    isLoadingRecruteur: isLoadingCandidatures,
  } = useCandidatures(recruteurId ?? undefined);

  const offers = offersData?.items ?? [];
  const candidatures = candidaturesRecruteur ?? [];

  const stats = useMemo(() => {
    const totalOffres = offers.length;
    const offresActives = offers.filter((o) => o.etat === "active").length;
    const totalCandidatures = candidatures.length;
    const enAttente = candidatures.filter(
      (c: { status: string }) => c.status === "EN_ATTENTE"
    ).length;
    return {
      totalOffres,
      offresActives,
      totalCandidatures,
      enAttente,
    };
  }, [offers, candidatures]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = 30;
    const dayCounts: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayCounts[key] = 0;
    }
    candidatures.forEach((c: { createdAt: string }) => {
      const key = new Date(c.createdAt).toISOString().split("T")[0];
      if (key in dayCounts) dayCounts[key]++;
    });
    return Object.entries(dayCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [candidatures]);

  const recentCandidatures = useMemo(
    () =>
      [...candidatures]
        .sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
    [candidatures]
  );

  const [timeRange, setTimeRange] = useState("30d");
  const filteredChartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    return chartData.slice(-days);
  }, [chartData, timeRange]);

  useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  return (
    <>
      <SiteHeader title="Tableau de bord" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Cartes de statistiques */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardDescription>Offres publiées</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {stats.totalOffres}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="link" className="px-0" asChild>
                    <Link href="/recruteur/offres">
                      Voir les offres <IconArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Offres actives</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {stats.offresActives}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm">
                    Visibles par les candidats
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Candidatures reçues</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {stats.totalCandidatures}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="link" className="px-0" asChild>
                    <Link href="/recruteur/candidatures">
                      Voir les candidatures{" "}
                      <IconArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>En attente</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {stats.enAttente}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm">
                    À traiter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Graphique candidatures */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Candidatures reçues</CardTitle>
                    <CardDescription>
                      Évolution sur la période
                    </CardDescription>
                  </div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 derniers jours</SelectItem>
                      <SelectItem value="30d">30 derniers jours</SelectItem>
                      <SelectItem value="90d">90 derniers jours</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                  >
                    <AreaChart data={filteredChartData}>
                      <defs>
                        <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--color-count)"
                            stopOpacity={1}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("fr-FR", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) =>
                              new Date(value).toLocaleDateString("fr-FR", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })
                            }
                            formatter={(value) => [
                              `${value} candidature${Number(value) > 1 ? "s" : ""}`,
                              "Reçues",
                            ]}
                          />
                        }
                      />
                      <Area
                        dataKey="count"
                        type="natural"
                        fill="url(#fillCount)"
                        stroke="var(--color-count)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Dernières candidatures */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Dernières candidatures</CardTitle>
                    <CardDescription>
                      Les 10 dernières candidatures reçues
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/recruteur/candidatures">
                      Voir tout <IconArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingCandidatures ? (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      Chargement...
                    </div>
                  ) : recentCandidatures.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      Aucune candidature pour le moment
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidat</TableHead>
                          <TableHead>Offre</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentCandidatures.map(
                          (c: {
                            id: string;
                            candidat?: {
                              nom?: string | null;
                              prenom?: string | null;
                              email?: string;
                            };
                            jobOffer?: { id: string; title: string };
                            status: string;
                            createdAt: string;
                          }) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">
                                {c.candidat
                                  ? `${c.candidat.prenom ?? ""} ${c.candidat.nom ?? ""}`.trim() ||
                                  c.candidat.email ||
                                  "—"
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {c.jobOffer?.title ?? "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(c.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {STATUS_LABELS[c.status] ?? c.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/recruteur/candidatures?applicationId=${c.id}`}
                                  >
                                    Voir
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
