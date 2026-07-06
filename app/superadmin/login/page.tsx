"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  IconShieldLock,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { signIn, signOut, twoFactor } from "@/lib/auth-client";
import { getSuperAdminAuthStatus } from "@/lib/actions/superadminAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "credentials" | "totp" | "setup";

export default function SuperAdminLoginPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Rechargement complet pour que le guard serveur relise le cookie de session frais
  const goToDashboard = () => {
    window.location.href = "/superadmin";
  };

  const resetToLogin = () => {
    setStep("credentials");
    setCode("");
    setPassword("");
    setTotpUri(null);
    setBackupCodes([]);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        toast.error("Email ou mot de passe incorrect.");
        return;
      }

      // 2FA déjà active : better-auth ne crée pas de session complète et exige le code TOTP.
      const data = res.data as { twoFactorRedirect?: boolean } | null;
      if (data?.twoFactorRedirect) {
        setStep("totp");
        return;
      }

      // Session complète créée → on relit le rôle en base
      const status = await getSuperAdminAuthStatus();
      if (!status.isSuperAdmin) {
        await signOut();
        toast.error("Accès réservé aux super administrateurs.");
        return;
      }

      if (!status.twoFactorEnabled) {
        // Première connexion : la 2FA est obligatoire → on lance la configuration
        const enroll = await twoFactor.enable({ password });
        if (enroll.error || !enroll.data) {
          toast.error("Impossible d'initialiser la 2FA. Réessayez.");
          return;
        }
        setTotpUri(enroll.data.totpURI);
        setBackupCodes(enroll.data.backupCodes ?? []);
        setStep("setup");
        return;
      }

      goToDashboard();
    } catch {
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  // Utilisé aussi bien pour vérifier une 2FA existante que pour confirmer la configuration
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await twoFactor.verifyTotp({ code });
      if (res.error) {
        toast.error("Code invalide ou expiré.");
        return;
      }
      const status = await getSuperAdminAuthStatus();
      if (!status.isSuperAdmin) {
        await signOut();
        toast.error("Accès réservé aux super administrateurs.");
        return;
      }
      goToDashboard();
    } catch {
      toast.error("Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <IconShieldLock className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Ylsix — Super Admin</CardTitle>
            <CardDescription>
              {step === "credentials" && "Espace réservé aux administrateurs plateforme"}
              {step === "totp" && "Saisissez le code de votre application d'authentification"}
              {step === "setup" && "Configurez la double authentification (obligatoire)"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleCredentials} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ylsix.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading && <IconLoader2 className="size-4 animate-spin" />}
                Se connecter
              </Button>
            </form>
          )}

          {step === "totp" && (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code à 6 chiffres</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.4em]"
                />
              </div>
              <Button type="submit" disabled={loading || code.length < 6}>
                {loading && <IconLoader2 className="size-4 animate-spin" />}
                Vérifier
              </Button>
              <button
                type="button"
                onClick={resetToLogin}
                className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <IconArrowLeft className="size-4" />
                Retour
              </button>
            </form>
          )}

          {step === "setup" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Scannez ce QR code avec Google Authenticator, Authy ou 1Password,
                puis saisissez le code généré pour finaliser.
              </p>
              {totpUri && (
                <div className="mx-auto rounded-lg bg-white p-3">
                  <QRCodeSVG value={totpUri} size={176} />
                </div>
              )}

              {backupCodes.length > 0 && (
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="mb-2 text-xs font-medium">
                    Codes de secours — conservez-les en lieu sûr :
                  </p>
                  <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                    {backupCodes.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="setup-code">Code de vérification</Label>
                  <Input
                    id="setup-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.4em]"
                  />
                </div>
                <Button type="submit" disabled={loading || code.length < 6}>
                  {loading && <IconLoader2 className="size-4 animate-spin" />}
                  Activer la 2FA et continuer
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
