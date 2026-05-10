import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandler(async (req, ctx) => {
  const { id: applicationId } = await (ctx as Ctx).params;
  const { favorite } = await (req as NextRequest).json();
  await applicationService.updateFavorite(applicationId, favorite);
  return NextResponse.json({ success: true, message: "Favorite updated successfully" });
});
