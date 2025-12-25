import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";

const prisma = new PrismaClient();

/**
 * GET /api/auth/linkedin/callback
 * Callback LinkedIn OAuth - échange le code contre un token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Gestion des erreurs LinkedIn
    if (error) {
      console.error("LinkedIn OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/recruteur/multi-diffusion?error=${encodeURIComponent(
            errorDescription || error
          )}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Paramètres manquants",
          request.url
        )
      );
    }

    // Décoder le state pour récupérer l'userId
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/recruteur/multi-diffusion?error=State invalide", request.url)
      );
    }

    // Vérifier que le state n'est pas trop vieux (15 minutes max)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Session expirée, veuillez réessayer",
          request.url
        )
      );
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Configuration serveur manquante",
          request.url
        )
      );
    }

    // 1. Échanger le code contre un access_token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("LinkedIn token error:", errorData);
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Erreur lors de l'échange du token",
          request.url
        )
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // 2. Récupérer le profil LinkedIn avec /v2/userinfo (OpenID Connect)
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error("LinkedIn profile error:", errorData);
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Erreur lors de la récupération du profil",
          request.url
        )
      );
    }

    const profileData = await profileResponse.json();

    // Extraire les données du profil
    const personId = profileData.sub; // L'ID unique LinkedIn
    const profileName =
      profileData.name ||
      `${profileData.given_name} ${profileData.family_name}`;
    const profileImage = profileData.picture;

    // 3. Récupérer le recruteurId
    const recruteur = await recruteurRepository.findByUserId(stateData.userId);
    const collaborateur = await collaborateurRepository.findByUserId(
      stateData.userId
    );
    const recruteurId = recruteur?.id || collaborateur?.recruteurId;

    if (!recruteurId) {
      return NextResponse.redirect(
        new URL(
          "/recruteur/multi-diffusion?error=Profil recruteur non trouvé",
          request.url
        )
      );
    }

    // 4. Sauvegarder ou mettre à jour le compte LinkedIn
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.$executeRaw`
      INSERT INTO linkedin_account (id, recruteurId, accessToken, expiresAt, personId, profileName, profileImage, createdAt, updatedAt)
      VALUES (${`li_${Date.now()}`}, ${recruteurId}, ${access_token}, ${expiresAt}, ${personId}, ${profileName}, ${profileImage}, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        accessToken = ${access_token},
        expiresAt = ${expiresAt},
        personId = ${personId},
        profileName = ${profileName},
        profileImage = ${profileImage},
        updatedAt = NOW()
    `;

    // 5. Rediriger vers la page avec succès
    return NextResponse.redirect(
      new URL(
        "/recruteur/multi-diffusion?connected=linkedin&success=true",
        request.url
      )
    );
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return NextResponse.redirect(
      new URL("/recruteur/multi-diffusion?error=Erreur inattendue", request.url)
    );
  } finally {
    await prisma.$disconnect();
  }
}
