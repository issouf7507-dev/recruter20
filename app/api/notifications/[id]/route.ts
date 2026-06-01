import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id } = await (ctx as Ctx).params;
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.recipientId !== session.user.id) return forbidden();
  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });
  return NextResponse.json({ success: true, data: updated });
});
