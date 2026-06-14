import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler } from "@/lib/api-error";
import { emailService } from "@/lib/email";

export const GET = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const url = new URL((req as NextRequest).url);
  const recruteurId = url.searchParams.get("recruteurId");
  const applicationId = url.searchParams.get("applicationId");

  const recruteur = await prisma.recruteur.findFirst({
    where: { userId: session.user.id },
  });
  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 403 });
  }

  const where: Record<string, unknown> = { recruteurId: recruteur.id };
  if (recruteurId && recruteurId !== recruteur.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  if (applicationId) where.applicationId = applicationId;

  const entretiens = await prisma.entretien.findMany({
    where,
    include: {
      application: {
        include: {
          candidat: { select: { nom: true, prenom: true, image: true } },
          jobOffer: { select: { title: true } },
        },
      },
    },
    orderBy: { dateHeure: "asc" },
  });

  return NextResponse.json({ success: true, data: entretiens });
});

export const POST = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const body = await (req as NextRequest).json();
  const { applicationId, titre, dateHeure, type, lieu, notes } = body;

  if (!applicationId || !titre || !dateHeure) {
    return NextResponse.json(
      { error: "applicationId, titre et dateHeure sont requis" },
      { status: 400 }
    );
  }

  const recruteur = await prisma.recruteur.findFirst({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 403 });
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobOffer: { recruteurId: recruteur.id } },
  });
  if (!application) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  const entretien = await prisma.entretien.create({
    data: {
      applicationId,
      recruteurId: recruteur.id,
      titre,
      dateHeure: new Date(dateHeure),
      type: type ?? "VISIO",
      lieu: lieu ?? null,
      notes: notes ?? null,
    },
    include: {
      application: {
        include: {
          candidat: { select: { nom: true, prenom: true, image: true, user: { select: { email: true } } } },
          jobOffer: { select: { title: true, company: true } },
        },
      },
    },
  });

  const candidatEmail = entretien.application.candidat.user?.email;
  if (candidatEmail) {
    const { candidat, jobOffer } = entretien.application;
    emailService
      .sendEntretienScheduledEmail({
        to: candidatEmail,
        candidatName: candidat.prenom && candidat.nom ? `${candidat.prenom} ${candidat.nom}` : "Candidat",
        recruteurName: recruteur.user?.name || recruteur.companyName || "Un recruteur",
        companyName: recruteur.companyName,
        jobTitle: jobOffer.title,
        titre: entretien.titre,
        dateHeure: entretien.dateHeure,
        type: entretien.type,
        lieu: entretien.lieu,
      })
      .catch((err) => console.error("Email notification error:", err));
  }

  return NextResponse.json({ success: true, data: entretien }, { status: 201 });
});
