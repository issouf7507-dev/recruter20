"use client";

import { useState } from "react";

import AuthForm from "@/components/auth/AuthForm";
import AuthSidePanel from "@/components/auth/AuthSidePanel";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { getCandidat } from "@/lib/actions/getCandidat";

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
        // console.error(res.error);
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: '"Inter Tight", system-ui, sans-serif' }}>
      <AuthSidePanel userType="candidat" />
      <AuthForm type="login" userType="candidat" onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
