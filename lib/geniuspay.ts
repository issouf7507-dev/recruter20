// lib/geniuspay.ts
// Utilitaire serveur uniquement — ne jamais importer côté client

const BASE_URL = "https://pay.genius.ci/api/v1/merchant";

import { env } from "@/lib/env";

const headers = {
  "X-API-Key": env.GENIUSPAY_API_KEY,
  "X-API-Secret": env.GENIUSPAY_API_SECRET,
  "Content-Type": "application/json",

  Accept: "application/json", // ← ajoute cette ligne
};

export type GeniusPayInitParams = {
  amount: number; // en XOF (min 200)
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  success_url?: string;
  error_url?: string;
  metadata?: Record<string, string | number>;
};

export type GeniusPayTransaction = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  fees?: number;
  net_amount?: number;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "expired";
  checkout_url?: string;
  payment_url?: string;
  environment: "sandbox" | "live";
  metadata?: Record<string, string | number>;
  created_at?: string;
  completed_at?: string | null;
};

/**
 * Initier un paiement en mode Checkout (recommandé)
 * Retourne une checkout_url vers laquelle rediriger le client
 */
export async function initiatePayment(params: GeniusPayInitParams): Promise<{
  success: boolean;
  data?: GeniusPayTransaction;
  error?: string;
}> {
  try {
    // console.log("[GeniusPay] success_url:", params.success_url);
    // console.log("[GeniusPay] error_url:", params.error_url);
    const res = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });

    const rawText = await res.text();

    let json: any;
    try {
      json = JSON.parse(rawText);
    } catch {
      return {
        success: false,
        error: `Réponse non-JSON (HTTP ${res.status}): ${rawText.slice(0, 200)}`,
      };
    }

    if (!res.ok || !json.success) {
      return {
        success: false,
        error:
          json.error?.message ||
          json.message ||
          "Erreur lors de l'initialisation du paiement",
      };
    }

    return { success: true, data: json.data };
  } catch (err) {
    console.error("[GeniusPay] initiatePayment error:", err);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Récupérer le statut d'une transaction par sa référence
 */
export async function getPayment(reference: string): Promise<{
  success: boolean;
  data?: GeniusPayTransaction;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/payments/${reference}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Transaction introuvable",
      };
    }

    return { success: true, data: json.data };
  } catch (err) {
    console.error("[GeniusPay] getPayment error:", err);
    return { success: false, error: "Erreur réseau" };
  }
}

/**
 * Vérifier la signature d'un webhook GeniusPay
 * Format : HMAC-SHA256(timestamp + "." + json_payload, secret)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET!;
  const data = `${timestamp}.${payload}`;

  const { createHmac, timingSafeEqual } =
    require("crypto") as typeof import("crypto");
  const expectedSignature = createHmac("sha256", secret)
    .update(data)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    );
  } catch {
    return false;
  }
}
