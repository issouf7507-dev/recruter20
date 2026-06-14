"use client";
// components/PaymentButton.tsx

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type PlanId = "pme" | "business" | "corporate";

type PaymentButtonProps = {
    planId: PlanId;
    className?: string;
    children?: React.ReactNode;
};

export function PaymentButton({ planId, className, children }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/payment/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            const data = await res.json();

            if (res.status === 401) {
                toast.error("Vous devez être connecté en tant que recruteur.");
                return;
            }
            if (res.status === 403) {
                toast.error("Seuls les recruteurs peuvent souscrire à un abonnement.");
                return;
            }
            if (!data.success || !data.checkout_url) {
                toast.error(data.error || "Erreur lors de l'initialisation du paiement");
                return;
            }

            // Stocker la référence pour la page de succès
            sessionStorage.setItem("geniuspay_ref", data.reference);
            window.location.href = data.checkout_url;

        } catch (err) {
            console.error(err);
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={
                className ||
                "w-full py-3 px-6 bg-[#a590ff] hover:bg-[#9580ef] text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            }
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Redirection..." : children}
        </button>
    );
}