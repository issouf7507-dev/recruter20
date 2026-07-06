/**
 * Seed du compte Super Admin — YLSIX
 *
 * Idempotent et SÛR EN PRODUCTION (contrairement aux autres seeds).
 * Les identifiants sont lus depuis l'environnement — jamais en dur, jamais en argument
 * shell (pas d'historique) :
 *
 *   SUPERADMIN_EMAIL="admin@ylsix.com"
 *   SUPERADMIN_PASSWORD="un-mot-de-passe-fort"
 *   SUPERADMIN_NAME="Jean Dupont"        # optionnel
 *
 * Usage :
 *   npm run seed:superadmin
 *   # ou en une ligne (prod, sans laisser de trace dans .env) :
 *   SUPERADMIN_EMAIL=admin@ylsix.com SUPERADMIN_PASSWORD='…' npm run seed:superadmin
 *
 * Comportement :
 *   - compte inexistant → création (User + compte credential, emailVerified, isSuperAdmin) ;
 *   - compte existant   → on s'assure juste qu'il est superadmin (le mot de passe n'est
 *                         JAMAIS réécrit — idempotent, aucune donnée écrasée).
 *
 * La 2FA (obligatoire) se configure à la 1ʳᵉ connexion sur /superadmin/login.
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";

async function main() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME?.trim();

  if (!email) {
    console.error("❌ SUPERADMIN_EMAIL est requis.");
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`❌ Email invalide : ${email}`);
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isSuperAdmin: true },
  });

  // ── Compte déjà présent : on garantit juste le rôle (idempotent) ──
  if (existing) {
    if (existing.isSuperAdmin) {
      console.log(`✅ ${email} est déjà super admin — rien à faire.`);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { isSuperAdmin: true },
      });
      console.log(`✅ ${email} promu super admin (compte existant).`);
    }
    console.log("   ℹ️  Mot de passe inchangé. Connexion sur /superadmin/login.");
    return;
  }

  // ── Création de zéro : mot de passe obligatoire ──
  if (!password) {
    console.error(
      "❌ SUPERADMIN_PASSWORD est requis pour créer un nouveau compte.",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("❌ Le mot de passe doit contenir au moins 8 caractères.");
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
    // Compte "credential" better-auth : accountId == user.id
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

  console.log(`✅ Super admin créé : ${email}`);
  console.log(
    "   → Connexion sur /superadmin/login (la 2FA obligatoire se configure à la 1ʳᵉ connexion).",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
