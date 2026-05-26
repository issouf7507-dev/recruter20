import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: recruteurId } = await (ctx as Ctx).params;
  const applications = await applicationService.getApplicationsByRecruteurId(recruteurId);
  return NextResponse.json({ success: true, data: applications });
});

export const PUT = withErrorHandler(async (req, ctx) => {
  const { id: applicationId } = await (ctx as Ctx).params;
  const { status } = await (req as NextRequest).json();
  await applicationService.updateStatus(applicationId, status);
  return NextResponse.json({ success: true, message: "Status updated successfully" });
});
