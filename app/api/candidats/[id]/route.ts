import { candidatRepository } from "@/lib/api/candidats";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const candidat = await prisma.candidat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        candidatCompetences: true,
        experiences: {
          orderBy: { dateDebut: "desc" },
        },
        formations: {
          orderBy: { dateDebut: "desc" },
        },
        documents: true,
        applications: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { success: false, error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: candidat });
  } catch (error) {
    console.error("Error fetching candidat:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du candidat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // console.log("body", body);
  const candidat = await candidatRepository.update(id, body);
  return NextResponse.json({ success: true, data: candidat });
}
