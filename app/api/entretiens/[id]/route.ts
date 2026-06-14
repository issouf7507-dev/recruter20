import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;

  const recruteur = await prisma.recruteur.findFirst({
    where: { userId: session.user.id },
  });
  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 403 });
  }

  const entretien = await prisma.entretien.findFirst({
    where: { id, recruteurId: recruteur.id },
    include: {
      application: {
        include: {
          candidat: { select: { nom: true, prenom: true, image: true, telephone: true } },
          jobOffer: { select: { title: true } },
        },
      },
    },
  });
  if (!entretien) {
    return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: entretien });
});

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  const body = await (req as NextRequest).json();

  const recruteur = await prisma.recruteur.findFirst({
    where: { userId: session.user.id },
  });
  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 403 });
  }

  const existing = await prisma.entretien.findFirst({
    where: { id, recruteurId: recruteur.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
  }

  const { titre, dateHeure, type, lieu, notes, feedback, evaluation, statut } = body;

  const updated = await prisma.entretien.update({
    where: { id },
    data: {
      ...(titre !== undefined && { titre }),
      ...(dateHeure !== undefined && { dateHeure: new Date(dateHeure) }),
      ...(type !== undefined && { type }),
      ...(lieu !== undefined && { lieu }),
      ...(notes !== undefined && { notes }),
      ...(feedback !== undefined && { feedback }),
      ...(evaluation !== undefined && { evaluation: Math.min(5, Math.max(1, Number(evaluation))) }),
      ...(statut !== undefined && { statut }),
    },
    include: {
      application: {
        include: {
          candidat: { select: { nom: true, prenom: true, image: true } },
          jobOffer: { select: { title: true } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;

  const recruteur = await prisma.recruteur.findFirst({
    where: { userId: session.user.id },
  });
  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 403 });
  }

  const existing = await prisma.entretien.findFirst({
    where: { id, recruteurId: recruteur.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
  }

  await prisma.entretien.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
