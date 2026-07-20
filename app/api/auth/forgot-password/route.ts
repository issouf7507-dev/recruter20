import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { emailService } from "@/lib/email";
import { logger } from "@/lib/logger";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "L'email est requis" },
        { status: 400 },
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: { recruteur: true },
    });

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // On renvoie toujours un message de succès même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json(
        { message: "Si un compte existe, un email a été envoyé" },
        { status: 200 },
      );
    }

    // Seuls les comptes recruteur/collaborateur et candidat peuvent
    // réinitialiser leur mot de passe via ce flux.
    if (
      user.type !== "RECRUTEUR" &&
      user.type !== "COLLABORATEUR" &&
      user.type !== "CANDIDAT"
    ) {
      return NextResponse.json(
        { message: "Cette fonctionnalité n'est pas disponible pour ce compte" },
        { status: 403 },
      );
    }

    // Générer un token unique
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry,
      },
    });

    // Construire l'URL de réinitialisation selon le type de compte
    // (source de vérité : le type stocké en base, pas le body de la requête).
    const basePath =
      user.type === "CANDIDAT" ? "/auth/candidat" : "/auth/recruteur";
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}${basePath}/reset-password?token=${resetToken}`;

    await emailService.sendResetPasswordEmail({
      to: email,
      //   name: user?.firstName || user.email,
      name: user.email,
      resetUrl,
    });

    return NextResponse.json(
      { message: "Si un compte existe, un email a été envoyé" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Erreur forgot-password", { error: String(error) });
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
