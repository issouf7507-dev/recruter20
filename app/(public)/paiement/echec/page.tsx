"use client";

import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaiementEchec() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("ref");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Paiement échoué</h1>
        <p className="text-gray-600">
          Votre paiement n&apos;a pas pu être traité. Aucun montant n&apos;a
          été débité. Veuillez réessayer ou choisir un autre moyen de paiement.
        </p>
        {reference && (
          <p className="text-xs text-gray-400">Réf : {reference}</p>
        )}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/tarifs" className="w-full">
            <button className="w-full px-6 py-3 bg-[#a590ff] text-white rounded-lg font-semibold hover:bg-[#9580ef] transition-colors">
              Réessayer
            </button>
          </Link>
          <Link href="/recruteur/dashboard" className="w-full">
            <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Retour au tableau de bord
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
