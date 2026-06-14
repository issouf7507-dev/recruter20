"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useAbonnement } from "@/lib/hooks/use-abonnement";
import { useRecruteurByUserId } from "@/lib/hooks/use-recruteurs";
import { PLANS, PLAN_LIST } from "@/lib/plans";
import { SiteHeader } from "@/components/site-header";
import { Check, Zap, FlaskConical } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  DECOUVERTE: "bg-card border-gray-300 text-gray-700",
  PME: "bg-card border-blue-300  text-blue-700",
  BUSINESS: "bg-card border-purple-300 text-purple-700",
  CORPORATE: "bg-card border-amber-300 text-amber-700",
};

const PLAN_ACTIVE: Record<string, string> = {
  DECOUVERTE: "ring-2 ring-gray-500   bg-card",
  PME: "ring-2 ring-blue-500   bg-card",
  BUSINESS: "ring-2 ring-purple-500 bg-card",
  CORPORATE: "ring-2 ring-amber-500  bg-card",
};

export default function DevPlanPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: abonnement, isLoading } = useAbonnement(recruteur?.id);
  const [switching, setSwitching] = useState<string | null>(null);

  const currentPlan =
    abonnement?.statut === "ACTIF" ? abonnement.plan : "DECOUVERTE";

  async function switchPlan(planType: string) {
    setSwitching(planType);
    try {
      const res = await fetch("/api/dev/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Invalider le cache abonnement partout
      await queryClient.invalidateQueries({ queryKey: ["abonnement"] });
      toast.success(
        `Plan changé → ${PLANS[planType.toLowerCase() as keyof typeof PLANS]?.name ?? planType}`,
      );
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setSwitching(null);
    }
  }

  return (
    <>
      <SiteHeader title="Dev — Changement de plan" />
      <div className="flex flex-1 flex-col">
        <div className="max-w-2xl mx-auto w-full px-4 py-10">
          {/* Badge dev */}
          <div className="flex items-center gap-2 mb-8 px-3 py-2  bg-card rounded-lg text-yellow-800 text-sm font-medium w-fit">
            <FlaskConical className="w-4 h-4" />
            Page de test — non accessible en production
          </div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#a590ff]" />
            Changer le plan
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Simule n'importe quel abonnement pour tester les fonctionnalités.
            Actif pendant 10 ans.
          </p>
          {/* Plan actuel */}
          <div className="mb-6 p-4 rounded-xl bg-card  text-sm">
            <span className="text-gray-500">Plan actuel : </span>
            <span className="font-bold text-gray-900">
              {isLoading
                ? "…"
                : (PLANS[currentPlan.toLowerCase() as keyof typeof PLANS]
                    ?.name ?? currentPlan)}
            </span>
            {abonnement?.statut === "ACTIF" && abonnement.dateFin && (
              <span className="text-gray-400 ml-2">
                (expire le{" "}
                {new Date(abonnement.dateFin).toLocaleDateString("fr-FR")})
              </span>
            )}
          </div>
          {/* Cards de plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLAN_LIST.map((plan) => {
              const isActive = currentPlan === plan.planType;
              const isLoading = switching === plan.planType;

              return (
                <button
                  key={plan.id}
                  onClick={() => switchPlan(plan.planType)}
                  disabled={isActive || !!switching}
                  className={` relative text-left rounded-xl border-2 p-5 transition-all focus:outline-none disabled:cursor-not-allowed
                    ${isActive ? PLAN_ACTIVE[plan.planType] : PLAN_COLORS[plan.planType] + " hover:shadow-md hover:scale-[1.01]"}
                  `}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#a590ff] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="font-bold text-base mb-1">{plan.name}</div>
                  <div className="text-xs text-gray-500 mb-3">
                    {plan.description}
                  </div>

                  <div className="text-lg font-bold mb-3">
                    {plan.price === 0
                      ? "Gratuit"
                      : `${plan.price.toLocaleString("fr-FR")} FCFA/mois`}
                  </div>

                  <ul className="space-y-1 mb-4">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="text-xs text-gray-600 flex items-start gap-1.5"
                      >
                        <span className="text-[#a590ff] mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`text-center py-2 rounded-lg text-sm font-semibold transition-colors
                    ${
                      isActive
                        ? "bg-[#a590ff] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  >
                    {isLoading
                      ? "Activation…"
                      : isActive
                        ? "Plan actif"
                        : `Activer ${plan.name}`}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => router.push("/recruteur/dashboard")}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour au dashboard
            </button>
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["abonnement"] })
              }
              className="px-5 py-2 bg-[#a590ff]/10 hover:bg-[#a590ff]/20 text-[#a590ff] rounded-lg text-sm font-medium transition-colors"
            >
              Rafraîchir le cache
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
