import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const STATUS_MAP: Record<string, string> = {
  EN_ATTENTE: "pending",
  COMPLETE: "completed",
  ECHOUE: "failed",
  EXPIRE: "expired",
  REMBOURSE: "refunded",
};

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("ref");

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Référence manquante" },
      { status: 400 },
    );
  }

  const paiement = await prisma.paiementHistory.findUnique({
    where: { reference },
    select: { statut: true, montant: true },
  });

  if (!paiement) {
    return NextResponse.json(
      { success: false, error: "Paiement introuvable" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    status: STATUS_MAP[paiement.statut] ?? "pending",
    amount: paiement.montant,
  });
}
