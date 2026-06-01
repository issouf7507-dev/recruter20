"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import { signUp } from "@/lib/auth-client";
import { completeSignupRecruteur } from "@/lib/actions/signup";
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

      if (res.error) {
        // console.error(res.error);
        // Gérer les erreurs spécifiques
        const errorMessage = res.error.message || String(res.error);
        if (errorMessage.includes("existing email") || errorMessage.includes("already exists") || errorMessage.includes("déjà")) {
          toast.error("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.");
        } else if (errorMessage.includes("password") || errorMessage.includes("mot de passe")) {
          toast.error("Le mot de passe ne respecte pas les critères requis.");
        } else if (errorMessage.includes("email") || errorMessage.includes("invalid")) {
          toast.error("L'adresse email n'est pas valide.");
        } else {
          toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
        }
        return;
      }

      if (res.data) {
        try {
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
          toast.success("Inscription réussie ! Redirection...");
          router.push("/auth/recruteur/login");
        } catch (signupError) {
          console.error("Erreur lors de la finalisation de l'inscription:", signupError);
          toast.error("Erreur lors de la finalisation de l'inscription. Veuillez contacter le support.");
        }
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: '"Inter Tight", system-ui, sans-serif' }}>
      <AuthSidePanel userType="recruteur" />
      <AuthForm type="register" userType="recruteur" onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
