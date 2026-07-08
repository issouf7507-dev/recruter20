import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, badRequest } from "@/lib/api-error";
import { jobOfferRepository } from "@/lib/api/offres/repository";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { collaborateurRepository } from "@/lib/api/collaborateur";
import prisma from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plans";
import { notify } from "@/lib/notify";
import { emailService } from "@/lib/email";

// Cache le listing public 60s — invalider manuellement si besoin
export const revalidate = 60;

/**
 * GET /api/offres
 * Récupérer toutes les offres d'emploi (avec pagination et filtres)
 */
export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const recruteurId = searchParams.get("recruteurId");
  const search = searchParams.get("search");
  const etat = searchParams.get("etat");
  const location = searchParams.get("location");
  const types = searchParams.get("types");
  const salaryMin = searchParams.get("salaryMin");
  const salaryMax = searchParams.get("salaryMax");
  const salaryCurrency = searchParams.get("salaryCurrency");
  const datePosted = searchParams.get("datePosted");
  const experience = searchParams.get("experience");
  const experienceMin = searchParams.get("experienceMin");
  const experienceMax = searchParams.get("experienceMax");

  // Utiliser le repository au lieu d'appeler Prisma directement
  const result = await jobOfferRepository.findAll({
    page,
    limit,
    recruteurId: recruteurId || undefined,
    search: search || undefined,
    etat: etat || undefined,
    location: location || undefined,
    types: types ? types.split(",") : undefined,
    salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
    salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
    salaryCurrency: salaryCurrency || undefined,
    datePosted: datePosted || undefined,
    experience: experience ? experience.split(",") : undefined,
    experienceMin: experienceMin ? parseInt(experienceMin) : undefined,
    experienceMax: experienceMax ? parseInt(experienceMax) : undefined,
  });

  return NextResponse.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/offres
 * Créer une nouvelle offre d'emploi
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

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
    return badRequest("Title and company are required");
  }

  // Get recruteur info from the user using repository
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

  // Vérifier le quota d'offres actives du plan
  const abonnement = await prisma.abonnement.findUnique({
    where: { recruteurId },
    select: { plan: true, statut: true },
  });
  const plan = getEffectivePlan(abonnement);

  if (plan.limits.maxOffresActives !== null) {
    const offresActives = await prisma.jobOffer.count({
      where: { recruteurId, etat: "active", deletedAt: null },
    });
    if (offresActives >= plan.limits.maxOffresActives) {
      return forbidden(
        `Limite atteinte : votre plan ${plan.name} autorise au maximum ${plan.limits.maxOffresActives} offre(s) active(s). Passez à un plan supérieur pour en publier davantage.`,
      );
    }
  }

  // Create the job offer using repository with the correct recruteurId
  const offre = await jobOfferRepository.create({
    title,
    company: company || recruteur?.companyName || undefined,
    location: location || undefined,
    type: type || undefined,
    salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
    salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
    description: description || undefined,
    requirements: body.requirements || undefined,
    benefits: body.benefits || undefined,
    skills: body.skills || undefined,
    recruteurId: recruteurId || "",
    duedate: body.duedate ? new Date(body.duedate) : undefined,
    salaryCurrency: body.salaryCurrency || "",
    logo: body.logo || undefined,
    etat: body.etat || "active",
  });

  // Confirmer au recruteur la publication de l'offre (notif DB + email)
  if (offre.etat === "active") {
    try {
      const owner = await prisma.recruteur.findUnique({
        where: { id: recruteurId },
        select: { user: { select: { id: true, name: true, email: true } } },
      });
      const ownerUser = owner?.user;
      if (ownerUser?.id) {
        await notify({
          recipientId: ownerUser.id,
          recipientType: "RECRUTEUR",
          type: "OFFER_PUBLISHED",
          data: { message: `Votre offre « ${offre.title} » est publiée`, offreId: offre.id, offreTitle: offre.title },
          email: ownerUser.email
            ? () =>
                emailService.sendOfferStatusEmail({
                  to: ownerUser.email!,
                  recruteurName: ownerUser.name || "Recruteur",
                  jobTitle: offre.title,
                  status: "published",
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
