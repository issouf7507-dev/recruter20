"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo: string;
}

export default function AuthGuard({ children, redirectTo }: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      // Rediriger vers la page de login si l'utilisateur n'est pas connecté
      router.push(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  // Afficher un loader pendant la vérification de la session
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Ne pas afficher le contenu si l'utilisateur n'est pas connecté
  if (!session) {
    return null;
  }

  return <>{children}</>;
}
