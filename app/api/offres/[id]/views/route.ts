import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notFound, withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const updated = await prisma.jobOffer.update({
    where: { id },
    data: { views: { increment: 1 } },
    select: { id: true, views: true },
  });
  return NextResponse.json({ success: true, data: { views: updated.views } });
});

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const offer = await prisma.jobOffer.findUnique({ where: { id }, select: { id: true, views: true } });
  if (!offer) return notFound("Offre");
  return NextResponse.json({ success: true, data: { views: offer.views ?? 0 } });
});
