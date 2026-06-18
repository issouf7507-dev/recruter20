import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
      return NextResponse.json({ error: "Aucun code envoyé. Demandez un nouveau code." }, { status: 400 });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return NextResponse.json({ error: "Code expiré. Demandez un nouveau code." }, { status: 400 });
    }

    if (user.verificationCode !== code.trim()) {
      return NextResponse.json({ error: "Code incorrect." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("verify-email-code:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
