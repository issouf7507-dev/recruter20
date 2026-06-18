import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/email";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email déjà vérifié" }, { status: 400 });
    }

    // Limite : max 1 envoi par minute
    if (user.verificationCodeExpiry) {
      const remaining = user.verificationCodeExpiry.getTime() - Date.now();
      if (remaining > 14 * 60 * 1000) {
        return NextResponse.json(
          { error: "Veuillez attendre avant de demander un nouveau code." },
          { status: 429 }
        );
      }
    }

    const code = generateCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationCode: code, verificationCodeExpiry: expiry },
    });

    await emailService.sendVerificationCodeEmail({
      to: email,
      name: user.name || email.split("@")[0],
      code,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("send-verification-code:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
