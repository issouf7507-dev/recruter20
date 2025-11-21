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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profil">Profil</TabsTrigger>
                  <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
                  <TabsTrigger value="securite">Sécurité</TabsTrigger>
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
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
