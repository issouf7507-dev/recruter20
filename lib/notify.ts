import prisma from "@/lib/prisma";
import type { NotificationType, UserType, Prisma } from "@/app/generated/prisma";

/**
 * Helper central de notification.
 *
 * Objectif : un seul point d'entrée par événement qui, à la fois,
 *   1. enregistre la notification en base (table `Notification`), et
 *   2. déclenche l'email correspondant (fire-and-forget).
 *
 * Avant ce helper, les notifications DB et les emails étaient câblés séparément
 * dans chaque route, ce qui laissait des trous de couverture (ex. le changement
 * de statut de candidature créait une notif mais n'envoyait aucun email).
 *
 * Les deux effets sont non bloquants : un échec d'email ou d'insertion ne doit
 * jamais faire échouer l'action métier appelante.
 */
export type NotifyInput = {
  recipientId: string;
  recipientType: UserType;
  type: NotificationType;
  /** Données spécifiques au type, stockées telles quelles dans `Notification.data`. */
  data?: Prisma.InputJsonValue;
  /**
   * Envoi d'email associé (facultatif). Thunk fire-and-forget : le contenu et le
   * destinataire sont construits par l'appelant, qui a déjà le contexte en main.
   * Renvoyer `null` (ou omettre) si l'événement ne doit pas générer d'email.
   */
  email?: (() => Promise<unknown>) | null;
};

/**
 * Crée la notification en base et déclenche l'email associé.
 * Ne lève jamais : les erreurs sont loggées, l'appelant n'est pas bloqué.
 */
export async function notify(input: NotifyInput): Promise<void> {
  const { recipientId, recipientType, type, data, email } = input;

  try {
    await prisma.notification.create({
      data: {
        recipientId,
        recipientType,
        type,
        data: data ?? undefined,
      },
    });
  } catch (err) {
    console.error(`notify: échec création notification (${type}):`, err);
  }

  if (email) {
    // Fire-and-forget : on n'attend pas l'email pour rendre la main.
    void Promise.resolve()
      .then(email)
      .catch((err) =>
        console.error(`notify: échec envoi email (${type}):`, err),
      );
  }
}
