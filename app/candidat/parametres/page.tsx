"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { useSession, changePassword } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  IconLock,
  IconMail,
  IconLoader,
  IconCheck,
  IconSettings,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommandationsEmailToggle } from "@/components/notifications/recommandations-email-toggle";

export default function CandidatParametresPage() {
  const { data: session, isPending: isSessionLoading } = useSession();

  // Password states
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Email verification states
  const [verifCode, setVerifCode] = useState("");
  const [isSendingVerifCode, setIsSendingVerifCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verifCodeSent, setVerifCodeSent] = useState(false);
  const [verifCountdown, setVerifCountdown] = useState(0);

  useEffect(() => {
    if (verifCountdown <= 0) return;
    const t = setTimeout(() => setVerifCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [verifCountdown]);

  const handleSendVerifCode = async () => {
    const email = session?.user?.email;
    if (!email) return;
    setIsSendingVerifCode(true);
    try {
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'envoi du code");
      } else {
        toast.success("Code envoyé ! Vérifiez votre boîte email.");
        setVerifCodeSent(true);
        setVerifCountdown(60);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSendingVerifCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    const email = session?.user?.email;
    if (!email || verifCode.length !== 6) return;
    setIsVerifyingEmail(true);
    try {
      const res = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verifCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Code incorrect");
        setVerifCode("");
      } else {
        toast.success("Email vérifié avec succès !");
        setVerifCodeSent(false);
        setVerifCode("");
        window.location.reload();
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setIsSaving(true);
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.error) {
        toast.error(result.error.message || "Erreur lors de la mise à jour du mot de passe");
        return;
      }
      toast.success("Mot de passe mis à jour avec succès");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <IconLoader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Paramètres" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <IconSettings className="h-6 w-6" />
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez la sécurité de votre compte
            </p>
          </div>

          <Tabs defaultValue="securite" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="securite">Sécurité</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconMail className="h-5 w-5" />
                    Notifications par email
                  </CardTitle>
                  <CardDescription>
                    Choisissez les emails que vous souhaitez recevoir de Ylsix.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecommandationsEmailToggle />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="securite" className="space-y-6">
              {/* Email Verification Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconMail className="h-5 w-5" />
                    Vérification de l&apos;email
                  </CardTitle>
                  <CardDescription>
                    Vérifiez que vous êtes bien propriétaire de votre adresse email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {session?.user?.emailVerified ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
                      <IconCircleCheck className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Email vérifié
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800">
                        <IconAlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Email non vérifié
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                      {!verifCodeSent ? (
                        <Button
                          onClick={handleSendVerifCode}
                          disabled={isSendingVerifCode}
                          variant="outline"
                        >
                          {isSendingVerifCode ? (
                            <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <IconMail className="h-4 w-4 mr-2" />
                          )}
                          Envoyer un code de vérification
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Entrez le code à 6 chiffres reçu par email
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={verifCode}
                              onChange={(e) =>
                                setVerifCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              placeholder="123456"
                              maxLength={6}
                              className="font-mono tracking-widest max-w-[140px]"
                            />
                            <Button
                              onClick={handleVerifyEmail}
                              disabled={isVerifyingEmail || verifCode.length !== 6}
                            >
                              {isVerifyingEmail ? (
                                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <IconCheck className="h-4 w-4 mr-2" />
                              )}
                              Vérifier
                            </Button>
                          </div>
                          <button
                            onClick={handleSendVerifCode}
                            disabled={isSendingVerifCode || verifCountdown > 0}
                            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-1"
                          >
                            <IconInfoCircle className="h-3 w-3" />
                            {verifCountdown > 0
                              ? `Renvoyer dans ${verifCountdown}s`
                              : "Renvoyer le code"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconLock className="h-5 w-5" />
                    Changer le mot de passe
                  </CardTitle>
                  <CardDescription>
                    Mettez à jour votre mot de passe pour sécuriser votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder="Entrez votre mot de passe actuel"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrent((v) => !v)}
                      >
                        {showCurrent ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNew ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Au moins 8 caractères"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNew((v) => !v)}
                      >
                        {showNew ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="Confirmez votre nouveau mot de passe"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSavePassword} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <IconCheck className="h-4 w-4 mr-2" />
                          Mettre à jour le mot de passe
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
