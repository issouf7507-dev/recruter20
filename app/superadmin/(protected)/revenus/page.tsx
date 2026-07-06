import {
  IconTrendingUp,
  IconWallet,
  IconDatabase,
  IconReceipt,
} from "@tabler/icons-react";
import { requireSuperAdmin } from "@/lib/superadmin";
import prisma from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { CVTHEQUE_PLANS } from "@/lib/cvtheque-plans";
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

export const dynamic = "force-dynamic";

const PAIEMENT_BADGES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  COMPLETE: { label: "Complété", variant: "default" },
  EN_ATTENTE: { label: "En attente", variant: "secondary" },
  ECHOUE: { label: "Échoué", variant: "destructive" },
  EXPIRE: { label: "Expiré", variant: "outline" },
  REMBOURSE: { label: "Remboursé", variant: "outline" },
};

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

function planPrice(plan: string): number {
  return Object.values(PLANS).find((p) => p.planType === plan)?.price ?? 0;
}

function cvthequePlanPrice(plan: string): number {
  return (
    Object.values(CVTHEQUE_PLANS).find((p) => p.planType === plan)?.price ?? 0
  );
}

export default async function SuperadminRevenusPage() {
  await requireSuperAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    abonnementsParPlan,
    cvthequeParPlan,
    encaisseMois,
    encaisseCvthequeMois,
    encaisseTotal,
    encaisseCvthequeTotal,
    derniersPaiements,
    derniersPaiementsCvtheque,
  ] = await Promise.all([
    prisma.abonnement.groupBy({
      by: ["plan"],
      where: { statut: "ACTIF" },
      _count: true,
    }),
    prisma.abonnementCVtheque.groupBy({
      by: ["plan"],
      where: { statut: "ACTIF" },
      _count: true,
    }),
    prisma.paiementHistory.aggregate({
      where: { statut: "COMPLETE", createdAt: { gte: startOfMonth } },
      _sum: { montant: true },
    }),
    prisma.paiementCVtheque.aggregate({
      where: { statut: "COMPLETE", createdAt: { gte: startOfMonth } },
      _sum: { montant: true },
    }),
    prisma.paiementHistory.aggregate({
      where: { statut: "COMPLETE" },
      _sum: { montant: true },
    }),
    prisma.paiementCVtheque.aggregate({
      where: { statut: "COMPLETE" },
      _sum: { montant: true },
    }),
    prisma.paiementHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        abonnement: {
          include: {
            recruteur: { select: { companyName: true, email: true } },
          },
        },
      },
    }),
    prisma.paiementCVtheque.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        abonnement: {
          include: {
            recruteur: { select: { companyName: true, email: true } },
          },
        },
      },
    }),
  ]);

  const mrrAts = abonnementsParPlan.reduce(
    (sum, g) => sum + g._count * planPrice(g.plan),
    0,
  );
  const mrrCvtheque = cvthequeParPlan.reduce(
    (sum, g) => sum + g._count * cvthequePlanPrice(g.plan),
    0,
  );

  const encaisseCeMois =
    (encaisseMois._sum.montant ?? 0) + (encaisseCvthequeMois._sum.montant ?? 0);
  const encaisseDepuisDebut =
    (encaisseTotal._sum.montant ?? 0) +
    (encaisseCvthequeTotal._sum.montant ?? 0);

  // Fusionne les paiements ATS et CVthèque en un seul flux chronologique
  const paiements = [
    ...derniersPaiements.map((p) => ({ ...p, produit: "ATS" as const })),
    ...derniersPaiementsCvtheque.map((p) => ({
      ...p,
      produit: "CVthèque" as const,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 12);

  const stats = [
    {
      label: "MRR estimé",
      value: fcfa(mrrAts + mrrCvtheque),
      icon: IconTrendingUp,
      sub: `ATS ${fcfa(mrrAts)} · CVthèque ${fcfa(mrrCvtheque)}`,
    },
    {
      label: "Encaissé ce mois",
      value: fcfa(encaisseCeMois),
      icon: IconWallet,
      sub: "paiements complétés (ATS + CVthèque)",
    },
    {
      label: "Encaissé au total",
      value: fcfa(encaisseDepuisDebut),
      icon: IconReceipt,
      sub: "depuis le lancement",
    },
    {
      label: "Abonnements actifs",
      value: String(
        abonnementsParPlan.reduce((s, g) => s + g._count, 0) +
          cvthequeParPlan.reduce((s, g) => s + g._count, 0),
      ),
      icon: IconDatabase,
      sub: `${abonnementsParPlan.reduce((s, g) => s + g._count, 0)} ATS · ${cvthequeParPlan.reduce((s, g) => s + g._count, 0)} CVthèque`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Revenus</h1>
        <p className="text-sm text-muted-foreground">
          Abonnements ATS SaaS et CVthèque Premium
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
              <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {sub}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Abonnements ATS actifs par plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Abonnés</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abonnementsParPlan.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun abonnement actif.
                    </TableCell>
                  </TableRow>
                )}
                {abonnementsParPlan.map((g) => (
                  <TableRow key={g.plan}>
                    <TableCell className="font-medium">{g.plan}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {g._count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fcfa(g._count * planPrice(g.plan))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnements CVthèque actifs par plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Abonnés</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvthequeParPlan.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Aucun abonnement actif.
                    </TableCell>
                  </TableRow>
                )}
                {cvthequeParPlan.map((g) => (
                  <TableRow key={g.plan}>
                    <TableCell className="font-medium">{g.plan}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {g._count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fcfa(g._count * cvthequePlanPrice(g.plan))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Derniers paiements</CardTitle>
          <CardDescription>
            ATS et CVthèque confondus, tous statuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paiements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Aucun paiement enregistré.
                  </TableCell>
                </TableRow>
              )}
              {paiements.map((p) => {
                const badge = PAIEMENT_BADGES[p.statut] ?? {
                  label: p.statut,
                  variant: "outline" as const,
                };
                return (
                  <TableRow key={`${p.produit}-${p.id}`}>
                    <TableCell className="font-mono text-xs">
                      {p.reference}
                    </TableCell>
                    <TableCell>
                      {p.abonnement.recruteur.companyName ??
                        p.abonnement.recruteur.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.produit}</Badge>
                    </TableCell>
                    <TableCell>{p.plan}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fcfa(p.montant)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.createdAt.toLocaleDateString("fr-FR")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
