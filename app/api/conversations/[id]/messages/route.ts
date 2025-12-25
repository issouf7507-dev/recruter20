import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/email";

/**
 * POST /api/conversations/[id]/messages
 * Envoyer un message dans une conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();
    const { senderId, senderType, content } = body;

    if (!senderId || !senderType || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "senderId, senderType et content sont requis",
        },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe avec les infos nécessaires
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        recruteur: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        jobOffer: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderType,
        content,
      },
    });

    // Mettre à jour la date de dernière activité de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Envoyer une notification email au candidat si le message vient du recruteur
    if (senderType === "RECRUTEUR" && conversation.candidat?.user?.email) {
      const candidatEmail = conversation.candidat.user.email;
      const candidatName =
        conversation.candidat.prenom && conversation.candidat.nom
          ? `${conversation.candidat.prenom} ${conversation.candidat.nom}`
          : conversation.candidat.user.name || "Candidat";
      const recruteurName =
        conversation.recruteur?.user?.name ||
        conversation.recruteur?.companyName ||
        "Un recruteur";
      const companyName = conversation.jobOffer?.company || null;
      const jobTitle = conversation.jobOffer?.title || "Offre d'emploi";

      // Envoyer l'email de notification (sans bloquer la réponse)
      emailService
        .sendNewMessageNotification({
          to: candidatEmail,
          candidatName,
          recruteurName,
          companyName,
          jobTitle,
          messagePreview: content,
          conversationId,
        })
        .then((result) => {
          if (result.success) {
            console.log(
              `Email de notification envoyé à ${candidatEmail} pour la conversation ${conversationId}`
            );
          } else {
            console.warn(
              `Échec de l'envoi de l'email de notification: ${result.error}`
            );
          }
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'envoi de l'email de notification:",
            error
          );
        });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversations/[id]/messages
 * Récupérer tous les messages d'une conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
