"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin";
import type { UserType } from "@/app/generated/prisma";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  type: UserType;
  isSuperAdmin?: boolean;
};

export type CreateUserResult =
  | { ok: true }
  | { ok: false; error: string };

const VALID_TYPES: UserType[] = ["CANDIDAT", "RECRUTEUR", "COLLABORATEUR"];

/**
 * Crée un compte utilisateur depuis l'espace superadmin.
 *
 * On crée le User + l'Account "credential" manuellement (avec le hash de
 * mot de passe de better-auth) plutôt que d'appeler auth.api.signUpEmail :
 * cela évite que la création n'ouvre une session et n'écrase le cookie du
 * superadmin qui effectue l'opération.
 */
export async function createUserAsSuperAdmin(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  // Ré-autorise l'appelant (relit isSuperAdmin + 2FA en base)
  await requireSuperAdmin();

  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";

  if (!name) return { ok: false, error: "Le nom est requis." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Adresse email invalide." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (!VALID_TYPES.includes(input.type)) {
    return { ok: false, error: "Type d'utilisateur invalide." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "Un compte existe déjà avec cet email." };
  }

  // Hash du mot de passe via le contexte interne de better-auth
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          emailVerified: true,
          type: input.type,
          isSuperAdmin: input.isSuperAdmin ?? false,
        },
        select: { id: true },
      });
      // Compte "credential" better-auth : accountId == user.id (comme les comptes existants)
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
  } catch (err) {
    console.error("createUserAsSuperAdmin:", err);
    return { ok: false, error: "La création a échoué. Réessayez." };
  }

  revalidatePath("/superadmin/utilisateurs");
  return { ok: true };
}

export type ToggleResult =
  | { ok: true; isSuperAdmin: boolean }
  | { ok: false; error: string };

/**
 * Accorde ou retire le rôle super admin à un utilisateur, à la demande depuis
 * la table Utilisateurs. Le rôle de l'appelant est relu en base par le guard.
 *
 * Garde-fou : un superadmin ne peut pas se retirer son propre rôle (évite de se
 * verrouiller hors de l'espace). La rétrogradation d'un autre compte reste possible.
 */
export async function setSuperAdminRole(
  userId: string,
  isSuperAdmin: boolean,
): Promise<ToggleResult> {
  const admin = await requireSuperAdmin();

  if (!userId) return { ok: false, error: "Utilisateur introuvable." };

  if (userId === admin.id && !isSuperAdmin) {
    return {
      ok: false,
      error: "Vous ne pouvez pas retirer votre propre rôle super admin.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) return { ok: false, error: "Utilisateur introuvable." };

  await prisma.user.update({
    where: { id: userId },
    data: { isSuperAdmin },
  });

  revalidatePath("/superadmin/utilisateurs");
  return { ok: true, isSuperAdmin };
}
