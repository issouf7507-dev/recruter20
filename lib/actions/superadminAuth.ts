"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type SuperAdminAuthStatus = {
  authenticated: boolean;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
};

/**
 * Statut d'auth de l'utilisateur courant pour l'espace superadmin.
 * Le flag isSuperAdmin est toujours relu en base, jamais depuis la session.
 */
export async function getSuperAdminAuthStatus(): Promise<SuperAdminAuthStatus> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { authenticated: false, isSuperAdmin: false, twoFactorEnabled: false };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true, twoFactorEnabled: true },
  });
  return {
    authenticated: true,
    isSuperAdmin: !!user?.isSuperAdmin,
    twoFactorEnabled: !!user?.twoFactorEnabled,
  };
}
