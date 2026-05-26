import { NextResponse } from "next/server";
import { documentService } from "@/lib/api/documents";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await (ctx as Ctx).params;
  const documents = await documentService.getDocumentsByCandidatId(id);
  return NextResponse.json({ success: true, data: documents });
});
