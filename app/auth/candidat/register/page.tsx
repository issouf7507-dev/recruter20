"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../../components/AuthForm";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { completeSignupCandidat } from "@/action/signup";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  dateNaissance?: string;
}

export default function CandidateRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true);

    try {
      const res = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.firstName + " " + data.lastName || "",
      });

      if (res.data) {
        await completeSignupCandidat({
          email: data.email,
          nom: data.firstName || "",
          prenom: data.lastName || "",
          telephone: data.phone || "",
          pays: "CIV",
          dateNaissance: data.dateNaissance || "",
          nationalite: "CIV",
          type: "CANDIDAT",
        });
      }
      if (res.error) {
        console.error(res.error);
        return;
      }

      router.push("/auth/candidat/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#a590ff] grid grid-cols-2 p-5 relative overflow-y-auto">
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
              Notre plateforme de recrutement pour les candidats
            </h1>
            <p className="text-xl opacity-90">
              Simplifiez votre recherche d'emploi avec notre plateforme de
              recrutement pour les candidats. Trouvez votre emploi idéal ou le
              talent parfait.
            </p>
            <p className="text-2xl opacity-90">
              Attendez, vous êtes un recruteur ?{" "}
              <Link
                href="/auth/recruteur/login"
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
          type="register"
          userType="candidat"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
