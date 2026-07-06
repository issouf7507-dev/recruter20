import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Guard serveur pour l'espace /superadmin.
 * À appeler en tête de chaque page et layout protégé.
 *
 * Sécurité :
 * - le flag isSuperAdmin est TOUJOURS relu en base (jamais depuis la session) ;
 * - la 2FA (TOTP) est obligatoire : un superadmin sans 2FA active est renvoyé
 *   vers la page de login qui impose la configuration.
 *
 * Note : quand la 2FA est active, better-auth ne délivre pas de session complète
 * tant que le code TOTP n'a pas été validé — une session valide implique donc
 * déjà le second facteur.
 */
export async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/superadmin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      twoFactorEnabled: true,
    },
  });

  if (!user?.isSuperAdmin) {
    redirect("/");
  }

  if (!user.twoFactorEnabled) {
    redirect("/superadmin/login");
  }

  return user;
}
