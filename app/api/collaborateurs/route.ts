import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { badRequest, forbidden, notFound, withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);
  const recruteurId = request.nextUrl.searchParams.get("recruteurId");
  if (!recruteurId) return badRequest("recruteurId est requis");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return notFound("Utilisateur");

  if (user.type === "RECRUTEUR") {
    const recruteur = await prisma.recruteur.findUnique({ where: { userId: session.user.id } });
    if (!recruteur || recruteur.id !== recruteurId) return forbidden("Accès refusé");
  } else if (user.type === "COLLABORATEUR") {
    const collaborateur = await prisma.collaborateur.findUnique({ where: { userId: session.user.id } });
    if (!collaborateur || collaborateur.recruteurId !== recruteurId) return forbidden("Accès refusé");
  }

  const collaborateurs = await prisma.collaborateur.findMany({
    where: { recruteurId },
    include: {
      invitation: { select: { accepted: true } },
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: collaborateurs });
});
