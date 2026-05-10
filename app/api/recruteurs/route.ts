import { NextRequest, NextResponse } from "next/server";
import { recruteurRepository } from "@/lib/api/recruteurs/repository";
import { notFound, withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const userId = request.nextUrl.searchParams.get("userId");

  if (userId) {
    const recruteur = await recruteurRepository.findByUserId(userId);
    if (!recruteur) return notFound("Recruteur");
    return NextResponse.json({ success: true, data: recruteur });
  }

  const recruteurs = await recruteurRepository.findAll({ limit: 10 });
  return NextResponse.json({ success: true, data: recruteurs });
});
