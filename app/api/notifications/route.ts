import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { recipientId: session.user.id, read: false },
    }),
  ]);
  return NextResponse.json({ success: true, data: notifications, unreadCount });
});

export const PUT = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);
  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, read: false },
    data: { read: true, readAt: new Date() },
  });
  return NextResponse.json({ success: true });
});
