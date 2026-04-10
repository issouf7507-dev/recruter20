import { NextResponse } from "next/server";
import { candidatRepository } from "@/lib/api/candidats";

/**
 * GET /api/candidats/facets
 * Returns distinct values for filter dropdowns (lieux, competences, certifications)
 * so filters search across ALL candidates, not only the current page.
 */
export async function GET() {
  try {
    const facets = await candidatRepository.getFacets();
    return NextResponse.json({
      success: true,
      data: facets,
    });
  } catch (error) {
    console.error("Error fetching candidats facets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facets" },
      { status: 500 },
    );
  }
}
