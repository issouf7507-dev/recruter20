// app/auth/candidat/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        const error = searchParams.get("error");

        if (error === "INVALID_TOKEN") {
            toast.error("Le lien de réinitialisation est invalide ou a expiré.");
            router.push("/auth/candidat/forgot-password");
        } else if (!tokenParam) {
            toast.error("Token manquant");
            router.push("/auth/candidat/login");
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, router]);

    const checkPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return "bg-red-500";
        if (passwordStrength <= 3) return "bg-yellow-500";
        if (passwordStrength <= 4) return "bg-green-500";
        return "bg-green-600";
    };

    const getStrengthText = () => {
        if (passwordStrength <= 2) return "Faible";
        if (passwordStrength <= 3) return "Moyen";
        if (passwordStrength <= 4) return "Fort";
        return "Très fort";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (!token) {
            toast.error("Token invalide");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Lien invalide ou expiré");
                if (res.status === 400) {
                    setTimeout(() => router.push("/auth/candidat/forgot-password"), 2000);
                }
                return;
            }

            toast.success("Mot de passe réinitialisé avec succès !");
            setTimeout(() => router.push("/auth/candidat/login"), 2000);

        } catch (error: unknown) {
            toast.error("Erreur lors de la réinitialisation. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#a590ff] grid grid-cols-1 xl:grid-cols-2 p-4 md:p-5">
            {/* Left side - Branding */}
            <div className="xl:flex flex-col order-2 lg:order-1 hidden">
                <div className="flex items-center justify-between px-4 md:px-10 py-4">
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">
                        Ylsix
                    </h1>
                    <Link
                        href="/auth/candidat/login"
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Retour</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-start p-10">
                    <div className="text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4">
                            Nouveau mot de passe
                        </h1>
                        <p className="text-base md:text-lg opacity-90 mb-4">
                            Choisissez un mot de passe sécurisé pour protéger votre compte.
                        </p>
                        <div className="space-y-2 text-sm opacity-80">
                            <p>✓ Au moins 8 caractères</p>
                            <p>✓ Une majuscule et une minuscule</p>
                            <p>✓ Un chiffre</p>
                            <p>✓ Un caractère spécial (recommandé)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Créer un nouveau mot de passe
                        </h2>
                        <p className="text-gray-600">
                            Votre nouveau mot de passe doit être différent des précédents
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        checkPasswordStrength(e.target.value);
                                    }}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent outline-none transition pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>

                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 h-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 rounded-full ${level <= passwordStrength ? getStrengthColor() : "bg-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs mt-1 ${getStrengthColor().replace("bg-", "text-")}`}>
                                        Force : {getStrengthText()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a590ff] focus:border-transparent outline-none transition pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">
                                    Les mots de passe ne correspondent pas
                                </p>
                            )}
                            {confirmPassword && password === confirmPassword && password && (
                                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" /> Les mots de passe correspondent
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-[#a590ff] text-white rounded-lg hover:bg-[#8f7ae6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Réinitialisation...</span>
                                </>
                            ) : (
                                <span>Réinitialiser le mot de passe</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
