"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  Sparkles,
  Building2,
  Briefcase,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PLAN_LIST, type PlanId } from "@/lib/plans";

const PAYABLE_PLANS = PLAN_LIST.filter((p) => p.id !== "decouverte");

const PLAN_ICONS: Record<PlanId, typeof Sparkles> = {
  decouverte: Sparkles,
  pme: Briefcase,
  business: Sparkles,
  corporate: Crown,
};

interface PlanSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function PlanSelectionModal({ open, onClose }: PlanSelectionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("business");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
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
        toast.error(
          data.error || "Erreur lors de l'initialisation du paiement",
        );
        return;
      }

      sessionStorage.setItem("geniuspay_ref", data.reference);
      window.location.href = data.checkout_url;
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Choisissez votre plan
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le plan qui correspond à vos besoins, puis passez au
            paiement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {PAYABLE_PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id];
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none",
                  isSelected
                    ? "border-[#a590ff] bg-[#a590ff]/5"
                    : "border-border hover:border-[#a590ff]/50",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-4 bg-[#a590ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Populaire
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isSelected
                        ? "bg-[#a590ff] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{plan.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-2xl font-bold">
                    {plan.price.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    FCFA / {plan.period}
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#a590ff]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#a590ff] flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[#a590ff] hover:bg-[#9580ef] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Redirection..." : "Passer au paiement"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
