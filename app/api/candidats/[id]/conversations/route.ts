import { NextResponse } from "next/server";
import { conversationRepository } from "@/lib/api/conversations/repository";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: candidatId } = await (ctx as Ctx).params;
  const conversations = await conversationRepository.findByCandidatId(candidatId);
  return NextResponse.json({ success: true, data: conversations });
});
