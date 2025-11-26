import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";

/**
 * GET /api/offres/[id]
 * Récupérer une offre d'emploi par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const offre = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        recruteur: true,
        applications: {
          include: {
            candidat: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!offre) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: offre,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offer" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/offres/[id]
 * Mettre à jour une offre d'emploi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if offer exists and belongs to user
    const existingOffre = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        recruteur: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingOffre) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id
    );
    const recruteurId = recruteur
      ? recruteur?.id
      : collaborateur?.recruteurId || "";

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter or collaborateur" },
        { status: 403 }
      );
    }

    // if (existingOffre.recruteur.userId !== session.user.id) {
    //   return NextResponse.json(
    //     { success: false, error: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    // Update the job offer
    const offre = await prisma.jobOffer.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        company: body.company,
        location: body.location,
        type: body.type,
        salaryMin: body.salaryMin ? parseFloat(body.salaryMin) : null,
        salaryMax: body.salaryMax ? parseFloat(body.salaryMax) : null,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        benefits: body.benefits,
        skills: body.skills,
        etat: body.etat,
        experience: body.experience,
        duedate: body.duedate ? new Date(body.duedate) : null,
        logo: body.logo,
      },
    });

    return NextResponse.json({
      success: true,
      data: offre,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/offres/[id]
 * Supprimer une offre d'emploi
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if offer exists and belongs to user
    const existingOffre = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        recruteur: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingOffre) {
      return NextResponse.json(
        { success: false, error: "Offer not found" },
        { status: 404 }
      );
    }

    const recruteur = await recruteurRepository.findByUserId(session.user.id);
    const collaborateur = await collaborateurRepository.findByUserId(
      session.user.id
    );
    const recruteurId = recruteur
      ? recruteur?.id
      : collaborateur?.recruteurId || "";

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "User is not a recruiter or collaborateur" },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.jobOffer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        etat: "deleted",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
