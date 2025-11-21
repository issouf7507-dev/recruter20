import nodemailer from "nodemailer";

/**
 * Service d'envoi d'emails avec Mailtrap
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Configuration Mailtrap pour le développement
    // En production, vous pouvez utiliser SMTP réel
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "2525"),
      auth: {
        user: process.env.SMTP_USERNAME || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });
  }

  /**
   * Envoyer un email d'invitation
   */
  async sendInvitationEmail({
    to,
    invitationToken,
    recruteurName,
    companyName,
    role,
    expiresAt,
  }: {
    to: string;
    invitationToken: string;
    recruteurName: string;
    companyName?: string | null;
    role: string;
    expiresAt: Date;
  }) {
    const acceptUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invitations/accept/${invitationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation à collaborer</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Invitation à collaborer</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Bonjour,</p>
            
            <p style="font-size: 16px;">
              <strong>${recruteurName}</strong>${
      companyName ? ` de ${companyName}` : ""
    } vous invite à rejoindre son équipe de recrutement en tant que <strong>${role}</strong>.
            </p>
            
            <p style="font-size: 16px;">
              En acceptant cette invitation, vous pourrez :
            </p>
            
            <ul style="font-size: 16px; padding-left: 20px;">
              <li>Accéder à l'espace de recrutement</li>
              <li>Gérer les candidatures selon vos permissions</li>
              <li>Collaborer avec l'équipe</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Accepter l'invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>Note importante :</strong> Cette invitation expire le ${new Date(
                expiresAt
              ).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">
              ${acceptUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Bonjour,
      
      ${recruteurName}${
      companyName ? ` de ${companyName}` : ""
    } vous invite à rejoindre son équipe de recrutement en tant que ${role}.
      
      En acceptant cette invitation, vous pourrez accéder à l'espace de recrutement et gérer les candidatures selon vos permissions.
      
      Cliquez sur ce lien pour accepter l'invitation :
      ${acceptUrl}
      
      Cette invitation expire le ${new Date(expiresAt).toLocaleDateString(
        "fr-FR"
      )}.
      
      Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
    `;

    try {
      const info = await this.transporter!.sendMail({
        from:
          process.env.MAILTRAP_FROM ||
          `"${recruteurName}" <noreply@recruteur20.com>`,
        to,
        subject: `Invitation à collaborer - ${
          companyName || "Équipe de recrutement"
        }`,
        text,
        html,
      });

      console.log("Email envoyé:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error("Impossible d'envoyer l'email d'invitation");
    }
  }

  /**
   * Envoyer un email de confirmation d'acceptation
   */
  async sendAcceptanceConfirmationEmail({
    to,
    collaborateurName,
    recruteurName,
    companyName,
  }: {
    to: string;
    collaborateurName: string;
    recruteurName: string;
    companyName?: string | null;
  }) {
    const loginUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/auth/collaborateur/login`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation acceptée</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Invitation acceptée !</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Bonjour ${collaborateurName},</p>
            
            <p style="font-size: 16px;">
              Votre invitation à rejoindre l'équipe de <strong>${recruteurName}</strong>${
      companyName ? ` (${companyName})` : ""
    } a été acceptée avec succès !
            </p>
            
            <p style="font-size: 16px;">
              Vous pouvez maintenant vous connecter à votre espace collaborateur.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Se connecter
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">
              ${loginUrl}
            </p>
          </div>
        </body>
      </html>
    `;

    try {
      const info = await this.transporter!.sendMail({
        from:
          process.env.MAILTRAP_FROM ||
          `"${recruteurName}" <noreply@recruteur20.com>`,
        to,
        subject: `Invitation acceptée - ${
          companyName || "Équipe de recrutement"
        }`,
        html,
      });

      console.log("Email de confirmation envoyé:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'email de confirmation:",
        error
      );
      // Ne pas faire échouer l'acceptation si l'email échoue
      return {
        success: false,
        error: "Email non envoyé mais invitation acceptée",
      };
    }
  }
}

export const emailService = new EmailService();

/**
 * Fonction d'envoi d'email pour better-auth
 * Utilisée pour la réinitialisation de mot de passe
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    auth: {
      user: process.env.SMTP_USERNAME || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.MAILTRAP_FROM || `"Ylsix" <noreply@ylsix.com>`,
      to,
      subject,
      text: text || "",
      html: html || text || "",
    });

    console.log("Email envoyé:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email");
  }
}
