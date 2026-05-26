import { NextResponse } from "next/server";
import { candidatRepository } from "@/lib/api/candidats";
import { withErrorHandler } from "@/lib/api-error";

export const GET = withErrorHandler(async () => {
  const facets = await candidatRepository.getFacets();
  return NextResponse.json({ success: true, data: facets });
});
