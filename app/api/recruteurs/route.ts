import { NextRequest, NextResponse } from "next/server";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";

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
      const recruteur = await recruteurRepository.findByUserId(userId);

      if (!recruteur) {
        return NextResponse.json(
          { success: false, error: "Recruteur not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: recruteur,
      });
    }

    // Otherwise, list all recruteurs (optional)
    const recruteurs = await recruteurRepository.findAll({ limit: 10 });

    return NextResponse.json({
      success: true,
      data: recruteurs,
    });
  } catch (error) {
    console.error("Error fetching recruteur:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recruteur" },
      { status: 500 }
    );
  }
}
