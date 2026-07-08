import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound } from "@/lib/api-error";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import { notify } from "@/lib/notify";
import { emailService } from "@/lib/email";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/offres/[id]
 * Récupérer une offre d'emploi par ID
 */
export const GET = withErrorHandler(async (req, ctx) => {
  const { id } = await (ctx as Ctx).params;

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
    return notFound("Offer");
  }

  return NextResponse.json({
    success: true,
    data: offre,
  });
});

/**
 * PUT /api/offres/[id]
 * Mettre à jour une offre d'emploi
 */
export const PUT = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const { id } = await (ctx as Ctx).params;
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
    return notFound("Offer");
  }

  const recruteur = await recruteurRepository.findByUserId(session.user.id);
  const collaborateur = await collaborateurRepository.findByUserId(
    session.user.id,
  );
  const recruteurId = recruteur
    ? recruteur?.id
    : collaborateur?.recruteurId || "";

  if (!recruteurId) {
    return forbidden("User is not a recruiter or collaborateur");
  }

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
      etat: body.etat,
      duedate: body.duedate ? new Date(body.duedate) : null,
      logo: body.logo,
    },
  });

  // Notifier le recruteur si l'état de l'offre a changé (publiée / clôturée)
  const prevEtat = existingOffre.etat;
  const nextEtat = offre.etat;
  if (nextEtat !== prevEtat && (nextEtat === "active" || nextEtat === "expiree")) {
    try {
      const ownerUser = existingOffre.recruteur?.user;
      if (ownerUser?.id) {
        const status = nextEtat === "active" ? "published" : "closed";
        await notify({
          recipientId: ownerUser.id,
          recipientType: "RECRUTEUR",
          type: nextEtat === "active" ? "OFFER_PUBLISHED" : "OFFER_CLOSED",
          data: {
            message:
              nextEtat === "active"
                ? `Votre offre « ${offre.title} » est publiée`
                : `Votre offre « ${offre.title} » est clôturée`,
            offreId: offre.id,
            offreTitle: offre.title,
          },
          email: ownerUser.email
            ? () =>
                emailService.sendOfferStatusEmail({
                  to: ownerUser.email!,
                  recruteurName: ownerUser.name || "Recruteur",
                  jobTitle: offre.title,
                  status,
                })
            : null,
        });
      }
    } catch {
      // Notification non critique
    }
  }

  return NextResponse.json({
    success: true,
    data: offre,
  });
});

/**
 * DELETE /api/offres/[id]
 * Supprimer une offre d'emploi
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const { id } = await (ctx as Ctx).params;

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
    return notFound("Offer");
  }

  const recruteur = await recruteurRepository.findByUserId(session.user.id);
  const collaborateur = await collaborateurRepository.findByUserId(
    session.user.id,
  );
  const recruteurId = recruteur
    ? recruteur?.id
    : collaborateur?.recruteurId || "";

  if (!recruteurId) {
    return forbidden("User is not a recruiter or collaborateur");
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
});
