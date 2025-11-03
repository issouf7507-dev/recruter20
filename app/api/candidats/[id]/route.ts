import { candidatRepository } from "@/lib/api/candidats";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  console.log("body", body);
  const candidat = await candidatRepository.update(id, body);
  return NextResponse.json({ success: true, data: candidat });
}
