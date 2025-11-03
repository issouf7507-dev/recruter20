import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jobOfferRepository } from "@/lib/api/offres/repository";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";

/**
 * GET /api/offres
 * Récupérer toutes les offres d'emploi (avec pagination et filtres)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const recruteurId = searchParams.get("recruteurId");
    const search = searchParams.get("search");
    const etat = searchParams.get("etat");

    // Utiliser le repository au lieu d'appeler Prisma directement
    const result = await jobOfferRepository.findAll({
      page,
      limit,
      recruteurId: recruteurId || undefined,
      search: search || undefined,
      etat: etat || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/offres
 * Créer une nouvelle offre d'emploi
 */
export async function POST(request: NextRequest) {
  try {
    // Get session using better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const {
      title,
      description,
      company,
      location,
      type,
      salaryMin,
      salaryMax,
    } = body;

    if (!title || !company) {
      return NextResponse.json(
        { success: false, error: "Title and company are required" },
        { status: 400 }
      );
    }

    // Get recruteur info from the user using repository
    const recruteur = await recruteurRepository.findByUserId(session.user.id);

    if (!recruteur) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter" },
        { status: 403 }
      );
    }

    // Create the job offer using repository
    const offre = await jobOfferRepository.create({
      title,
      company: company || recruteur.companyName || undefined,
      location: location || undefined,
      type: type || undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      description: description || undefined,
      requirements: body.requirements || undefined,
      benefits: body.benefits || undefined,
      skills: body.skills || undefined,
      recruteurId: recruteur.id,
      duedate: body.duedate ? new Date(body.duedate) : undefined,
      salaryCurrency: body.salaryCurrency || "",
    });

    return NextResponse.json({
      success: true,
      data: offre,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
