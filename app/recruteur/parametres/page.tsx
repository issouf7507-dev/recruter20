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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { useSession, changePassword } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { toast } from "sonner";
import {
  IconUser,
  IconBuilding,
  IconMail,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconSettings,
  IconLock,
  IconBell,
  IconLoader,
  IconCheck,
  IconRobot,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconExternalLink,
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  updateRecruteurInformation,
  updateRecruteurInformationEntreprise,
} from "@/lib/api/recruteurs/service";

export default function ParametresPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  // IA API Key state
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyVisible, setAiKeyVisible] = useState(false);
  const [aiKeyStatus, setAiKeyStatus] = useState<{
    hasKey: boolean;
    maskedKey: string | null;
    provider: string;
  } | null>(null);
  const [aiProvider, setAiProvider] = useState("claude");
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: recruteur?.firstName || "",
    lastName: recruteur?.lastName || "",
    email: recruteur?.email || session?.user?.email || "",
    phone: recruteur?.phone || "",
    companyName: recruteur?.companyName || "",
    description: recruteur?.description || "",
    industry: recruteur?.industry || "",
    size: recruteur?.size || "",
    location: recruteur?.location || "",
    website: recruteur?.website || "",
  });

  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    candidateAlerts: true,
  });

  // Password states
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

  // Update form data when recruteur data loads
  useEffect(() => {
    if (recruteur) {
      setFormData({
        firstName: recruteur.firstName || "",
        lastName: recruteur.lastName || "",
        email: recruteur.email || "",
        phone: recruteur.phone || "",
        companyName: recruteur.companyName || "",
        description: recruteur.description || "",
        industry: recruteur.industry || "",
        size: recruteur.size || "",
        location: recruteur.location || "",
        website: recruteur.website || "",
      });
    }
  }, [recruteur]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update recruteur
      // const response = await updateRecruteur(recruteur?.id, formData);
      await updateRecruteurInformation(recruteurId!, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      // console.log("formData", formData);x1x§
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEntreprise = async () => {
    setIsSaving(true);
    try {
      await updateRecruteurInformationEntreprise(recruteurId!, {
        companyName: formData.companyName,
        description: formData.description,
        industry: formData.industry,
        size: formData.size,
        location: formData.location,
        website: formData.website,
      });
      toast.success("Entreprise mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'entreprise");
      console.error(error);
    } finally {
      setIsSaving(false);
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
        toast.error(
          result.error.message ||
            "Erreur lors de la mise à jour du mot de passe"
        );
        return;
      }

      toast.success("Mot de passe mis à jour avec succès");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de la mise à jour du mot de passe"
      );
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des paramètres");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Countdown pour renvoi de code de vérification
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
        // Rafraîchir la session pour refléter emailVerified = true
        window.location.reload();
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const AI_PROVIDERS = [
    {
      id: "claude",
      label: "Claude (Anthropic)",
      placeholder: "sk-ant-api03-...",
      prefix: "sk-ant-",
      model: "claude-haiku-4-5-20251001",
      cost: "~0,01 $ par analyse (Claude Haiku)",
      consoleUrl: "https://console.anthropic.com",
      consoleName: "console.anthropic.com",
      steps: [
        'Connectez-vous sur console.anthropic.com',
        'Allez dans API Keys → Create Key',
        'Copiez la clé et collez-la ci-dessus',
        'Vous aurez besoin de crédits sur votre compte Anthropic',
      ],
    },
    {
      id: "openai",
      label: "GPT-4 (OpenAI)",
      placeholder: "sk-proj-...",
      prefix: "sk-",
      model: "gpt-4o-mini",
      cost: "~0,01 $ par analyse (GPT-4o mini)",
      consoleUrl: "https://platform.openai.com/api-keys",
      consoleName: "platform.openai.com",
      steps: [
        'Connectez-vous sur platform.openai.com',
        'Allez dans API keys → Create new secret key',
        'Copiez la clé et collez-la ci-dessus',
        'Vous aurez besoin de crédits sur votre compte OpenAI',
      ],
    },
  ] as const;

  // Charger le statut de la clé IA quand le recruteurId est disponible
  useEffect(() => {
    if (!recruteurId) return;
    fetch(`/api/recruteurs/${recruteurId}/claude-key`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAiKeyStatus(d.data);
          if (d.data.provider) setAiProvider(d.data.provider);
        }
      })
      .catch(() => {});
  }, [recruteurId]);

  const handleSaveAiKey = async () => {
    if (!recruteurId) return;
    const provider = AI_PROVIDERS.find((p) => p.id === aiProvider);
    if (!provider) return;
    if (!aiKeyInput.startsWith(provider.prefix)) {
      toast.error(`La clé ${provider.label} doit commencer par '${provider.prefix}'`);
      return;
    }
    setIsSavingKey(true);
    try {
      const res = await fetch(`/api/recruteurs/${recruteurId}/claude-key`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: aiKeyInput, provider: aiProvider }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Erreur de sauvegarde"); return; }
      toast.success(`Clé API ${provider.label} sauvegardée !`);
      setAiKeyInput("");
      const status = await fetch(`/api/recruteurs/${recruteurId}/claude-key`).then((r) => r.json());
      if (status.success) setAiKeyStatus(status.data);
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSavingKey(false); }
  };

  const handleDeleteAiKey = async () => {
    if (!recruteurId) return;
    setIsSavingKey(true);
    try {
      await fetch(`/api/recruteurs/${recruteurId}/claude-key`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: null }),
      });
      setAiKeyStatus({ hasKey: false, maskedKey: null, provider: "claude" });
      toast.success("Clé API supprimée");
    } catch { toast.error("Erreur réseau"); }
    finally { setIsSavingKey(false); }
  };

  if (isSessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <IconLoader className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const isCollaborateur = !!collaborateur && !recruteur;

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconSettings className="h-6 w-6" />
                  Paramètres
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez vos informations personnelles et les paramètres de votre
                  compte
                </p>
              </div>

              {isCollaborateur && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Vous êtes connecté en tant que collaborateur. Certains
                      paramètres peuvent être limités.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profil">Profil</TabsTrigger>
                  <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
                  <TabsTrigger value="securite">Sécurité</TabsTrigger>
                  <TabsTrigger value="ia" className="flex items-center gap-1.5">
                    <IconRobot className="h-3.5 w-3.5" />
                    IA
                    {aiKeyStatus?.hasKey && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Profil Tab */}
                <TabsContent value="profil" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconUser className="h-5 w-5" />
                        Informations personnelles
                      </CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations personnelles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <IconMail className="h-4 w-4" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="votre@email.com"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <IconPhone className="h-4 w-4" />
                            Téléphone
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+33 6 12 34 56 78"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <IconCheck className="h-4 w-4 mr-2" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notifications Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconBell className="h-5 w-5" />
                        Notifications
                      </CardTitle>
                      <CardDescription>
                        Gérez vos préférences de notification
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications">
                            Notifications par email
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recevez des notifications importantes par email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              emailNotifications: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="smsNotifications">
                            Notifications par SMS
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recevez des notifications urgentes par SMS
                          </p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={settings.smsNotifications}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              smsNotifications: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weeklyReports">
                            Rapports hebdomadaires
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recevez un résumé hebdomadaire de vos activités
                          </p>
                        </div>
                        <Switch
                          id="weeklyReports"
                          checked={settings.weeklyReports}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, weeklyReports: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="candidateAlerts">
                            Alertes candidats
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Soyez notifié lorsqu'un nouveau candidat correspond
                            à vos critères
                          </p>
                        </div>
                        <Switch
                          id="candidateAlerts"
                          checked={settings.candidateAlerts}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              candidateAlerts: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSaveSettings}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <IconCheck className="h-4 w-4 mr-2" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Entreprise Tab */}
                <TabsContent value="entreprise" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconBuilding className="h-5 w-5" />
                        Informations de l'entreprise
                      </CardTitle>
                      <CardDescription>
                        Mettez à jour les informations de votre entreprise
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Nom de l'entreprise *
                        </Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              companyName: e.target.value,
                            })
                          }
                          placeholder="Nom de votre entreprise"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Décrivez votre entreprise..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Secteur d'activité</Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) =>
                              setFormData({ ...formData, industry: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un secteur" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="informatique">
                                Informatique
                              </SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="sante">Santé</SelectItem>
                              <SelectItem value="education">
                                Éducation
                              </SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="industrie">
                                Industrie
                              </SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="size">Taille de l'entreprise</Label>
                          <Select
                            value={formData.size}
                            onValueChange={(value) =>
                              setFormData({ ...formData, size: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une taille" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">
                                1-10 employés
                              </SelectItem>
                              <SelectItem value="11-50">
                                11-50 employés
                              </SelectItem>
                              <SelectItem value="51-200">
                                51-200 employés
                              </SelectItem>
                              <SelectItem value="201-500">
                                201-500 employés
                              </SelectItem>
                              <SelectItem value="500+">
                                500+ employés
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="location"
                            className="flex items-center gap-2"
                          >
                            <IconMapPin className="h-4 w-4" />
                            Localisation
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Ville, Pays"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="website"
                            className="flex items-center gap-2"
                          >
                            <IconWorld className="h-4 w-4" />
                            Site web
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                website: e.target.value,
                              })
                            }
                            placeholder="https://www.example.com"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSaveEntreprise}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <IconCheck className="h-4 w-4 mr-2" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sécurité Tab */}
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
                                  onChange={(e) => setVerifCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconLock className="h-5 w-5" />
                        Changer le mot de passe
                      </CardTitle>
                      <CardDescription>
                        Mettez à jour votre mot de passe pour sécuriser votre
                        compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Mot de passe actuel
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Entrez votre mot de passe actuel"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">
                          Nouveau mot de passe
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Au moins 8 caractères"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmer le nouveau mot de passe
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSavePassword}
                          disabled={isSaving}
                        >
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
                {/* Onglet IA */}
                <TabsContent value="ia" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconRobot className="h-5 w-5 text-primary" />
                        Matching IA — Clé API
                      </CardTitle>
                      <CardDescription>
                        Configurez votre fournisseur IA et votre clé API pour activer l&apos;analyse intelligente des candidats.
                        La clé est stockée de façon sécurisée et n&apos;est jamais exposée dans le navigateur.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      {/* Statut actuel */}
                      <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                        aiKeyStatus?.hasKey
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-muted/50 border-muted"
                      }`}>
                        {aiKeyStatus?.hasKey ? (
                          <IconCircleCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <IconAlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {aiKeyStatus?.hasKey
                              ? `Clé API configurée — ${AI_PROVIDERS.find((p) => p.id === aiKeyStatus.provider)?.label ?? aiKeyStatus.provider}`
                              : "Aucune clé API configurée"}
                          </p>
                          {aiKeyStatus?.maskedKey && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {aiKeyStatus.maskedKey}
                            </p>
                          )}
                          {!aiKeyStatus?.hasKey && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Choisissez un fournisseur et ajoutez votre clé pour activer le matching IA.
                            </p>
                          )}
                        </div>
                        {aiKeyStatus?.hasKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={handleDeleteAiKey}
                            disabled={isSavingKey}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Sélecteur de provider */}
                      <div className="space-y-3">
                        <Label>Fournisseur IA</Label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {AI_PROVIDERS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setAiProvider(p.id); setAiKeyInput(""); }}
                              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                                aiProvider === p.id
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-muted hover:border-muted-foreground/40 text-muted-foreground"
                              }`}
                            >
                              <IconRobot className="h-5 w-5" />
                              <span className="text-xs leading-tight text-center">{p.label}</span>
                            </button>
                          ))}
                          {/* Providers à venir */}
                          {(["Gemini", "Kimi"] as const).map((name) => (
                            <div
                              key={name}
                              className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-muted p-3 text-sm opacity-50 cursor-not-allowed"
                            >
                              <IconRobot className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs leading-tight text-center text-muted-foreground">{name}</span>
                              <span className="text-[10px] text-muted-foreground">Bientôt</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Formulaire de saisie */}
                      {(() => {
                        const selectedProvider = AI_PROVIDERS.find((p) => p.id === aiProvider)!;
                        return (
                          <div className="space-y-3">
                            <Label htmlFor="ai-key">
                              {aiKeyStatus?.hasKey ? "Remplacer la clé" : `Clé API ${selectedProvider.label}`}
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id="ai-key"
                                  type={aiKeyVisible ? "text" : "password"}
                                  placeholder={selectedProvider.placeholder}
                                  value={aiKeyInput}
                                  onChange={(e) => setAiKeyInput(e.target.value)}
                                  className="pr-10 font-mono text-sm"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => setAiKeyVisible((v) => !v)}
                                >
                                  {aiKeyVisible
                                    ? <IconEyeOff className="h-4 w-4" />
                                    : <IconEye className="h-4 w-4" />}
                                </button>
                              </div>
                              <Button
                                onClick={handleSaveAiKey}
                                disabled={!aiKeyInput || isSavingKey}
                              >
                                {isSavingKey ? (
                                  <IconLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconCheck className="h-4 w-4 mr-1" />
                                )}
                                Sauvegarder
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              La clé doit commencer par{" "}
                              <code className="bg-muted px-1 rounded">{selectedProvider.prefix}</code>.
                              Elle est chiffrée côté serveur.
                            </p>
                          </div>
                        );
                      })()}

                      {/* Instructions dynamiques selon le provider */}
                      {(() => {
                        const selectedProvider = AI_PROVIDERS.find((p) => p.id === aiProvider)!;
                        return (
                          <div className="rounded-lg border p-4 space-y-3">
                            <p className="text-sm font-medium">Comment obtenir votre clé {selectedProvider.label} ?</p>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                              <li>
                                Connectez-vous sur{" "}
                                <a
                                  href={selectedProvider.consoleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline inline-flex items-center gap-1"
                                >
                                  {selectedProvider.consoleName} <IconExternalLink className="h-3 w-3" />
                                </a>
                              </li>
                              {selectedProvider.steps.slice(1).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                            <div className="bg-muted/50 rounded p-3 text-xs text-muted-foreground flex items-start gap-2">
                              <IconInfoCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>
                                <strong>Coût estimé :</strong> {selectedProvider.cost}.{" "}
                                Une analyse de 10 candidats coûte moins de 0,10 $.
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Fonctionnement */}
                      <div className="rounded-lg border p-4 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <IconRobot className="h-4 w-4 text-primary" /> Comment fonctionne le matching IA ?
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold shrink-0">1.</span>
                            Dans <strong>Recherche de CV</strong>, sélectionnez jusqu&apos;à 10 candidats
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold shrink-0">2.</span>
                            Choisissez une de vos offres d&apos;emploi
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold shrink-0">3.</span>
                            L&apos;IA analyse les profils et retourne un score de compatibilité (0–100),
                            les points forts, les manques et une synthèse
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold shrink-0">4.</span>
                            Les candidats sont triés du plus compatible au moins compatible
                          </li>
                        </ul>
                      </div>

                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
