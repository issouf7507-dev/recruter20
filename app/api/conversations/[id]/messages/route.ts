import { NextRequest, NextResponse } from "next/server";
import { conversationRepository } from "@/lib/api/conversations/repository";
import { emailService } from "@/lib/email";
import { emitNewMessage } from "@/lib/socket-server";
import { badRequest, notFound, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (req, ctx) => {
  const { id: conversationId } = await (ctx as Ctx).params;
  const { senderId, senderType, content } = await (req as NextRequest).json();

  if (!senderId || !senderType || !content) {
    return badRequest("senderId, senderType et content sont requis");
  }

  const conversation = await conversationRepository.findWithDetails(conversationId);
  if (!conversation) return notFound("Conversation");

  const message = await conversationRepository.createMessage({
    conversationId, senderId, senderType, content,
  });
  await conversationRepository.updateActivity(conversationId);

  emitNewMessage({
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderType: message.senderType,
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  });

  if (senderType === "RECRUTEUR" && conversation.candidat?.user?.email) {
    const candidat = conversation.candidat;
    emailService
      .sendNewMessageNotification({
        to: candidat.user.email,
        candidatName: candidat.prenom && candidat.nom
          ? `${candidat.prenom} ${candidat.nom}`
          : candidat.user.name || "Candidat",
        recruteurName: conversation.recruteur?.user?.name || conversation.recruteur?.companyName || "Un recruteur",
        companyName: conversation.jobOffer?.company || null,
        jobTitle: conversation.jobOffer?.title || "Offre d'emploi",
        messagePreview: content,
        conversationId,
      })
      .catch((err) => console.error("Email notification error:", err));
  }

  return NextResponse.json({ success: true, data: message });
});

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: conversationId } = await (ctx as Ctx).params;
  const messages = await conversationRepository.findMessages(conversationId);
  return NextResponse.json({ success: true, data: messages });
});
