"use client";
// app/paiement/succes/page.tsx

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type PageStatus = "loading" | "completed" | "failed";

export default function PaiementSucces() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<PageStatus>("loading");
    const [amount, setAmount] = useState<number | null>(null);

    // GeniusPay redirige vers :
    // /paiement/succes?reference=SANDBOX_XXX&status=completed
    const reference = searchParams.get("reference") || searchParams.get("ref");
    const gpStatus = searchParams.get("status"); // "completed" | "failed" | etc.

    useEffect(() => {
        if (!reference) {
            router.replace("/");
            return;
        }

        const run = async () => {
            if (gpStatus === "completed") {
                // GeniusPay confirme le succès → on met à jour la BDD directement
                await activateAbonnement(reference);
                setStatus("completed");
            } else if (
                gpStatus === "failed" ||
                gpStatus === "expired" ||
                gpStatus === "cancelled"
            ) {
                await markFailed(reference, gpStatus);
                setStatus("failed");
            } else {
                // Pas de status dans l'URL → fallback vérification API
                const res = await fetch(`/api/payment/status?ref=${reference}`);
                const data = await res.json();
                if (data.status === "completed") {
                    setAmount(data.amount);
                    setStatus("completed");
                } else {
                    setStatus("failed");
                }
            }
        };

        run();
    }, [reference, gpStatus, router]);

    // ─── Activation en BDD via notre API ─────────────────────────────────────
    const activateAbonnement = async (ref: string) => {
        try {
            const res = await fetch("/api/payment/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: ref }),
            });
            const data = await res.json();
            if (data.amount) setAmount(data.amount);
        } catch (err) {
            console.error("[Succes] Erreur activation:", err);
        }
    };

    const markFailed = async (ref: string, reason: string) => {
        try {
            await fetch("/api/payment/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: ref, forceStatus: reason }),
            });
        } catch (err) {
            console.error("[Succes] Erreur markFailed:", err);
        }
    };

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                    <Loader2 className="w-12 h-12 text-[#a590ff] animate-spin" />
                    <h1 className="text-xl font-semibold text-gray-900">
                        Activation de votre abonnement...
                    </h1>
                    <p className="text-gray-500 text-sm">Veuillez patienter quelques secondes.</p>
                </div>
            </div>
        );
    }

    // ─── Échec ────────────────────────────────────────────────────────────────
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
                    {reference && <p className="text-xs text-gray-400">Réf : {reference}</p>}
                    <Link href="/tarifs">
                        <button className="px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
                            Réessayer
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Succès ───────────────────────────────────────────────────────────────
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
                    Votre abonnement a bien été activé. Vous pouvez maintenant accéder
                    à toutes les fonctionnalités de votre plan.
                </p>
                {reference && <p className="text-xs text-gray-400">Réf : {reference}</p>}
                <Link href="/recruteur/dashboard" className="w-full">
                    <button className="w-full px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
                        Accéder à mon espace
                    </button>
                </Link>
            </div>
        </div>
    );
}