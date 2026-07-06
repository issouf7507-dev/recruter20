import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function requireSession(req: NextRequest | Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user) {
    throw new ApiError(401, "Non autorisé");
  }
  return session;
}

export async function requireRecruteurSession(req: NextRequest | Request) {
  const session = await requireSession(req);
  const type = (session.user as { type?: string }).type;
  if (type !== "RECRUTEUR" && type !== "COLLABORATEUR") {
    throw new ApiError(403, "Accès réservé aux recruteurs");
  }
  return session;
}

export async function requireCandidatSession(req: NextRequest | Request) {
  const session = await requireSession(req);
  const type = (session.user as { type?: string }).type;
  if (type !== "CANDIDAT") {
    throw new ApiError(403, "Accès réservé aux candidats");
  }
  return session;
}

// Le flag est re-vérifié en base à chaque appel, jamais depuis la session.
// La 2FA est exigée : une session valide implique déjà le TOTP validé, mais on
// vérifie aussi le flag pour rejeter un superadmin qui n'aurait pas encore configuré la 2FA.
export async function requireSuperAdminSession(req: NextRequest | Request) {
  const session = await requireSession(req);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true, twoFactorEnabled: true },
  });
  if (!user?.isSuperAdmin) {
    throw new ApiError(403, "Accès réservé au super administrateur");
  }
  if (!user.twoFactorEnabled) {
    throw new ApiError(403, "Double authentification requise");
  }
  return session;
}
