import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { badRequest, forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/recruteurs/[id]/claude-key — retourne si une clé est configurée (masquée) */
export const GET = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: recruteurId } = await (ctx as Ctx).params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recruteur = await (prisma.recruteur as any).findUnique({
    where: { id: recruteurId },
    select: { userId: true, claudeApiKey: true },
  }) as { userId: string; claudeApiKey: string | null } | null;

  if (!recruteur || recruteur.userId !== session.user.id) return forbidden();

  return NextResponse.json({
    success: true,
    data: {
      hasKey: !!recruteur.claudeApiKey,
      maskedKey: recruteur.claudeApiKey
        ? `sk-ant-${"•".repeat(20)}${recruteur.claudeApiKey.slice(-4)}`
        : null,
    },
  });
});

/** PUT /api/recruteurs/[id]/claude-key — sauvegarder ou supprimer la clé */
export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: recruteurId } = await (ctx as Ctx).params;
  const { apiKey } = await (req as NextRequest).json();

  const recruteur = await prisma.recruteur.findUnique({
    where: { id: recruteurId },
    select: { userId: true },
  });

  if (!recruteur || recruteur.userId !== session.user.id) return forbidden();

  if (apiKey !== null && apiKey !== undefined && !String(apiKey).startsWith("sk-ant-")) {
    return badRequest("La clé doit commencer par 'sk-ant-'");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.recruteur as any).update({
    where: { id: recruteurId },
    data: { claudeApiKey: apiKey || null },
  });

  return NextResponse.json({ success: true });
});
