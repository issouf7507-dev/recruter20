import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { emailService } from "@/lib/email";

const SUJETS = {
  support: "Support technique",
  sales: "Question commerciale",
  partnership: "Partenariat",
  other: "Autre",
} as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis").max(120),
  email: z.string().trim().email("Email invalide").max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.enum(["support", "sales", "partnership", "other"], {
    message: "Sélectionnez un sujet",
  }),
  message: z.string().trim().min(10, "Message trop court").max(5000),
  // Honeypot : rempli uniquement par les bots, invisible pour l'utilisateur.
  // Volontairement permissif — un bot doit recevoir un succès, pas une erreur
  // de validation qui lui indiquerait comment contourner le piège.
  website: z.string().max(500).optional(),
});

/**
 * Limitation basique par IP — mémoire du process, suffisant contre le spam
 * opportuniste sur un formulaire public. À remplacer par un store partagé
 * si l'app passe en multi-instance.
 */
const RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) hits.clear();

  return recent.length > RATE_LIMIT.max;
}

/**
 * POST /api/contact
 * Formulaire de contact du site public (aucune session requise).
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Trop de messages envoyés. Réessayez dans quelques minutes." },
      { status: 429 }
    );
  }

  const parsed = contactSchema.safeParse(await request.json());

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { name, email, phone, subject, message, website } = parsed.data;

  // Bot détecté : on répond succès sans rien envoyer.
  if (website) return NextResponse.json({ success: true });

  await emailService.sendContactSupportEmail({
    nom: name,
    email,
    sujet: `${SUJETS[subject]}${phone ? ` — ${phone}` : ""}`,
    message,
  });

  return NextResponse.json({ success: true });
});
