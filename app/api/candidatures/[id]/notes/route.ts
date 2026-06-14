import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (req, ctx) => {
  await requireSession(req as NextRequest);
  const { id: applicationId } = await (ctx as Ctx).params;
  const notes = await prisma.applicationNote.findMany({
    where: { applicationId, authorType: "CANDIDAT_NOTE" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: notes });
});

export const POST = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: applicationId } = await (ctx as Ctx).params;
  const { content, entretienDate } = await (req as NextRequest).json();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { candidat: { select: { userId: true } } },
  });
  if (!application || application.candidat.userId !== session.user.id) return forbidden();

  const note = await prisma.applicationNote.create({
    data: {
      applicationId,
      content,
      entretienDate: entretienDate ? new Date(entretienDate) : null,
      authorId: session.user.id,
      authorType: "CANDIDAT_NOTE",
    },
  });
  return NextResponse.json({ success: true, data: note }, { status: 201 });
});

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await requireSession(req as NextRequest);
  const { id: applicationId } = await (ctx as Ctx).params;
  const url = new URL((req as NextRequest).url);
  const noteId = url.searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "noteId requis" }, { status: 400 });

  const note = await prisma.applicationNote.findUnique({ where: { id: noteId } });
  if (!note || note.applicationId !== applicationId || note.authorId !== session.user.id) return forbidden();

  await prisma.applicationNote.delete({ where: { id: noteId } });
  return NextResponse.json({ success: true });
});
