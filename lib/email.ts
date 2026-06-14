import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "Ylsix <contact@ylsix.com>";
const APP_URL = env.NEXT_PUBLIC_APP_URL;

class EmailService {
  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail({
    to,
    name,
    resetUrl,
  }: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    const logoUrl = `${APP_URL}/img/icon2.png`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de votre mot de passe</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600;">Réinitialisation du mot de passe</h1>
            </div>
            <div style="padding: 35px 30px;">
              <p style="font-size: 16px; color: #e5e7eb; margin-bottom: 20px;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${name}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin-bottom: 25px;">
                Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :
              </p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <div style="background: #252525; padding: 20px; border-radius: 12px;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">Informations importantes</p>
                <p style="margin: 0; color: #d1d5db; font-size: 13px;">
                  • Ce lien expire dans <strong style="color: #a78bfa;">1 heure</strong><br>
                  • Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
                </p>
              </div>
              <p style="font-size: 12px; color: #6b7280; margin-top: 20px; word-break: break-all;">
                Ou copiez ce lien : ${resetUrl}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Réinitialisation de votre mot de passe - Ylsix",
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error("Impossible d'envoyer l'email de réinitialisation");
    }

    return { success: true, messageId: data?.id };
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
    const acceptUrl = `${APP_URL}/invitations/accept/${invitationToken}`;

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
              <strong>${recruteurName}</strong>${companyName ? ` de ${companyName}` : ""} vous invite à rejoindre son équipe de recrutement en tant que <strong>${role}</strong>.
            </p>
            <p style="font-size: 16px;">En acceptant cette invitation, vous pourrez :</p>
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
              <strong>Note importante :</strong> Cette invitation expire le ${new Date(expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
            </p>
            <p style="font-size: 14px; color: #666;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${acceptUrl}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
            </p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Invitation à collaborer - ${companyName || "Équipe de recrutement"}`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error("Impossible d'envoyer l'email d'invitation");
    }

    return { success: true, messageId: data?.id };
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
    const loginUrl = `${APP_URL}/auth/recruteur/login`;

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
              Votre invitation à rejoindre l'équipe de <strong>${recruteurName}</strong>${companyName ? ` (${companyName})` : ""} a été acceptée avec succès !
            </p>
            <p style="font-size: 16px;">Vous pouvez maintenant vous connecter à votre espace collaborateur.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}"
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Se connecter
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all;">${loginUrl}</p>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Invitation acceptée - ${companyName || "Équipe de recrutement"}`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      // Ne pas faire échouer l'acceptation si l'email échoue
      return {
        success: false,
        error: "Email non envoyé mais invitation acceptée",
      };
    }

    return { success: true };
  }

