"use client";

import { useState } from "react";

import AuthForm from "../../../components/AuthForm";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { getCandidat } from "@/action/getCandidat";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
}

export default function CandidateLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        console.error(res.error);
        // Gérer les erreurs spécifiques
        const errorMessage = res.error.message || String(res.error);
        if (errorMessage.includes("Invalid credentials") || errorMessage.includes("invalid") || errorMessage.includes("incorrect")) {
          toast.error("Email ou mot de passe incorrect.");
        } else if (errorMessage.includes("not found") || errorMessage.includes("introuvable")) {
          toast.error("Aucun compte trouvé avec cet email.");
        } else if (errorMessage.includes("password") || errorMessage.includes("mot de passe")) {
          toast.error("Le mot de passe est incorrect.");
        } else {
          toast.error("Erreur de connexion. Veuillez réessayer.");
        }
        return;
      }

      if (res.data) {
        try {
          const candidat = await getCandidat(res.data.user.id);

          if (candidat?.user.type === "CANDIDAT") {
            toast.success("Connexion réussie ! Redirection...");
            window.location.href = "/";
          } else {
            toast.error("Vous n'êtes pas un candidat. Veuillez vous connecter avec un compte candidat.");
            return;
          }
        } catch (fetchError) {
          console.error("Erreur lors de la récupération du profil:", fetchError);
          toast.error("Erreur lors de la récupération de votre profil. Veuillez réessayer.");
        }
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#a590ff] grid grid-cols-1 xl:grid-cols-2 p-4 md:p-5 relative overflow-y-auto">
      {/* Left side - Branding */}
      <div className="xl:flex flex-col order-2 lg:order-1 hidden ">
        <div className="flex items-center justify-between px-4 md:px-10 py-4 lg:py-0">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-0 lg:mb-4 text-white">
            Ylsix
          </h1>
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors text-sm md:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
              <span className="sm:hidden">Accueil</span>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center lg:items-end justify-start relative z-10 py-6 md:py-10 px-4 md:px-5 ">
          <div className="text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4">
              Notre plateforme de recrutement pour les candidats
            </h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 mb-4">
              Simplifiez votre recherche d'emploi avec notre plateforme de
              recrutement pour les candidats. Trouvez votre emploi idéal ou le
              talent parfait.
            </p>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90">
              Attendez, vous êtes un recruteur ?{" "}
              <Link
                href="/auth/recruteur/login"
                className="hover:text-gray-300 transition-colors bg-white text-black px-4 py-2 rounded-full"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative z-10 order-1 lg:order-2 w-full">
        <AuthForm
          type="login"
          userType="candidat"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
