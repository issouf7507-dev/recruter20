import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/collaborateurs?recruteurId=xxx
 * Récupérer tous les collaborateurs d'un recruteur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const recruteurId = searchParams.get("recruteurId");

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur a accès à ce recruteur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Si l'utilisateur est un recruteur, vérifier qu'il s'agit de son propre recruteurId
    if (user.type === "RECRUTEUR") {
      const recruteur = await prisma.recruteur.findUnique({
        where: { userId: session.user.id },
      });

      if (!recruteur || recruteur.id !== recruteurId) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 },
        );
      }
    } else if (user.type === "COLLABORATEUR") {
      // Si l'utilisateur est un collaborateur, vérifier qu'il appartient à ce recruteur
      const collaborateur = await prisma.collaborateur.findUnique({
        where: { userId: session.user.id },
      });

      if (!collaborateur || collaborateur.recruteurId !== recruteurId) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 },
        );
      }
    }

    // Récupérer tous les collaborateurs du recruteur
    const collaborateurs = await prisma.collaborateur.findMany({
      where: {
        recruteurId,
      },
      include: {
        invitation: {
          select: {
            accepted: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: collaborateurs,
    });
  } catch (error: any) {
    console.error("Error fetching collaborateurs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch collaborateurs",
      },
      { status: 500 },
    );
  }
}
