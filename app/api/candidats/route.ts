import { NextRequest, NextResponse } from "next/server";
import { candidatRepository } from "@/lib/api/candidats";

/**
 * GET /api/candidats
 * Rechercher des candidats avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const lieu = searchParams.get("lieu") || undefined;
    const experience = searchParams.get("experience") || undefined;
    const competences = searchParams.getAll("competences");
    const certifications = searchParams.getAll("certifications");
    const domaine = searchParams.get("domaine") || undefined;
    const niveauEtude = searchParams.getAll("niveauEtude");
    const format = searchParams.get("format") || undefined;

    const result = await candidatRepository.search({
      page,
      limit,
      search,
      lieu,
      experience,
      competences: competences.length > 0 ? competences : undefined,
      certifications: certifications.length > 0 ? certifications : undefined,
      domaine,
      niveauEtude: niveauEtude.length > 0 ? niveauEtude : undefined,
      format,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error searching candidates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search candidates" },
      { status: 500 },
    );
  }
}
