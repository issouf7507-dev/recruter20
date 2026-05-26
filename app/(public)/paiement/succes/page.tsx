"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";

type PageStatus = "polling" | "completed" | "failed" | "timeout";

const MAX_ATTEMPTS = 15; // 15 × 2s = 30 secondes
const POLL_INTERVAL = 2000;

export default function PaiementSucces() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<PageStatus>("polling");
  const [amount, setAmount] = useState<number | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("ref");
    if (!ref) {
      router.replace("/");
      return;
    }
    setReference(ref);

    let attempts = 0;
    cancelledRef.current = false;

    const poll = async () => {
      if (cancelledRef.current) return;

      attempts++;
      try {
        const res = await fetch(`/api/payment/status?ref=${ref}`);
        const data = await res.json();

        if (data.status === "completed") {
          if (data.amount) setAmount(data.amount);
          setStatus("completed");
          return;
        }

        if (["failed", "expired", "cancelled"].includes(data.status)) {
          setStatus("failed");
          return;
        }

        // pending / processing → on continue
        if (attempts >= MAX_ATTEMPTS) {
          setStatus("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL);
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          setStatus("timeout");
        } else {
          setTimeout(poll, POLL_INTERVAL);
        }
      }
    };

    poll();

    return () => {
      cancelledRef.current = true;
    };
  }, [searchParams, router]);

  // ─── Polling ───────────────────────────────────────────────────────────────
  if (status === "polling") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
          <Loader2 className="w-12 h-12 text-[#a590ff] animate-spin" />
          <h1 className="text-xl font-semibold text-gray-900">
            Vérification du paiement...
          </h1>
          <p className="text-gray-500 text-sm">
            Veuillez patienter quelques secondes.
          </p>
        </div>
      </div>
    );
  }

  // ─── Timeout ───────────────────────────────────────────────────────────────
  if (status === "timeout") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Traitement en cours
          </h1>
          <p className="text-gray-600">
            La confirmation prend plus de temps que prévu. Si vous avez payé,
            votre abonnement sera activé sous quelques minutes.
          </p>
          {reference && (
            <p className="text-xs text-gray-400">Réf : {reference}</p>
          )}
          <Link href="/recruteur/dashboard" className="w-full">
            <button className="w-full px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
              Accéder à mon espace
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Échec ─────────────────────────────────────────────────────────────────
  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Paiement échoué</h1>
          <p className="text-gray-600">
            Votre paiement n&apos;a pas pu être traité. Veuillez réessayer.
          </p>
          {reference && (
            <p className="text-xs text-gray-400">Réf : {reference}</p>
          )}
          <Link href="/tarifs">
            <button className="px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
              Réessayer
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Succès ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Paiement réussi !</h1>
        {amount && (
          <p className="text-3xl font-bold text-[#a590ff]">
            {amount.toLocaleString("fr-FR")} XOF
          </p>
        )}
        <p className="text-gray-600">
          Votre abonnement a bien été activé. Vous pouvez maintenant accéder à
          toutes les fonctionnalités de votre plan.
        </p>
        {reference && (
          <p className="text-xs text-gray-400">Réf : {reference}</p>
        )}
        <Link href="/recruteur/dashboard" className="w-full">
          <button className="w-full px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
            Accéder à mon espace
          </button>
        </Link>
      </div>
    </div>
  );
}
