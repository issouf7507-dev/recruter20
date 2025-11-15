import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const applicationId = (await params)?.id;

    const { favorite } = await request.json();
    await applicationService.updateFavorite(applicationId, favorite);
    return NextResponse.json({
      success: true,
      message: "Favorite updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
