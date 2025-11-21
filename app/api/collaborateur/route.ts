import { NextRequest, NextResponse } from "next/server";

import { collaborateurRepository } from "@/lib/api/collaborateur/repository";

/**
 * GET /api/recruteurs
 * Get recruteur by userId or list recruteurs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // If userId is provided, get the specific recruteur
    if (userId) {
      const collaborateur = await collaborateurRepository.findByUserId(userId);

      if (!collaborateur) {
        return NextResponse.json(
          { success: false, error: "Collaborateur not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: collaborateur,
      });
    }

    // Otherwise, list all recruteurs (optional)
    const collaborateurs = await collaborateurRepository.findAll({ limit: 10 });

    return NextResponse.json({
      success: true,
      data: collaborateurs,
    });
  } catch (error) {
    console.error("Error fetching recruteur:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recruteur" },
      { status: 500 }
    );
  }
}
