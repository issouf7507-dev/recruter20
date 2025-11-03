"use client";

import { useState } from "react";
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

// Données mockées pour les invitations
const mockInvitations = [
  {
    id: 1,
    type: "collaborateur",
    email: "marie.dubois@techcorp.com",
    nom: "Marie Dubois",
    role: "Responsable RH",
    entreprise: "TechCorp",
    statut: "en-attente",
    dateInvitation: "2024-01-20",
    dateExpiration: "2024-01-27",
    permissions: [
      "Voir les candidatures",
      "Gérer les offres",
      "Accès aux statistiques",
    ],
    message:
      "Bonjour Marie, je vous invite à rejoindre notre équipe de recrutement pour nous aider à gérer nos offres d'emploi.",
    invitePar: "Jean Martin",
  },
  {
    id: 2,
    type: "collaborateur",
    email: "pierre.martin@startupxyz.com",
    nom: "Pierre Martin",
    role: "CEO",
    entreprise: "StartupXYZ",
    statut: "acceptee",
    dateInvitation: "2024-01-18",
    dateAcceptation: "2024-01-19",
    permissions: ["Administrateur complet"],
    message:
      "Pierre, nous aimerions vous inviter à collaborer sur nos projets de recrutement.",
    invitePar: "Sophie Laurent",
  },
  {
    id: 3,
    type: "collaborateur",
    email: "laura.moreau@creative.com",
    nom: "Laura Moreau",
    role: "Designer",
    entreprise: "CreativeStudio",
    statut: "refusee",
    dateInvitation: "2024-01-15",
    dateRefus: "2024-01-16",
    permissions: ["Voir les candidatures"],
    message:
      "Laura, nous cherchons quelqu'un pour nous aider à évaluer les candidats créatifs.",
    invitePar: "Thomas Bernard",
  },
  {
    id: 4,
    type: "collaborateur",
    email: "nicolas.petit@datacorp.com",
    nom: "Nicolas Petit",
    role: "CTO",
    entreprise: "DataCorp",
    statut: "expiree",
    dateInvitation: "2024-01-10",
    dateExpiration: "2024-01-17",
    permissions: ["Gérer les offres", "Accès aux statistiques"],
    message:
      "Nicolas, nous avons besoin de votre expertise technique pour nos recrutements IT.",
    invitePar: "Julie Moreau",
  },
  {
    id: 5,
    type: "partenaire",
    email: "contact@recrutement-pro.fr",
    nom: "Recrutement Pro",
    role: "Cabinet de recrutement",
    entreprise: "Recrutement Pro",
    statut: "en-attente",
    dateInvitation: "2024-01-22",
    dateExpiration: "2024-01-29",
    permissions: [
      "Accès partenaire",
      "Voir les offres",
      "Proposer des candidats",
    ],
    message:
      "Nous souhaitons établir un partenariat pour mutualiser nos offres d'emploi.",
    invitePar: "Alexandre Lefebvre",
  },
];

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState(mockInvitations);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    nom: "",
    role: "",
    entreprise: "",
    message: "",
    permissions: [] as string[],
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "en-attente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
        );
      case "acceptee":
        return <Badge className="bg-green-100 text-green-800">Acceptée</Badge>;
      case "refusee":
        return <Badge className="bg-red-100 text-red-800">Refusée</Badge>;
      case "expiree":
        return <Badge className="bg-gray-100 text-gray-800">Expirée</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      invitation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.entreprise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut =
      filterStatut === "all" || invitation.statut === filterStatut;
    const matchesType = filterType === "all" || invitation.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const handleAcceptInvitation = (id: number) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              statut: "acceptee",
              dateAcceptation: new Date().toISOString().split("T")[0],
            }
          : inv
      )
    );
  };

  const handleRejectInvitation = (id: number) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              statut: "refusee",
              dateRefus: new Date().toISOString().split("T")[0],
            }
          : inv
      )
    );
  };

  const handleDeleteInvitation = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette invitation ?")) {
      setInvitations(invitations.filter((inv) => inv.id !== id));
    }
  };

  const handleResendInvitation = (id: number) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              statut: "en-attente",
              dateInvitation: new Date().toISOString().split("T")[0],
            }
          : inv
      )
    );
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvitation = {
      id: Math.max(...invitations.map((inv) => inv.id)) + 1,
      type: "collaborateur",
      email: inviteForm.email,
      nom: inviteForm.nom,
      role: inviteForm.role,
      entreprise: inviteForm.entreprise,
      statut: "en-attente",
      dateInvitation: new Date().toISOString().split("T")[0],
      dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      permissions: inviteForm.permissions,
      message: inviteForm.message,
      invitePar: "Vous",
    };
    setInvitations([...invitations, newInvitation]);
    setInviteForm({
      email: "",
      nom: "",
      role: "",
      entreprise: "",
      message: "",
      permissions: [],
    });
    setShowInviteForm(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setInviteForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const availablePermissions = [
    "Voir les candidatures",
    "Gérer les offres",
    "Accès aux statistiques",
    "Administrateur complet",
    "Accès partenaire",
    "Proposer des candidats",
  ];

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
                          {invitations.length}
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
                            invitations.filter(
                              (inv) => inv.statut === "en-attente"
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
                          {
                            invitations.filter(
                              (inv) => inv.statut === "acceptee"
                            ).length
                          }
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
                            invitations.filter(
                              (inv) => inv.type === "collaborateur"
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
                      <Button variant="outline" size="icon">
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
                          <SelectItem value="refusee">Refusées</SelectItem>
                          <SelectItem value="expiree">Expirées</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les types</SelectItem>
                          <SelectItem value="collaborateur">
                            Collaborateurs
                          </SelectItem>
                          <SelectItem value="partenaire">
                            Partenaires
                          </SelectItem>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email *</label>
                          <Input
                            type="email"
                            placeholder="collaborateur@entreprise.com"
                            value={inviteForm.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Nom complet *
                          </label>
                          <Input
                            placeholder="Prénom Nom"
                            value={inviteForm.nom}
                            onChange={(e) =>
                              handleInputChange("nom", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rôle *</label>
                          <Input
                            placeholder="Responsable RH, CEO, etc."
                            value={inviteForm.role}
                            onChange={(e) =>
                              handleInputChange("role", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Entreprise *
                          </label>
                          <Input
                            placeholder="Nom de l'entreprise"
                            value={inviteForm.entreprise}
                            onChange={(e) =>
                              handleInputChange("entreprise", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Permissions
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availablePermissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={inviteForm.permissions.includes(
                                  permission
                                )}
                                onChange={() =>
                                  handlePermissionToggle(permission)
                                }
                                className="rounded"
                              />
                              <span className="text-sm">{permission}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Message personnalisé
                        </label>
                        <Input
                          placeholder="Message d'invitation personnalisé..."
                          value={inviteForm.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          <IconSend className="h-4 w-4" />
                          Envoyer l'invitation
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowInviteForm(false)}
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
                {filteredInvitations.length === 0 ? (
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
                  filteredInvitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={`/avatars/${invitation.nom
                                  .toLowerCase()
                                  .replace(" ", "-")}.jpg`}
                              />
                              <AvatarFallback>
                                {getInitials(invitation.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {invitation.nom}
                                </h3>
                                {getStatutBadge(invitation.statut)}
                                <Badge variant="outline">
                                  {invitation.type === "collaborateur"
                                    ? "Collaborateur"
                                    : "Partenaire"}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <IconMail className="h-4 w-4" />
                                    {invitation.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconBuilding className="h-4 w-4" />
                                    {invitation.entreprise}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span>{invitation.role}</span>
                                  <span className="flex items-center gap-1">
                                    <IconCalendar className="h-4 w-4" />
                                    Invité le {invitation.dateInvitation}
                                  </span>
                                </div>
                                {invitation.message && (
                                  <p className="mt-2 italic">
                                    "{invitation.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {invitation.statut === "en-attente" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptInvitation(invitation.id)
                                  }
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <IconCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleRejectInvitation(invitation.id)
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <IconX className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {invitation.statut === "expiree" && (
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
                          {/* Permissions */}
                          <div>
                            <h4 className="font-medium mb-2">
                              Permissions accordées
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {invitation.permissions.map(
                                (permission, index) => (
                                  <Badge key={index} variant="secondary">
                                    {permission}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          {/* Informations supplémentaires */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Invité par:
                              </span>
                              <span className="ml-2 font-medium">
                                {invitation.invitePar}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Expire le:
                              </span>
                              <span className="ml-2 font-medium">
                                {invitation.dateExpiration}
                              </span>
                            </div>
                            {invitation.dateAcceptation && (
                              <div>
                                <span className="text-muted-foreground">
                                  Accepté le:
                                </span>
                                <span className="ml-2 font-medium">
                                  {invitation.dateAcceptation}
                                </span>
                              </div>
                            )}
                            {invitation.dateRefus && (
                              <div>
                                <span className="text-muted-foreground">
                                  Refusé le:
                                </span>
                                <span className="ml-2 font-medium">
                                  {invitation.dateRefus}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
