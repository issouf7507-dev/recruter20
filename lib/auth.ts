import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";
// import { sendEmail } from "@/lib/email";
import { emailService } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,

    // Fonction d'envoi d'email pour la réinitialisation
    sendResetPassword: async ({ user, url, token }, request) => {
      // Ne pas attendre pour éviter les timing attacks
      emailService
        .sendResetPasswordEmail({
          to: user.email,
          name: user.name || user.email.split("@")[0],
          resetUrl: url,
        })
        .catch((err) => console.error("Erreur envoi email:", err));
    },
    // Callback optionnel après réinitialisation
    onPasswordReset: async (user, request) => {
      console.log(`Password reset for user: ${user.user.email}`);
      // Vous pouvez ajouter un log ou une notification ici
    },

    // sendResetPassword: async ({ user, url, token }, request) => {
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Réinitialisez votre mot de passe - Ylsix",
    //     text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${url}`,
    //     html: `
    //       <!DOCTYPE html>
    //       <html>
    //         <head>
    //           <meta charset="utf-8">
    //           <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //           <title>Réinitialisation de mot de passe</title>
    //         </head>
    //         <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    //           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    //             <h1 style="color: white; margin: 0;">Réinitialisation de mot de passe</h1>
    //           </div>

    //           <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    //             <p style="font-size: 16px;">Bonjour,</p>

    //             <p style="font-size: 16px;">
    //               Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
    //             </p>

    //             <div style="text-align: center; margin: 30px 0;">
    //               <a href="${url}"
    //                  style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
    //                 Réinitialiser mon mot de passe
    //               </a>
    //             </div>

    //             <p style="font-size: 14px; color: #666;">
    //               Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
    //             </p>
    //             <p style="font-size: 12px; color: #999; word-break: break-all;">
    //               ${url}
    //             </p>

    //             <p style="font-size: 14px; color: #666; margin-top: 30px;">
    //               <strong>Note :</strong> Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    //             </p>
    //           </div>
    //         </body>
    //       </html>
    //     `,
    //   });
    // },
    // onPasswordReset: async ({ user }, request) => {
    //   console.log(
    //     `Le mot de passe de l'utilisateur ${user.email} a été réinitialisé.`
    //   );
    //   // Vous pouvez ajouter ici d'autres logiques, comme envoyer un email de confirmation
    // },
  },

  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID as string,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  //   },
  // },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "https://ylsix.com",
  ],

  // twoFactor : TOTP obligatoire pour les superadmins (imposé côté guard).
  // nextCookies() doit rester le dernier plugin.
  plugins: [twoFactor({ issuer: "Ylsix Super Admin" }), nextCookies()],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
  },
});
