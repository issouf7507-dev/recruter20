import { env } from "@/lib/env";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

// Expéditeur par défaut des emails transactionnels.
// ylsixtech@gmail.com est le sender validé côté Brevo (le temps d'authentifier le domaine ylsix.com).
const SENDER = { name: "Ylsix", email: "ylsixtech@gmail.com" };
// Conservé pour compat des appels existants (le champ `from` est ignoré par
// l'adaptateur : l'expéditeur réel est `SENDER`).
const FROM = `${SENDER.name} <${SENDER.email}>`;

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type SendMailArgs = {
  /** Ignoré (compat) — l'expéditeur est toujours `SENDER`. */
  from?: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

type SendMailResult = {
  data: { messageId?: string } | null;
  error: { message: string } | null;
};

/**
 * Envoi d'un email transactionnel via l'API Brevo (`/smtp/email`).
 *
 * Renvoie une forme `{ data, error }` compatible avec l'ancien client Resend
 * pour ne pas modifier les nombreux appelants. Ne lève pas : les erreurs
 * réseau/HTTP sont renvoyées dans `error`.
 */
async function sendMail({
  to,
  subject,
  html,
  replyTo,
}: SendMailArgs): Promise<SendMailResult> {
  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { data: null, error: { message: `Brevo ${res.status}: ${detail}` } };
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : "Erreur envoi email" },
    };
  }
}

