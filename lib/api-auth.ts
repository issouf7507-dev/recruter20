import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
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
