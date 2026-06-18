import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { badRequest, forbidden, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

const PROVIDERS = {
  claude: { prefix: "sk-ant-", label: "Claude (Anthropic)" },
  openai: { prefix: "sk-", label: "GPT-4 (OpenAI)" },
} as const;

function maskKey(provider: string, key: string): string {
  if (provider === "claude") return `sk-ant-${"•".repeat(20)}${key.slice(-4)}`;
  if (provider === "openai") return `sk-${"•".repeat(20)}${key.slice(-4)}`;
  return `${"•".repeat(20)}${key.slice(-4)}`;
}

/** GET /api/recruteurs/[id]/claude-key — retourne si une clé est configurée (masquée) */
export const GET = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: recruteurId } = await (ctx as Ctx).params;

  const recruteur = await prisma.recruteur.findUnique({
    where: { id: recruteurId },
    select: { userId: true, aiApiKey: true, aiProvider: true },
  });

  if (!recruteur || recruteur.userId !== session.user.id) return forbidden();

  return NextResponse.json({
    success: true,
    data: {
      hasKey: !!recruteur.aiApiKey,
      provider: recruteur.aiProvider || "claude",
      maskedKey: recruteur.aiApiKey
        ? maskKey(recruteur.aiProvider || "claude", recruteur.aiApiKey)
        : null,
    },
  });
});

/** PUT /api/recruteurs/[id]/claude-key — sauvegarder ou supprimer la clé */
export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: recruteurId } = await (ctx as Ctx).params;
  const { apiKey, provider } = await (req as NextRequest).json();

  const recruteur = await prisma.recruteur.findUnique({
    where: { id: recruteurId },
    select: { userId: true },
  });

  if (!recruteur || recruteur.userId !== session.user.id) return forbidden();

  if (apiKey !== null && apiKey !== undefined) {
    const selectedProvider = provider || "claude";
    const providerConfig = PROVIDERS[selectedProvider as keyof typeof PROVIDERS];

    if (!providerConfig) {
      return badRequest(`Provider inconnu : ${selectedProvider}`);
    }
    if (!String(apiKey).startsWith(providerConfig.prefix)) {
      return badRequest(
        `La clé ${providerConfig.label} doit commencer par '${providerConfig.prefix}'`
      );
    }
  }

  await prisma.recruteur.update({
    where: { id: recruteurId },
    data: {
      aiApiKey: apiKey || null,
      aiProvider: apiKey ? (provider || "claude") : null,
    },
  });

  return NextResponse.json({ success: true });
});
