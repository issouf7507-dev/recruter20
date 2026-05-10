import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token et nouveau mot de passe requis" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 },
      );
    }

    // Trouver le user via le token custom
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Lien invalide ou expiré. Recommencez la procédure." },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    // Better Auth stocke le mot de passe dans Account (providerId = "credential")
    // ET dans User.password — on met à jour les deux pour garantir la compatibilité.
    await Promise.all([
      // 1. Mettre à jour Account.password (lu par Better Auth lors de la connexion)
      prisma.account.updateMany({
        where: {
          userId: user.id,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      }),
      // 2. Mettre à jour User + effacer le token
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiry: null,
          passwordNeedsUpdate: false,
        },
      }),
    ]);

    logger.info("Mot de passe réinitialisé", { userId: user.id });

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Erreur reset-password", { error: String(error) });
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
