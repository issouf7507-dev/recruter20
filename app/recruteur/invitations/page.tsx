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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteHeader } from "@/components/site-header";
import {
  IconMail,
  IconUserPlus,
  IconCheck,
  IconX,
  IconClock,
  IconUsers,
  IconSearch,
  IconFilter,
  IconSend,
  IconEye,
  IconTrash,
  IconRefresh,
  IconCalendar,
  IconBuilding,
} from "@tabler/icons-react";
import { useInvitations } from "@/lib/hooks/use-invitations";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId } from "@/lib/hooks/use-recruteurs";

interface Invitation {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  createdAt: string;
  expiresAt: string;
  recruteur?: {
    companyName: string | null;
  };
}

export default function InvitationsPage() {
  // const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "USER" as "ADMIN" | "USER" | "MANAGER" | "VIEWER",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id;
  const {
    invitations,
    isLoadingInvitations,
    errorInvitations,
    refetchInvitations,
    createAnInvitation,
  } = useInvitations();

  console.log(invitations);

  const getStatutBadge = (invitation: Invitation) => {
    if (invitation.accepted) {
      return <Badge className="bg-green-100 text-green-800">Acceptée</Badge>;
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return <Badge className="bg-gray-100 text-gray-800">Expirée</Badge>;
    }

    return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
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

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const filteredInvitations = invitations?.filter((invitation) => {
    const matchesSearch = invitation?.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatut =
      filterStatut === "all" ||
      (filterStatut === "en-attente" &&
        !invitation?.accepted &&
        new Date(invitation?.expiresAt) >= new Date()) ||
      (filterStatut === "acceptee" && invitation.accepted) ||
      (filterStatut === "expiree" &&
        !invitation?.accepted &&
        new Date(invitation?.expiresAt) < new Date());

    const matchesType =
      filterType === "all" ||
      invitation.role.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesStatut && matchesType;
  });

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette invitation ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        invitations?.filter((inv) => inv?.id !== id);
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Error deleting invitation:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}/resend`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Email renvoyé avec succès");
      } else {
        alert(data.error || "Erreur lors du renvoi de l'email");
      }
    } catch (err) {
      console.error("Error resending invitation:", err);
      alert("Erreur lors du renvoi de l'email");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(inviteForm);
    // setSubmitting(true);
    // setError(null);

    try {
      await createAnInvitation.mutateAsync({
        email: inviteForm.email,
        role: inviteForm.role,
        recruteurId: recruteurId || "",
      });
    } catch (error) {
      toast.error(
        (error as Error).message || "Erreur lors de la création de l'invitation"
      );
    }
  };

  return (
    <>
      <SiteHeader title="Invitations" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconMail className="h-6 w-6" />
                  Invitations
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez vos invitations de collaborateurs et partenaires
                </p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total invitations
                        </p>
                        <p className="text-2xl font-bold">
                          {loading ? "..." : invitations?.length}
                        </p>
                      </div>
                      <IconMail className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          En attente
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            invitations?.filter(
                              (inv) =>
                                !inv?.accepted &&
                                new Date(inv?.expiresAt) >= new Date()
                            ).length
                          }
                        </p>
                      </div>
                      <IconClock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Acceptées
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {invitations?.filter((inv) => inv?.accepted).length}
                        </p>
                      </div>
                      <IconCheck className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Collaborateurs
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {
                            invitations?.filter(
                              (inv) =>
                                !inv?.accepted &&
                                new Date(inv?.expiresAt) < new Date()
                            ).length
                          }
                        </p>
                      </div>
                      <IconUsers className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions et filtres */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                      >
                        <IconUserPlus className="h-4 w-4" />
                        Inviter un collaborateur
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetchInvitations()}
                      >
                        <IconRefresh className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher..."
                          className="pl-10 w-[200px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select
                        value={filterStatut}
                        onValueChange={setFilterStatut}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="en-attente">En attente</SelectItem>
                          <SelectItem value="acceptee">Acceptées</SelectItem>
                          <SelectItem value="expiree">Expirées</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les types</SelectItem>
                          <SelectItem value="ADMIN">Administrateur</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="USER">Utilisateur</SelectItem>
                          <SelectItem value="VIEWER">Observateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulaire d'invitation */}
              {showInviteForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUserPlus className="h-5 w-5" />
                      Inviter un nouveau collaborateur
                    </CardTitle>
                    <CardDescription>
                      Envoyez une invitation à un collaborateur pour rejoindre
                      votre équipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleInviteSubmit} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          placeholder="collaborateur@entreprise.com"
                          value={inviteForm.email}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rôle *</label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(
                            value: "ADMIN" | "USER" | "MANAGER" | "VIEWER"
                          ) =>
                            setInviteForm((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              Administrateur
                            </SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="USER">Utilisateur</SelectItem>
                            <SelectItem value="VIEWER">Observateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <IconRefresh className="h-4 w-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <IconSend className="h-4 w-4" />
                              Envoyer l'invitation
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowInviteForm(false);
                            setError(null);
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Liste des invitations */}
              <div className="space-y-4">
                {filteredInvitations?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconMail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucune invitation trouvée
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ||
                        filterStatut !== "all" ||
                        filterType !== "all"
                          ? "Aucune invitation ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore envoyé d'invitations."}
                      </p>
                      <Button onClick={() => setShowInviteForm(true)}>
                        <IconUserPlus className="h-4 w-4" />
                        Envoyer une invitation
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredInvitations?.map((invitation) => {
                    const isExpired =
                      new Date(invitation?.expiresAt) < new Date();
                    const isPending = !invitation.accepted && !isExpired;

                    return (
                      <Card
                        key={invitation?.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {getInitials(invitation.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    {invitation.email}
                                  </h3>
                                  {getStatutBadge(invitation as any)}
                                  <Badge variant="outline">
                                    {getRoleLabel(invitation.role)}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <IconMail className="h-4 w-4" />
                                      {invitation.email}
                                    </span>
                                    {invitation.recruteur?.companyName && (
                                      <span className="flex items-center gap-1">
                                        <IconBuilding className="h-4 w-4" />
                                        {invitation.recruteur.companyName}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <IconCalendar className="h-4 w-4" />
                                      Invité le{" "}
                                      {new Date(
                                        invitation.createdAt
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleResendInvitation(invitation.id)
                                  }
                                >
                                  <IconSend className="h-4 w-4" />
                                  Renvoyer
                                </Button>
                              )}
                              {isExpired && !invitation.accepted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleResendInvitation(invitation.id)
                                  }
                                >
                                  <IconSend className="h-4 w-4" />
                                  Renvoyer
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteInvitation(invitation.id)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Informations supplémentaires */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Expire le:
                                </span>
                                <span className="ml-2 font-medium">
                                  {new Date(
                                    invitation.expiresAt
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                              {invitation.accepted && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Statut:
                                  </span>
                                  <span className="ml-2 font-medium text-green-600">
                                    Acceptée
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
