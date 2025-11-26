"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  IconCheck,
  IconX,
  IconMail,
  IconBuilding,
  IconUser,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import { useSession, signOut } from "@/lib/auth-client";

interface InvitationData {
  email: string;
  role: string;
  expiresAt: string;
  recruteur: {
    companyName: string | null;
    email: string;
  };
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    password: "",
  });
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitations/accept/${token}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erreur lors du chargement de l'invitation");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setInvitation(data.data);
        setFormData((prev) => ({
          ...prev,
          // Pré-remplir avec l'email si disponible
        }));
      }
    } catch (err: any) {
      setError("Erreur lors du chargement de l'invitation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/accept/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresLogin) {
          setRequiresLogin(true);
          setError(
            data.error ||
              "Un compte existe déjà avec cet email. Veuillez vous connecter avec ce compte."
          );
        } else {
          setError(
            data.error || "Erreur lors de l'acceptation de l'invitation"
          );
        }
        return;
      }

      if (data.success) {
        // Si l'utilisateur vient de créer un compte, rediriger vers la connexion
        // Sinon, rediriger vers le dashboard
        if (!session?.user) {
          router.push(`/auth/recruteur/login`);
        } else {
          router.push("/recruteur/dashboard");
        }
      }
    } catch (err: any) {
      setError("Erreur lors de l'acceptation de l'invitation");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Administrateur",
      MANAGER: "Manager",
      USER: "Utilisateur",
      VIEWER: "Observateur",
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen">
        <IconLoader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-muted-foreground">
          Chargement de l'invitation...
        </p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <IconX className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center">Erreur</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <IconMail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-center">Accepter l'invitation</CardTitle>
          <CardDescription className="text-center">
            Vous avez été invité à rejoindre une équipe de recrutement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitation && (
            <>
              {/* Informations de l'invitation */}
              <div className="mb-6 space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <IconBuilding className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {invitation.recruteur.companyName ||
                      "Équipe de recrutement"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{invitation.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Rôle : <strong>{getRoleLabel(invitation.role)}</strong>
                  </span>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                    {requiresLogin && (
                      <div className="mt-2 space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            router.push(
                              `/auth/collaborateur/login?email=${
                                invitation?.email || ""
                              }`
                            )
                          }
                        >
                          Se connecter avec {invitation?.email}
                        </Button>
                        {session?.user && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              await signOut();
                              window.location.reload();
                            }}
                          >
                            Se déconnecter d'abord
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {session?.user && session.user.email !== invitation?.email && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-600 mb-2">
                      Vous êtes connecté avec un autre email (
                      {session.user.email}). Pour accepter cette invitation,
                      vous devez créer un compte avec l'email de l'invitation (
                      {invitation?.email}).
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await signOut();
                        window.location.reload();
                      }}
                    >
                      Se déconnecter
                    </Button>
                  </div>
                )}

                {!session?.user && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-600">
                      Vous n'êtes pas connecté. Créez un compte pour accepter
                      l'invitation.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        prenom: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nom: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* {!session?.user && ( */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Créez un mot de passe (min. 6 caractères)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce mot de passe vous permettra de vous connecter à votre
                    compte collaborateur.
                  </p>
                </div>
                {/* )} */}

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <IconCheck className="h-4 w-4 mr-2" />
                        Accepter l'invitations
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="mt-4 text-xs text-center text-muted-foreground">
                {session?.user
                  ? "En acceptant, vous pourrez accéder à l'espace collaborateur de cette équipe."
                  : "En acceptant, votre compte collaborateur sera créé et vous pourrez accéder à l'espace de cette équipe."}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
