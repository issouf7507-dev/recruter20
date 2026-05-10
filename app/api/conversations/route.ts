import { NextRequest, NextResponse } from "next/server";
import { conversationRepository } from "@/lib/api/conversations/repository";
import { badRequest, withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const recruteurId = request.nextUrl.searchParams.get("recruteurId");
  if (!recruteurId) return badRequest("recruteurId est requis");
  const conversations = await conversationRepository.findByRecruteurId(recruteurId);
  return NextResponse.json({ success: true, data: conversations });
});

export const POST = withErrorHandler(async (req) => {
  const { jobOfferId, candidatId, recruteurId } = await (req as NextRequest).json();
  if (!jobOfferId || !candidatId || !recruteurId) {
    return badRequest("jobOfferId, candidatId et recruteurId sont requis");
  }
  const conversation = await conversationRepository.create({ jobOfferId, candidatId, recruteurId });
  return NextResponse.json({
    success: true,
    data: conversation,
    isNew: !conversation?.messages?.length,
  });
});
