"use client";

import { useState } from "react";

import AuthForm from "../../../components/AuthForm";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { getRecruteur } from "@/action/getRecruteur";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
}

export default function RecruiterLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      // TODO: Implémenter l'authentification avec votre backend
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (res.data) {
        console.log("res.data", res.data);
        const recruteur = await getRecruteur(res.data.user.id);
        console.log("recruteur", recruteur);
        if (
          recruteur?.user.type === "RECRUTEUR" ||
          recruteur?.user.type === "COLLABORATEUR"
        ) {
          window.location.href = "/recruteur/dashboard";
        } else {
          toast.error("Vous n'êtes pas un recruteur");
          return;
        }
      }
      if (res.error) {
        console.error(res.error);
        toast.error("Erreur de connexion");
        return;
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#a590ff] grid grid-cols-2 p-5 relative overflow-hidden">
      <div className="flex flex-col  ">
        <div className="flex items-center justify-between px-10">
          <h1 className="text-6xl font-bold mb-4">Ylsix</h1>
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-end justify-start relative z-10 py-10 px-5">
          <div className="text-white">
            <h1 className="text-6xl font-bold mb-4">
              Notre plateforme de recrutement pour les recruteurs
            </h1>
            <p className="text-xl opacity-90">
              Simplifiez votre recherche de candidats avec notre plateforme de
              recrutement pour les recruteurs. Trouvez le talent parfait pour
              votre entreprise.
            </p>
            <p className="text-2xl opacity-90">
              Attendez, vous êtes un candidat ?{" "}
              <Link
                href="/auth/candidat/login"
                className="text-white hover:text-gray-300 transition-colors"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <AuthForm
          type="login"
          userType="recruteur"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
