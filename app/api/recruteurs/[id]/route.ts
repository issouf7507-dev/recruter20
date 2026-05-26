import { recruteurRepository } from "@/lib/api/recruteurs";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { recruteur, user } =
    await recruteurRepository.updateRecruteurInformation(id, body);
  return NextResponse.json({
    success: true,
    data: { recruteur, user },
    message: "Recruteur information updated successfully",
  });
}
