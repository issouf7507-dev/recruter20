import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/auth/linkedin
 * Démarre le flux OAuth LinkedIn
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
        { status: 401 }
      );
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { success: false, error: "Configuration LinkedIn manquante" },
        { status: 500 }
      );
    }

    // Permissions de base (OpenID Connect)
    // Note: w_member_social nécessite l'approbation du produit "Share on LinkedIn"
    // Pour l'instant, on utilise uniquement les scopes de base
    const baseScopes = "openid profile email";

    // Vérifier si le scope de publication est activé via variable d'env
    const hasSharePermission = process.env.LINKEDIN_SHARE_ENABLED === "true";
    const scope = hasSharePermission
      ? `${baseScopes} w_member_social`
      : baseScopes;

    // State pour sécurité CSRF (stocke l'userId)
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString("base64");

    // URL d'autorisation LinkedIn OAuth 2.0
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scope);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'authentification LinkedIn" },
      { status: 500 }
    );
  }
}
