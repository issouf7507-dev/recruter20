import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { auth } from "@/lib/auth";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import { jobOfferRepository } from "@/lib/api/offres/repository";

const prisma = new PrismaClient();

interface PublishRequest {
  offerId: string;
  platforms: string[];
  message?: string;
}

/**
 * POST /api/multidiffusion
 * Publie une offre sur les plateformes sélectionnées
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    const body: PublishRequest = await request.json();
    const { offerId, platforms, message } = body;

    if (!offerId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: "Paramètres manquants" },
        { status: 400 },
      );
    }

    // Récupérer le recruteurId
    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
    }

    // Récupérer l'offre
    const offer = await jobOfferRepository.findById(offerId, {});
    if (!offer) {
      return NextResponse.json(
        { success: false, error: "Offre non trouvée" },
        { status: 404 },
      );
    }

    const results: Array<{
      platform: string;
      success: boolean;
      postId?: string;
      postUrl?: string;
      error?: string;
    }> = [];

    // Traiter chaque plateforme
    for (const platform of platforms) {
      if (platform === "linkedin") {
        const linkedInResult = await publishToLinkedIn(
          recruteurId,
          offer,
          message,
        );
        results.push(linkedInResult);

        // Sauvegarder dans l'historique
        await saveToHistory(
          recruteurId,
          offerId,
          platform,
          linkedInResult,
          message || generateDefaultMessage(offer),
        );
      }
      // Ajouter d'autres plateformes ici
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Multi-diffusion error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la publication" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/multidiffusion
 * Récupère l'historique des diffusions
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le recruteurId
    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id,
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Profil recruteur non trouvé" },
        { status: 404 },
      );
    }

    // Récupérer l'historique
    const history = await prisma.$queryRaw<
      Array<{
        id: string;
        jobOfferId: string;
        platform: string;
        status: string;
        postId: string | null;
        postUrl: string | null;
        message: string;
        publishedAt: Date | null;
        createdAt: Date;
      }>
    >`
      SELECT id, jobOfferId, platform, status, postId, postUrl, message, publishedAt, createdAt
      FROM diffusion_history
      WHERE recruteurId = ${recruteurId}
      ORDER BY createdAt DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get diffusion history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération de l'historique",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Publie sur LinkedIn via l'API
 */
async function publishToLinkedIn(
  recruteurId: string,
  offer: any,
  customMessage?: string,
): Promise<{
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}> {
  try {
    // Récupérer le compte LinkedIn
    const linkedInAccount = await prisma.$queryRaw<
      Array<{
        accessToken: string;
        personId: string;
        expiresAt: Date;
      }>
    >`
      SELECT accessToken, personId, expiresAt
      FROM linkedin_account
      WHERE recruteurId = ${recruteurId}
      LIMIT 1
    `;

    if (!linkedInAccount || linkedInAccount.length === 0) {
      return {
        platform: "linkedin",
        success: false,
        error: "Compte LinkedIn non connecté",
      };
    }

    const account = linkedInAccount[0];

    // Vérifier l'expiration
    if (new Date(account.expiresAt) < new Date()) {
      return {
        platform: "linkedin",
        success: false,
        error: "Token LinkedIn expiré, veuillez vous reconnecter",
      };
    }

    // Générer le message
    const message = customMessage || generateDefaultMessage(offer);

    // URL de l'offre
    const offerUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://ylsix.com"
    }/offres/${offer.id}`;

    // Appeler l'API LinkedIn UGC Posts
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${account.personId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: message,
            },
            shareMediaCategory: "ARTICLE",
            media: [
              {
                status: "READY",
                originalUrl: offerUrl,
                title: {
                  text: offer.title,
                },
                description: {
                  text: `${offer.company || ""} - ${offer.location || ""}`,
                },
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("LinkedIn API error:", errorData);
      return {
        platform: "linkedin",
        success: false,
        error: "Erreur lors de la publication sur LinkedIn",
      };
    }

    const result = await response.json();
    const postId = result.id;

    // Construire l'URL du post (format: urn:li:share:xxx -> linkedin.com/feed/update/urn:li:share:xxx)
    const postUrl = postId
      ? `https://www.linkedin.com/feed/update/${postId}`
      : undefined;

    return {
      platform: "linkedin",
      success: true,
      postId,
      postUrl,
    };
  } catch (error) {
    console.error("LinkedIn publish error:", error);
    return {
      platform: "linkedin",
      success: false,
      error: "Erreur inattendue lors de la publication",
    };
  }
}

/**
 * Génère le message par défaut pour une offre
 */
function generateDefaultMessage(offer: any): string {
  const salaryText =
    offer.salaryMin && offer.salaryMax
      ? `💰 Salaire: ${offer.salaryMin.toLocaleString()} - ${offer.salaryMax.toLocaleString()} ${
          offer.salaryCurrency || "EUR"
        }\n`
      : "";

  const description = offer.description
    ? offer.description.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
    : "";

  return `🚀 Nous recrutons !

📌 ${offer.title}
🏢 ${offer.company || "Notre entreprise"}
📍 ${offer.location || "France"}
📋 ${offer.type || "CDI"}
${salaryText}
${description}

👉 Postulez dès maintenant ou partagez cette offre avec votre réseau !

#Recrutement #Emploi #${(offer.title || "").replace(/\s+/g, "")} #Opportunité`;
}

/**
 * Sauvegarde dans l'historique
 */
async function saveToHistory(
  recruteurId: string,
  jobOfferId: string,
  platform: string,
  result: {
    success: boolean;
    postId?: string;
    postUrl?: string;
    error?: string;
  },
  message: string,
) {
  try {
    const id = `dh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const status = result.success ? "published" : "failed";
    const publishedAt = result.success ? new Date() : null;

    await prisma.$executeRaw`
      INSERT INTO diffusion_history (id, recruteurId, jobOfferId, platform, status, postId, postUrl, message, error, publishedAt, createdAt)
      VALUES (${id}, ${recruteurId}, ${jobOfferId}, ${platform}, ${status}, ${
        result.postId || null
      }, ${result.postUrl || null}, ${message}, ${
        result.error || null
      }, ${publishedAt}, NOW())
    `;
  } catch (error) {
    console.error("Save to history error:", error);
  }
}
