import { z } from "zod";

const envSchema = z.object({
  // Base de données
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  // Authentification
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET doit faire au moins 32 caractères"),
  BETTER_AUTH_URL: z.string().url().optional(),

  // Email (Resend)
  RESEND_API_KEY: z
    .string()
    .min(1, "RESEND_API_KEY est requis")
    .refine((v) => v.startsWith("re_"), {
      message: "RESEND_API_KEY doit commencer par 're_'",
    }),

  // Paiements (GeniusPay)
  GENIUSPAY_API_KEY: z.string().min(1, "GENIUSPAY_API_KEY est requis"),
  GENIUSPAY_API_SECRET: z.string().min(1, "GENIUSPAY_API_SECRET est requis"),
  GENIUSPAY_WEBHOOK_SECRET: z
    .string()
    .min(1, "GENIUSPAY_WEBHOOK_SECRET est requis"),

  // Stockage de fichiers (EdgeStore)
  EDGE_STORE_ACCESS_KEY: z
    .string()
    .min(1, "EDGE_STORE_ACCESS_KEY est requis"),
  EDGE_STORE_SECRET_KEY: z
    .string()
    .min(1, "EDGE_STORE_SECRET_KEY est requis"),

  // LinkedIn OAuth
  LINKEDIN_CLIENT_ID: z.string().min(1, "LINKEDIN_CLIENT_ID est requis"),
  LINKEDIN_CLIENT_SECRET: z
    .string()
    .min(1, "LINKEDIN_CLIENT_SECRET est requis"),
  LINKEDIN_REDIRECT_URI: z.string().url("LINKEDIN_REDIRECT_URI doit être une URL valide"),

  // URLs publiques
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL doit être une URL valide"),
  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3001"),

  // Serveur Socket.IO
  SOCKET_SERVER_URL: z.string().url().optional(),

  // IA — optionnel selon la feature activée
  ANTHROPIC_API_KEY: z.string().optional(),
  NEXT_PUBLIC_HUGGINGFACE_API_KEY: z.string().optional(),

  // Google OAuth — optionnel (commenté dans auth.ts pour l'instant)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Feature flags
  LINKEDIN_SHARE_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
  MATCHING_DEBUG: z.enum(["true", "false"]).optional().default("false"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const missing = result.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `\n[Env] Variables d'environnement invalides :\n${missing}\n\nVérifiez votre fichier .env`
  );
}

export const env = result.data;