  /**
   * Envoyer un email de notification pour un nouveau message
   */
  async sendNewMessageNotification({
    to,
    candidatName,
    recruteurName,
    companyName,
    jobTitle,
    messagePreview,
    conversationId,
  }: {
    to: string;
    candidatName: string;
    recruteurName: string;
    companyName?: string | null;
    jobTitle: string;
    messagePreview: string;
    conversationId: string;
  }) {
    const messagerieUrl = `${APP_URL}/auth/candidat/login`;
    const logoUrl = `${APP_URL}/img/icon2.png`;
    const truncatedMessage =
      messagePreview.length > 150
        ? messagePreview.substring(0, 150) + "..."
        : messagePreview;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau message</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Nouveau message</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Vous avez reçu une réponse à votre candidature</p>
            </div>
            <div style="padding: 35px 30px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${candidatName}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 25px 0;">
                <strong style="color: #e5e7eb;">${recruteurName}</strong>${companyName ? ` <span style="color: #6b7280;">de</span> <strong style="color: #e5e7eb;">${companyName}</strong>` : ""} vous a envoyé un message concernant :
              </p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}</p>
              </div>
              <div style="background: #252525; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border: 1px solid #333;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Aperçu du message</p>
                <p style="margin: 0; color: #d1d5db; font-size: 15px; line-height: 1.7;">"${truncatedMessage}"</p>
              </div>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${messagerieUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">
                  Voir le message et répondre
                </a>
              </div>
            </div>
            <div style="background: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement depuis la plateforme <span style="color: #a78bfa;">Ylsix</span>.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #4b5563; font-size: 11px; margin-top: 20px;">
            © ${new Date().getFullYear()} Ylsix. Tous droits réservés.
          </p>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Nouveau message de ${recruteurName} - ${jobTitle}`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      // Ne pas faire échouer l'envoi du message si l'email échoue
      return {
        success: false,
        error: "Message envoyé mais notification email non envoyée",
      };
    }

    return { success: true };
  }

  /**
   * Envoyer un email de notification pour un entretien planifié
   */
  async sendEntretienScheduledEmail({
    to,
    candidatName,
    recruteurName,
    companyName,
    jobTitle,
    titre,
    dateHeure,
    type,
    lieu,
  }: {
    to: string;
    candidatName: string;
    recruteurName: string;
    companyName?: string | null;
    jobTitle: string;
    titre: string;
    dateHeure: Date;
    type: "VISIO" | "TELEPHONE" | "PRESENTIEL";
    lieu?: string | null;
  }) {
    const loginUrl = `${APP_URL}/auth/candidat/login`;
    const logoUrl = `${APP_URL}/img/icon2.png`;

    const TYPE_LABELS: Record<string, string> = {
      VISIO: "Entretien en visio",
      TELEPHONE: "Entretien téléphonique",
      PRESENTIEL: "Entretien en présentiel",
    };

    const formattedDate = new Date(dateHeure).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const meetingLink = lieu && lieu.startsWith("http") ? lieu : null;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Entretien planifié</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Entretien planifié</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Un recruteur a programmé un entretien avec vous</p>
            </div>
            <div style="padding: 35px 30px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${candidatName}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 25px 0;">
                <strong style="color: #e5e7eb;">${recruteurName}</strong>${companyName ? ` <span style="color: #6b7280;">de</span> <strong style="color: #e5e7eb;">${companyName}</strong>` : ""} a planifié un entretien concernant votre candidature pour :
              </p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}</p>
              </div>
              <div style="background: #252525; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border: 1px solid #333;">
                <p style="margin: 0 0 12px 0; color: #e5e7eb; font-size: 16px; font-weight: 600;">${titre}</p>
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;">Date : ${formattedDate}</p>
                <p style="margin: 0; color: #d1d5db; font-size: 14px;">Type : ${TYPE_LABELS[type] ?? type}</p>
                ${lieu && !meetingLink ? `<p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 14px;">Lieu : ${lieu}</p>` : ""}
              </div>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${meetingLink ?? loginUrl}" target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">
                  ${meetingLink ? "Rejoindre la réunion" : "Voir mes entretiens"}
                </a>
              </div>
              ${meetingLink ? `
              <div style="text-align: center; margin: -10px 0 30px 0;">
                <a href="${loginUrl}" style="color: #8b5cf6; font-size: 13px; text-decoration: underline;">Voir le détail dans mon espace candidat</a>
              </div>` : ""}
            </div>
            <div style="background: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement depuis la plateforme <span style="color: #a78bfa;">Ylsix</span>.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #4b5563; font-size: 11px; margin-top: 20px;">
            © ${new Date().getFullYear()} Ylsix. Tous droits réservés.
          </p>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Entretien planifié - ${jobTitle}`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return { success: false, error: "Entretien créé mais notification email non envoyée" };
    }

    return { success: true };
  }

  /**
   * Envoyer un message du formulaire "Aide et support" vers le support Ylsix
   */
  async sendContactSupportEmail({
    nom,
    email,
    sujet,
    message,
  }: {
    nom: string;
    email: string;
    sujet: string;
    message: string;
  }) {
    const logoUrl = `${APP_URL}/img/icon2.png`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau message de support</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Nouveau message de support</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Envoyé depuis "Aide et support"</p>
            </div>
            <div style="padding: 35px 30px;">
              <div style="background: #252525; padding: 20px; border-radius: 12px; margin: 0 0 20px 0; border: 1px solid #333;">
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Nom :</strong> ${nom}</p>
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Email :</strong> ${email}</p>
                <p style="margin: 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Sujet :</strong> ${sujet}</p>
              </div>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; color: #e5e7eb; font-size: 14px; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="background: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Répondez directement à cet email pour contacter ${nom}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to: "contact@ylsix.com",
      replyTo: email,
      subject: `[Aide et support] ${sujet}`,
      html,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error("Impossible d'envoyer le message");
    }

    return { success: true };
  }
}

export const emailService = new EmailService();
