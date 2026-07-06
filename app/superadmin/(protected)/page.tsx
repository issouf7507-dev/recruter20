import Link from "next/link";
import {
  IconUsers,
  IconBuilding,
  IconBriefcase,
  IconFileText,
  IconArrowRight,
} from "@tabler/icons-react";
import { requireSuperAdmin } from "@/lib/superadmin";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignupsChart } from "@/components/superadmin/signups-chart";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  CANDIDAT: "Candidat",
  RECRUTEUR: "Recruteur",
  COLLABORATEUR: "Collaborateur",
};

async function getSignupsPerDay(days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await prisma.$queryRaw<{ jour: string; total: bigint }[]>`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS jour, COUNT(*) AS total
    FROM \`user\`
    WHERE createdAt >= ${since}
    GROUP BY jour
    ORDER BY jour ASC
  `;
  const byDay = new Map(rows.map((r) => [r.jour, Number(r.total)]));

  // Complète les jours sans inscription avec 0 pour un axe continu
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDay.get(key) ?? 0 };
  });
}

export default async function SuperadminDashboardPage() {
  await requireSuperAdmin();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCandidats,
    totalRecruteurs,
    totalCollaborateurs,
    offresActives,
    totalCandidatures,
    abonnementsActifs,
    nouveauxUsers30j,
    signups,
    derniersInscrits,
  ] = await Promise.all([
    prisma.candidat.count(),
    prisma.recruteur.count(),
    prisma.collaborateur.count(),
    prisma.jobOffer.count({ where: { etat: "active", deletedAt: null } }),
    prisma.application.count(),
    prisma.abonnement.count({ where: { statut: "ACTIF" } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    getSignupsPerDay(30),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Candidats",
      value: totalCandidats,
      icon: IconUsers,
      sub: `${totalCollaborateurs} collaborateurs`,
    },
    {
      label: "Recruteurs",
      value: totalRecruteurs,
      icon: IconBuilding,
      sub: `${abonnementsActifs} abonnements actifs`,
    },
    {
      label: "Offres actives",
      value: offresActives,
      icon: IconBriefcase,
      sub: "hors offres supprimées",
    },
    {
      label: "Candidatures",
      value: totalCandidatures,
      icon: IconFileText,
      sub: "toutes offres confondues",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground">
          {nouveauxUsers30j} nouvelles inscriptions sur les 30 derniers jours
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {value.toLocaleString("fr-FR")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {sub}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscriptions par jour</CardTitle>
          <CardDescription>30 derniers jours, tous types confondus</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupsChart data={signups} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dernières inscriptions</CardTitle>
            <CardDescription>Les 8 comptes les plus récents</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/superadmin/utilisateurs">
              Tous les utilisateurs
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email vérifié</TableHead>
                <TableHead>Inscrit le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {derniersInscrits.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {u.type ? TYPE_LABELS[u.type] ?? u.type : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.emailVerified ? "default" : "secondary"}>
                      {u.emailVerified ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt.toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
