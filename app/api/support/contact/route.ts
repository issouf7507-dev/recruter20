import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { requireSession } from "@/lib/api-auth";
import { emailService } from "@/lib/email";

const contactSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().trim().email("Email invalide"),
  sujet: z.string().trim().min(1, "Le sujet est requis"),
  message: z.string().trim().min(1, "Le message est requis"),
});

/**
 * POST /api/support/contact
 * Envoyer un message depuis le formulaire "Aide et support"
 */
export const POST = withErrorHandler(async (req) => {
  await requireSession(req as NextRequest);

  const body = await (req as NextRequest).json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  await emailService.sendContactSupportEmail(parsed.data);

  return NextResponse.json({ success: true });
});
