import { NextRequest, NextResponse } from "next/server";
import { candidatRepository } from "@/lib/api/candidats";
import { withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const p = request.nextUrl.searchParams;
  const competences = p.getAll("competences");
  const certifications = p.getAll("certifications");
  const niveauEtude = p.getAll("niveauEtude");

  const result = await candidatRepository.search({
    page: parseInt(p.get("page") || "1"),
    limit: parseInt(p.get("limit") || "10"),
    search: p.get("search") || undefined,
    lieu: p.get("lieu") || undefined,
    experience: p.get("experience") || undefined,
    competences: competences.length > 0 ? competences : undefined,
    certifications: certifications.length > 0 ? certifications : undefined,
    domaine: p.get("domaine") || undefined,
    niveauEtude: niveauEtude.length > 0 ? niveauEtude : undefined,
    format: p.get("format") || undefined,
  });

  return NextResponse.json({ success: true, data: result });
});
