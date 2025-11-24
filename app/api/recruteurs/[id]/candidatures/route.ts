import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/api/candidatures/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const recruteurId = (await params)?.id;
    // if (!recruteurId) {
    //   return NextResponse.json(
    //     { success: false, error: "Recruteur ID is required" },
    //     { status: 400 }
    //   );
    // }

    const applications = await applicationService.getApplicationsByRecruteurId(
      recruteurId
    );
    // console.log("applications", applications);
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const applicationId = (await params)?.id;

    const { status } = await request.json();
    await applicationService.updateStatus(applicationId, status);
    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
