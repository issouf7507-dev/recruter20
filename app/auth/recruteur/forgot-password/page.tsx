// app/auth/recruteur/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { forgetPassword } from "@/lib/auth-client";


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Utiliser l'API native de Better Auth
            await forgetPassword({
                email,
                redirectTo: `${window.location.origin}/auth/recruteur/reset-password`,
            });

            // Better Auth renvoie toujours une réponse positive pour éviter l'énumération
            setIsSent(true);
            toast.success("Si un compte existe, un email de réinitialisation a été envoyé");
        } catch (error: any) {
            console.error("Erreur:", error);
            // Ne pas révéler d'information spécifique
            toast.error("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen bg-[#a590ff] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MailIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Email envoyé !
                        </h2>
                        <p className="text-gray-600">
                            Si un compte existe avec l'adresse <strong className="text-[#a590ff]">{email}</strong>,
                            vous recevrez un email avec un lien de réinitialisation.
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Vérifiez vos spams si vous ne recevez pas l'email dans quelques minutes.
                        </p>
                    </div>
                    <Link
                        href="/auth/recruteur/login"
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#a590ff] text-white rounded-lg hover:bg-[#8f7ae6] transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#a590ff] grid grid-cols-1 xl:grid-cols-2 p-4 md:p-5">
            {/* Left side - Branding */}
            <div className="xl:flex flex-col order-2 lg:order-1 hidden">
                <div className="flex items-center justify-between px-4 md:px-10 py-4">
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">
                        Ylsix
                    </h1>
                    <Link
                        href="/auth/recruteur/login"
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-start p-10">
                    <div className="text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                            Mot de passe oublié ?
                        </h1>
                        <p className="text-base md:text-lg opacity-90 mb-4">
                            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>
                        <p className="text-lg">
                            Vous vous souvenez de votre mot de passe ?{" "}
                            <Link
                                href="/auth/recruteur/login"
                                className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Réinitialiser le mot de passe
                        </h2>
                        <p className="text-gray-600">
                            Entrez votre email pour recevoir un lien de réinitialisation
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent outline-none transition"
                                placeholder="exemple@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-[#a590ff] text-white rounded-lg hover:bg-[#8f7ae6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Envoi en cours...</span>
                                </>
                            ) : (
                                <span>Envoyer le lien</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth/recruteur/login"
                            className="text-sm text-gray-600 hover:text-[#a590ff] transition-colors"
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}