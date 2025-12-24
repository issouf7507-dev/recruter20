"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../../components/AuthForm";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { completeSignupRecruteur } from "@/action/signup";
import { toast } from "sonner";

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

export default function RecruiterRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: AuthFormData) => {
    // console.log("form data recruteur", data);

    setIsLoading(true);

    try {
      const res = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.firstName + " " + data.lastName || "",
      });

      if (res.data) {
        await completeSignupRecruteur({
          email: data.email,
          typeUser: "RECRUTEUR",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          companyName: data.companyName || "",
          description: "",
          type: "ENTREPRISE",
          phone: data.phone || "",
        });
      }
      if (res.error) {
        console.error(res.error);
        return;
      }

      router.push("/auth/recruteur/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error("Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#a590ff] grid grid-cols-1 xl:grid-cols-2 p-4 md:p-5 relative overflow-y-auto">
      {/* Left side - Branding */}
      <div className="xl:flex flex-col order-2 lg:order-1 hidden">
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
        <div className="flex-1 flex items-center lg:items-end justify-start relative z-10 py-6 md:py-10 px-4 md:px-5">
          <div className="text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4">
              Notre plateforme de recrutement pour les recruteurs
            </h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 mb-4">
              Simplifiez votre recherche de candidats avec notre plateforme de
              recrutement pour les recruteurs. Trouvez le talent parfait pour
              votre entreprise.
            </p>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90">
              Attendez, vous êtes un candidat ?{" "}
              <Link
                href="/auth/candidat/login"
                className="hover:text-gray-300 transition-colors bg-white text-black px-4 py-2 rounded-full"
              >
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative z-10 order-1 lg:order-2">
        <AuthForm
          type="register"
          userType="recruteur"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
