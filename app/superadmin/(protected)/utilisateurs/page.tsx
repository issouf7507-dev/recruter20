import Link from "next/link";
import { IconSearch, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { requireSuperAdmin } from "@/lib/superadmin";
import prisma from "@/lib/prisma";
import type { Prisma, UserType } from "@/app/generated/prisma";
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
import { Input } from "@/components/ui/input";
import { CreateUserDialog } from "@/components/superadmin/create-user-dialog";
import { UserDetailSheet } from "@/components/superadmin/user-detail-sheet";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const TYPE_LABELS: Record<string, string> = {
  CANDIDAT: "Candidat",
  RECRUTEUR: "Recruteur",
  COLLABORATEUR: "Collaborateur",
};

const TYPE_FILTERS = ["TOUS", "CANDIDAT", "RECRUTEUR", "COLLABORATEUR"] as const;

export default async function SuperadminUtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const admin = await requireSuperAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const type = TYPE_FILTERS.includes(params.type as (typeof TYPE_FILTERS)[number])
    ? params.type!
    : "TOUS";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.UserWhereInput = {
    ...(q && {
      OR: [{ name: { contains: q } }, { email: { contains: q } }],
    }),
    ...(type !== "TOUS" && { type: type as UserType }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        isSuperAdmin: true,
        twoFactorEnabled: true,
        createdAt: true,
        recruteur: { select: { companyName: true, phone: true } },
        candidat: { select: { ville: true, telephone: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type !== "TOUS") sp.set("type", type);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/superadmin/utilisateurs${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("fr-FR")} compte{total > 1 ? "s" : ""}
            {q && ` pour « ${q} »`}
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <form
        method="GET"
        action="/superadmin/utilisateurs"
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom ou email…"
            className="pl-8"
          />
        </div>
        <select
          name="type"
          defaultValue={type}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t === "TOUS" ? "Tous les types" : TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrer
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Comptes</CardTitle>
          <CardDescription>
            Page {page} sur {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entreprise / Ville</TableHead>
                <TableHead>Email vérifié</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Aucun utilisateur ne correspond à cette recherche.
                  </TableCell>
                </TableRow>
              )}
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {u.name ?? "—"}
                      {u.isSuperAdmin && <Badge>Super admin</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {u.type ? TYPE_LABELS[u.type] ?? u.type : "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.recruteur?.companyName ?? u.candidat?.ville ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.emailVerified ? "default" : "secondary"}>
                      {u.emailVerified ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt.toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserDetailSheet
                      isSelf={u.id === admin.id}
                      user={{
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        type: u.type,
                        emailVerified: u.emailVerified,
                        isSuperAdmin: u.isSuperAdmin,
                        twoFactorEnabled: u.twoFactorEnabled,
                        createdAt: u.createdAt,
                        companyName: u.recruteur?.companyName ?? null,
                        phone: u.recruteur?.phone ?? u.candidat?.telephone ?? null,
                        ville: u.candidat?.ville ?? null,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              {page <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                  <IconChevronLeft className="size-4" />
                  Précédent
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(page - 1)}>
                    <IconChevronLeft className="size-4" />
                    Précédent
                  </Link>
                </Button>
              )}
              {page >= totalPages ? (
                <Button variant="outline" size="sm" disabled>
                  Suivant
                  <IconChevronRight className="size-4" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(page + 1)}>
                    Suivant
                    <IconChevronRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
