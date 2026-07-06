// Crée ou promeut (ou rétrograde) un utilisateur super admin par email.
//
// Usage :
//   # Promouvoir un compte EXISTANT
//   npx tsx scripts/make-superadmin.ts email@exemple.com
//
//   # CRÉER un nouveau superadmin de zéro (compte + mot de passe)
//   npx tsx scripts/make-superadmin.ts email@exemple.com --password "MotDePasse123" --name "Jean Dupont"
//
//   # Rétrograder (retire le rôle, ne supprime pas le compte)
//   npx tsx scripts/make-superadmin.ts email@exemple.com --revoke
//
// Après création : le compte peut se connecter sur /superadmin/login ; la 2FA
// (obligatoire) sera configurée à la première connexion.
import { randomUUID } from "crypto";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

function getFlag(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const revoke = process.argv.includes("--revoke");
  const password = getFlag("password");
  const name = getFlag("name");

  if (!email || email.startsWith("--")) {
    console.error(
      "Usage:\n" +
        "  npx tsx scripts/make-superadmin.ts <email>                       # promouvoir un compte existant\n" +
        '  npx tsx scripts/make-superadmin.ts <email> --password "…" --name "…"  # créer un superadmin\n' +
        "  npx tsx scripts/make-superadmin.ts <email> --revoke              # rétrograder",
    );
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  // --- Cas 1 : le compte n'existe pas ---
  if (!existing) {
    if (revoke) {
      console.error(`Aucun utilisateur avec l'email ${email}`);
      process.exit(1);
    }
    if (!password) {
      console.error(
        `Aucun utilisateur avec l'email ${email}.\n` +
          `Pour en créer un, fournis un mot de passe : --password "MotDePasse123" [--name "Nom"]`,
      );
      process.exit(1);
    }
    if (password.length < 8) {
      console.error("Le mot de passe doit contenir au moins 8 caractères.");
      process.exit(1);
    }

    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name ?? email.split("@")[0],
          email,
          emailVerified: true,
          type: "RECRUTEUR",
          isSuperAdmin: true,
        },
        select: { id: true },
      });
      await tx.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    console.log(`✅ Superadmin créé : ${email}`);
    console.log("   → Connexion sur /superadmin/login (la 2FA sera configurée à la 1ʳᵉ connexion).");
    return;
  }

  // --- Cas 2 : le compte existe → on bascule le flag ---
  const isSuperAdmin = !revoke;
  await prisma.user.update({
    where: { id: existing.id },
    data: { isSuperAdmin },
  });

  console.log(
    `✅ ${email} est maintenant ${isSuperAdmin ? "SUPER ADMIN" : "un utilisateur normal"}`,
  );

  if (isSuperAdmin && password) {
    console.log(
      "ℹ️  Le compte existait déjà : le --password a été ignoré. " +
        "Utilise « mot de passe oublié » pour le réinitialiser si besoin.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