/** Échappe le contenu fourni par l'utilisateur avant interpolation dans un template HTML. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

    const { data, error } = await sendMail({
      from: FROM,
      to,
      subject: "Réinitialisation de votre mot de passe - Ylsix",
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      throw new Error("Impossible d'envoyer l'email de réinitialisation");
    }

    return { success: true, messageId: data?.messageId };
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

    const { data, error } = await sendMail({
      from: FROM,
      to,
      subject: `Invitation à collaborer - ${companyName || "Équipe de recrutement"}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      throw new Error("Impossible d'envoyer l'email d'invitation");
    }

    return { success: true, messageId: data?.messageId };
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

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `Invitation acceptée - ${companyName || "Équipe de recrutement"}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
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

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `Nouveau message de ${recruteurName} - ${jobTitle}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
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

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `Entretien planifié - ${jobTitle}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false, error: "Entretien créé mais notification email non envoyée" };
    }

    return { success: true };
  }

  /**
   * Envoyer un code de vérification email (6 chiffres)
   */
  async sendVerificationCodeEmail({
    to,
    name,
    code,
  }: {
    to: string;
    name: string;
    code: string;
  }) {
    const logoUrl = `${APP_URL}/img/icon2.png`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérification de votre adresse email</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600;">Vérification de votre email</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Entrez ce code pour activer votre compte</p>
            </div>
            <div style="padding: 35px 30px; text-align: center;">
              <p style="font-size: 16px; color: #e5e7eb; margin-bottom: 20px; text-align: left;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${name}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin-bottom: 30px; text-align: left;">
                Voici votre code de vérification. Il est valable <strong style="color: #e5e7eb;">15 minutes</strong>.
              </p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); border: 2px solid #8b5cf6; border-radius: 16px; padding: 30px; margin: 0 auto 30px; display: inline-block; min-width: 220px;">
                <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #a78bfa; font-family: monospace;">${code}</p>
              </div>
              <div style="background: #252525; padding: 16px 20px; border-radius: 12px; margin-top: 10px; text-align: left;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  Si vous n'avez pas créé de compte sur Ylsix, ignorez cet email.
                </p>
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

    const { data, error } = await sendMail({
      from: FROM,
      to,
      subject: `${code} – Votre code de vérification Ylsix`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      throw new Error("Impossible d'envoyer le code de vérification");
    }

    return { success: true, messageId: data?.messageId };
  }

  /**
   * Proposer une offre d'emploi à un candidat ayant déjà postulé
   */
  async sendJobProposalEmail({
    to,
    candidatName,
    recruteurName,
    companyName,
    jobTitle,
    jobLocation,
    jobType,
    jobDescription,
    personalMessage,
    jobUrl,
  }: {
    to: string;
    candidatName: string;
    recruteurName: string;
    companyName?: string | null;
    jobTitle: string;
    jobLocation?: string | null;
    jobType?: string | null;
    jobDescription?: string | null;
    personalMessage?: string | null;
    jobUrl: string;
  }) {
    const logoUrl = `${APP_URL}/img/icon2.png`;
    const truncatedDesc = jobDescription
      ? jobDescription.replace(/<[^>]+>/g, "").slice(0, 300)
      : null;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Une offre pour vous</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Une offre d'emploi pour vous</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">Un recruteur pense que ce poste vous correspond</p>
            </div>
            <div style="padding: 35px 30px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${candidatName}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 25px 0;">
                <strong style="color: #e5e7eb;">${recruteurName}</strong>${companyName ? ` <span style="color: #6b7280;">de</span> <strong style="color: #e5e7eb;">${companyName}</strong>` : ""} a pensé à vous pour cette opportunité :
              </p>

              ${personalMessage ? `
              <div style="background: linear-gradient(135deg, #1e3a2f 0%, #14532d 100%); padding: 20px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid #22c55e;">
                <p style="margin: 0 0 6px 0; color: #86efac; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message personnel</p>
                <p style="margin: 0; color: #d1fae5; font-size: 14px; font-style: italic;">"${personalMessage}"</p>
              </div>` : ""}

              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 24px; border-radius: 12px; margin: 0 0 25px 0; border: 1px solid #4c1d95;">
                <p style="margin: 0 0 10px 0; font-weight: 700; color: #c4b5fd; font-size: 18px;">${jobTitle}</p>
                ${companyName ? `<p style="margin: 0 0 6px 0; color: #a78bfa; font-size: 14px;">🏢 ${companyName}</p>` : ""}
                ${jobLocation ? `<p style="margin: 0 0 6px 0; color: #9ca3af; font-size: 13px;">📍 ${jobLocation}</p>` : ""}
                ${jobType ? `<p style="margin: 0; color: #9ca3af; font-size: 13px;">📋 ${jobType}</p>` : ""}
              </div>

              ${truncatedDesc ? `
              <div style="background: #252525; padding: 20px; border-radius: 12px; margin: 0 0 30px 0; border: 1px solid #333;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Aperçu du poste</p>
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.7;">${truncatedDesc}${jobDescription && jobDescription.replace(/<[^>]+>/g, "").length > 300 ? "..." : ""}</p>
              </div>` : ""}

              <div style="text-align: center; margin: 35px 0;">
                <a href="${jobUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">
                  Voir l'offre et postuler
                </a>
              </div>
            </div>
            <div style="background: #151515; padding: 20px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 11px; color: #4b5563; text-align: center; margin: 0 0 6px 0;">
                Vous recevez cet email car vous avez déjà postulé via la plateforme <span style="color: #a78bfa;">Ylsix</span>.
              </p>
              <p style="font-size: 11px; color: #4b5563; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} Ylsix. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `${recruteurName}${companyName ? ` (${companyName})` : ""} vous propose : ${jobTitle}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      throw new Error("Impossible d'envoyer l'email de proposition");
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

    // Ce template est alimenté par le formulaire public /contact : on échappe tout.
    const safe = {
      nom: escapeHtml(nom),
      email: escapeHtml(email),
      sujet: escapeHtml(sujet),
      message: escapeHtml(message),
    };

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
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Nom :</strong> ${safe.nom}</p>
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Email :</strong> ${safe.email}</p>
                <p style="margin: 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Sujet :</strong> ${safe.sujet}</p>
              </div>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; color: #e5e7eb; font-size: 14px; white-space: pre-wrap;">${safe.message}</p>
              </div>
            </div>
            <div style="background: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Répondez directement à cet email pour contacter ${safe.nom}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await sendMail({
      from: FROM,
      to: "contact@ylsix.com",
      replyTo: email,
      subject: `[Aide et support] ${sujet}`,
      html,
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      throw new Error("Impossible d'envoyer le message");
    }

    return { success: true };
  }

  /**
   * Gabarit HTML commun (thème sombre Ylsix) pour les emails de notification.
   * Header avec logo + titre, corps injecté, CTA optionnel, footer standard.
   */
  private notificationShell({
    title,
    subtitle,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    accent = "#8b5cf6",
    footerExtraHtml,
  }: {
    title: string;
    subtitle: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
    accent?: string;
    footerExtraHtml?: string;
  }) {
    const logoUrl = `${APP_URL}/img/icon2.png`;
    const cta =
      ctaLabel && ctaUrl
        ? `
              <div style="text-align: center; margin: 35px 0 5px 0;">
                <a href="${ctaUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, ${accent} 0%, #7c3aed 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">
                  ${ctaLabel}
                </a>
              </div>`
        : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1f4e 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #3d2d5c;">
              <img src="${logoUrl}" alt="Ylsix" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">${title}</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">${subtitle}</p>
            </div>
            <div style="padding: 35px 30px;">
              ${bodyHtml}
              ${cta}
            </div>
            <div style="background: #151515; padding: 25px 30px; border-top: 1px solid #2a2a2a;">
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                Cet email a été envoyé automatiquement depuis la plateforme <span style="color: #a78bfa;">Ylsix</span>.
              </p>
              ${footerExtraHtml ? `<p style="font-size: 12px; text-align: center; margin: 10px 0 0 0;">${footerExtraHtml}</p>` : ""}
            </div>
          </div>
          <p style="text-align: center; color: #4b5563; font-size: 11px; margin-top: 20px;">
            © ${new Date().getFullYear()} Ylsix. Tous droits réservés.
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Email au candidat quand le statut de sa candidature change.
   */
  async sendApplicationStatusEmail({
    to,
    candidatName,
    jobTitle,
    companyName,
    status,
  }: {
    to: string;
    candidatName: string;
    jobTitle: string;
    companyName?: string | null;
    status: "ACCEPTE" | "REFUSE" | "EN_REVISION" | "EN_ATTENTE";
  }) {
    const config: Record<
      typeof status,
      { title: string; subtitle: string; message: string; accent: string }
    > = {
      ACCEPTE: {
        title: "Candidature acceptée 🎉",
        subtitle: "Bonne nouvelle concernant votre candidature",
        message:
          "Félicitations ! Votre candidature a retenu l'attention du recruteur. Il reviendra vers vous pour la suite du processus.",
        accent: "#22c55e",
      },
      REFUSE: {
        title: "Candidature non retenue",
        subtitle: "Mise à jour de votre candidature",
        message:
          "Votre candidature n'a malheureusement pas été retenue cette fois-ci. Ne vous découragez pas : de nouvelles offres correspondant à votre profil sont publiées régulièrement.",
        accent: "#6b7280",
      },
      EN_REVISION: {
        title: "Candidature en cours d'examen",
        subtitle: "Mise à jour de votre candidature",
        message:
          "Votre candidature est actuellement examinée par le recruteur. Vous serez informé dès qu'une décision est prise.",
        accent: "#8b5cf6",
      },
      EN_ATTENTE: {
        title: "Candidature en attente",
        subtitle: "Mise à jour de votre candidature",
        message:
          "Votre candidature a bien été enregistrée et est en attente de traitement par le recruteur.",
        accent: "#8b5cf6",
      },
    };
    const c = config[status];
    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${candidatName}</span>,</p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid ${c.accent};">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}${companyName ? ` — ${companyName}` : ""}</p>
              </div>
              <p style="font-size: 15px; color: #d1d5db; margin: 0 0 10px 0;">${c.message}</p>`;

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `${c.title} — ${jobTitle}`,
      html: this.notificationShell({
        title: c.title,
        subtitle: c.subtitle,
        bodyHtml,
        ctaLabel: "Voir ma candidature",
        ctaUrl: `${APP_URL}/auth/candidat/login`,
        accent: c.accent,
      }),
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false };
    }
    return { success: true };
  }

  /**
   * Email au recruteur quand un candidat postule à l'une de ses offres.
   */
  async sendNewApplicationEmail({
    to,
    recruteurName,
    candidatName,
    jobTitle,
  }: {
    to: string;
    recruteurName: string;
    candidatName: string;
    jobTitle: string;
  }) {
    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${recruteurName}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 25px 0;">
                <strong style="color: #e5e7eb;">${candidatName}</strong> vient de postuler à votre offre :
              </p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 10px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}</p>
              </div>`;

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `Nouvelle candidature — ${jobTitle}`,
      html: this.notificationShell({
        title: "Nouvelle candidature",
        subtitle: "Un candidat a postulé à votre offre",
        bodyHtml,
        ctaLabel: "Voir la candidature",
        ctaUrl: `${APP_URL}/auth/recruteur/login`,
      }),
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false };
    }
    return { success: true };
  }

  /**
   * Email au recruteur quand l'une de ses offres est publiée ou clôturée.
   */
  async sendOfferStatusEmail({
    to,
    recruteurName,
    jobTitle,
    status,
  }: {
    to: string;
    recruteurName: string;
    jobTitle: string;
    status: "published" | "closed";
  }) {
    const isPublished = status === "published";
    const title = isPublished ? "Offre publiée ✅" : "Offre clôturée";
    const subtitle = isPublished
      ? "Votre offre est désormais en ligne"
      : "Votre offre n'accepte plus de candidatures";
    const message = isPublished
      ? "Votre offre est maintenant visible par les candidats. Vous recevrez un email à chaque nouvelle candidature."
      : "Votre offre a été clôturée et n'apparaît plus dans les résultats de recherche. Vous pouvez toujours consulter les candidatures reçues.";
    const accent = isPublished ? "#22c55e" : "#6b7280";
    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${recruteurName}</span>,</p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid ${accent};">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}</p>
              </div>
              <p style="font-size: 15px; color: #d1d5db; margin: 0;">${message}</p>`;

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `${title} — ${jobTitle}`,
      html: this.notificationShell({
        title,
        subtitle,
        bodyHtml,
        ctaLabel: "Gérer mes offres",
        ctaUrl: `${APP_URL}/auth/recruteur/login`,
        accent,
      }),
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false };
    }
    return { success: true };
  }

  /**
   * Email de rappel au candidat avant un entretien planifié (déclenché par un cron).
   */
  async sendInterviewReminderEmail({
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
    type: string;
    lieu?: string | null;
  }) {
    const dateStr = dateHeure.toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${candidatName}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 25px 0;">
                Petit rappel : vous avez un entretien à venir avec <strong style="color: #e5e7eb;">${recruteurName}</strong>${companyName ? ` <span style="color: #6b7280;">de</span> <strong style="color: #e5e7eb;">${companyName}</strong>` : ""} pour :
              </p>
              <div style="background: linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%); padding: 18px 20px; border-radius: 12px; margin: 0 0 20px 0; border-left: 4px solid #8b5cf6;">
                <p style="margin: 0; font-weight: 600; color: #c4b5fd; font-size: 15px;">${jobTitle}</p>
              </div>
              <div style="background: #252525; padding: 20px 25px; border-radius: 12px; margin: 0 0 10px 0; border: 1px solid #333;">
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Objet :</strong> ${titre}</p>
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Date :</strong> ${dateStr}</p>
                <p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Type :</strong> ${type}</p>
                ${lieu ? `<p style="margin: 0; color: #d1d5db; font-size: 14px;"><strong style="color: #e5e7eb;">Lieu / lien :</strong> ${lieu}</p>` : ""}
              </div>`;

    const { error } = await sendMail({
      from: FROM,
      to,
      subject: `Rappel : entretien ${jobTitle} — ${dateStr}`,
      html: this.notificationShell({
        title: "Rappel d'entretien",
        subtitle: "Votre entretien approche",
        bodyHtml,
        ctaLabel: "Voir les détails",
        ctaUrl: `${APP_URL}/auth/candidat/login`,
      }),
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false };
    }
    return { success: true };
  }

  /**
   * Email hebdomadaire de recommandations d'offres au candidat (façon LinkedIn).
   * Liste 3–4 offres pertinentes selon son profil.
   */
  async sendJobRecommendationsEmail({
    to,
    candidatName,
    offers,
  }: {
    to: string;
    candidatName: string;
    offers: {
      id: string;
      title: string;
      company: string | null;
      location: string | null;
      type: string | null;
      logo?: string | null;
    }[];
  }) {
    const offersUrl = `${APP_URL}/offres`;
    const prefsUrl = `${APP_URL}/candidat/parametres`;

    // Échappe le texte libre saisi par les recruteurs (titre, entreprise…).
    const esc = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const cards = offers
      .map((o) => {
        const offerUrl = `${APP_URL}/offres/${o.id}`;
        const initial = ((o.company || o.title || "?").trim()[0] || "?").toUpperCase();
        const logoCell = o.logo
          ? `<img src="${o.logo}" alt="" width="48" height="48" style="width:48px;height:48px;border-radius:10px;object-fit:cover;display:block;border:1px solid #333;" />`
          : `<div style="width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);color:#ffffff;font-weight:700;font-size:18px;text-align:center;line-height:48px;">${esc(initial)}</div>`;

        const line2 = [o.company, o.location]
          .filter((v): v is string => Boolean(v))
          .map(esc)
          .join(" · ");
        const typeChip = o.type
          ? `<span style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:999px;background:rgba(139,92,246,0.16);color:#c4b5fd;font-size:11px;font-weight:600;letter-spacing:0.3px;">${esc(o.type)}</span>`
          : "";

        return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px 0;background:#1f1f23;border:1px solid #333;border-radius:14px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="width:48px;">${logoCell}</td>
                        <td valign="top" style="padding-left:14px;">
                          <a href="${offerUrl}" style="text-decoration:none;color:#ede9fe;font-size:16px;font-weight:600;line-height:1.35;">${esc(o.title)}</a>
                          ${line2 ? `<p style="margin:4px 0 0 0;color:#9ca3af;font-size:13px;">${line2}</p>` : ""}
                          ${typeChip}
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top:12px;text-align:right;">
                      <a href="${offerUrl}" style="color:#a78bfa;font-size:13px;font-weight:600;text-decoration:none;">Voir l'offre &rarr;</a>
                    </div>
                  </td>
                </tr>
              </table>`;
      })
      .join("");

    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 8px 0;">Bonjour <span style="color: #a78bfa; font-weight: 600;">${esc(candidatName)}</span>,</p>
              <p style="font-size: 15px; color: #9ca3af; margin: 0 0 24px 0;">
                Nous avons trouvé <strong style="color:#e5e7eb;">${offers.length} offre${offers.length > 1 ? "s" : ""}</strong> qui correspondent à votre profil :
              </p>
              ${cards}`;

    const { error } = await sendMail({
      to,
      subject: `${offers.length} offre${offers.length > 1 ? "s" : ""} pour vous — Ylsix`,
      html: this.notificationShell({
        title: "Des offres pour vous",
        subtitle: "Votre sélection de la semaine",
        bodyHtml,
        ctaLabel: "Voir toutes les offres",
        ctaUrl: offersUrl,
        footerExtraHtml: `<a href="${prefsUrl}" style="color: #6b7280; text-decoration: underline;">Gérer mes préférences de notification</a>`,
      }),
    });

    if (error) {
      console.error("Erreur Brevo:", error);
      return { success: false };
    }
    return { success: true };
  }

  /**
   * Email de test — envoyé depuis l'espace superadmin pour vérifier que la
   * configuration Brevo (clé API + expéditeur) fonctionne de bout en bout.
   * Renvoie le détail de l'erreur Brevo en cas d'échec pour faciliter le diagnostic.
   */
  async sendTestEmail({ to }: { to: string }): Promise<
    { success: true; messageId?: string } | { success: false; error: string }
  > {
    const bodyHtml = `
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 20px 0;">Bonjour,</p>
              <p style="font-size: 15px; color: #d1d5db; margin: 0 0 15px 0;">
                Si vous lisez ce message, l'envoi d'emails transactionnels via <strong style="color: #a78bfa;">Brevo</strong> fonctionne correctement. 🎉
              </p>
              <div style="background: #252525; padding: 18px 20px; border-radius: 12px; border: 1px solid #333;">
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Détails</p>
                <p style="margin: 0; color: #d1d5db; font-size: 14px;">Destinataire : ${to}<br/>Date : ${new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}</p>
              </div>`;

    const { data, error } = await sendMail({
      to,
      subject: "Test d'envoi — Ylsix",
      html: this.notificationShell({
        title: "Email de test ✅",
        subtitle: "Configuration Brevo vérifiée",
        bodyHtml,
      }),
    });

    if (error) {
      console.error("Erreur Brevo (test):", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.messageId };
  }
}

export const emailService = new EmailService();
