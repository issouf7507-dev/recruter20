import { NextRequest, NextResponse } from "next/server";
import { collaborateurRepository } from "@/lib/api/collaborateur/repository";
import { notFound, withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const userId = request.nextUrl.searchParams.get("userId");

  if (userId) {
    const collaborateur = await collaborateurRepository.findByUserId(userId);
    if (!collaborateur) return notFound("Collaborateur");
    return NextResponse.json({ success: true, data: collaborateur });
  }

  const collaborateurs = await collaborateurRepository.findAll({ limit: 10 });
  return NextResponse.json({ success: true, data: collaborateurs });
});
