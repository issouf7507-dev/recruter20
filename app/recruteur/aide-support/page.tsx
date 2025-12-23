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
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/site-header";
import {
  IconHelp,
  IconSearch,
  IconMail,
  IconPhone,
  IconMessage,
  IconBook,
  IconVideo,
  IconDownload,
  IconChevronDown,
  IconChevronRight,
  IconStar,
  IconClock,
  IconUser,
  IconQuestionMark,
  IconBulb,
  IconSettings,
} from "@tabler/icons-react";

// Données mockées pour les FAQ
const faqData = [
  {
    id: 1,
    question: "Comment créer ma première offre d'emploi ?",
    answer:
      "Pour créer une offre d'emploi, rendez-vous dans la section 'Offres d'emploi' > 'Créer une offre'. Remplissez tous les champs obligatoires (titre, entreprise, type de contrat, lieu, description) et cliquez sur 'Publier l'offre'.",
    category: "Offres d'emploi",
    popular: true,
  },
  {
    id: 2,
    question: "Comment gérer les candidatures reçues ?",
    answer:
      "Dans la section 'Candidatures' > 'Candidatures reçues', vous pouvez voir toutes les candidatures, changer leur statut (nouvelle, en cours, acceptée, refusée), noter les candidats et les contacter directement.",
    category: "Candidatures",
    popular: true,
  },
  {
    id: 3,
    question: "Comment rechercher des candidats ?",
    answer:
      "Utilisez la fonction 'Recherche de candidats' pour filtrer par compétences, lieu, expérience et disponibilité. Vous pouvez aussi rechercher des CV spécifiques dans la section 'Recherche de CV'.",
    category: "Recherche",
    popular: false,
  },
  {
    id: 4,
    question: "Comment ajouter un candidat à mes favoris ?",
    answer:
      "Dans la recherche de candidats ou la liste des candidatures, cliquez sur l'icône cœur à côté du nom du candidat. Les candidats favoris apparaîtront dans la section 'Candidats favoris'.",
    category: "Candidats",
    popular: false,
  },
  {
    id: 5,
    question: "Comment consulter mes statistiques ?",
    answer:
      "La section 'Statistiques et rapports' vous donne accès à toutes vos métriques : nombre d'offres, candidatures, taux de conversion, et analyses détaillées par période.",
    category: "Statistiques",
    popular: false,
  },
  {
    id: 6,
    question: "Comment contacter le support technique ?",
    answer:
      "Vous pouvez nous contacter par email à support@recruteur20.com, par téléphone au +33 1 23 45 67 89, ou utiliser le formulaire de contact ci-dessous. Nous répondons sous 24h.",
    category: "Support",
    popular: true,
  },
];

// Données mockées pour les ressources
const ressourcesData = [
  {
    id: 1,
    titre: "Guide de création d'offres efficaces",
    description:
      "Apprenez à rédiger des offres d'emploi attractives qui génèrent plus de candidatures.",
    type: "PDF",
    taille: "2.3 MB",
    downloads: 1247,
    icon: IconBook,
  },
  {
    id: 2,
    titre: "Webinaire : Optimiser son processus de recrutement",
    description:
      "Découvrez les meilleures pratiques pour améliorer votre taux de conversion.",
    type: "Vidéo",
    duree: "45 min",
    vues: 892,
    icon: IconVideo,
  },
  {
    id: 3,
    titre: "Template de lettre de motivation",
    description:
      "Modèle professionnel pour vos communications avec les candidats.",
    type: "DOCX",
    taille: "156 KB",
    downloads: 567,
    icon: IconDownload,
  },
  {
    id: 4,
    titre: "Checklist de recrutement",
    description:
      "Liste de contrôle pour ne rien oublier lors de vos processus de recrutement.",
    type: "PDF",
    taille: "890 KB",
    downloads: 423,
    icon: IconBook,
  },
];

export default function AideSupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });

  const categories = [
    "all",
    "Offres d'emploi",
    "Candidatures",
    "Recherche",
    "Candidats",
    "Statistiques",
    "Support",
  ];

  const filteredFAQ = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQToggle = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulaire de contact soumis:", contactForm);
    // Ici vous pouvez ajouter la logique pour envoyer le message
    alert("Votre message a été envoyé ! Nous vous répondrons sous 24h.");
    setContactForm({ nom: "", email: "", sujet: "", message: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <SiteHeader title="Aide et support" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconHelp className="h-6 w-6" />
                  Aide et support
                </h1>
                <p className="text-muted-foreground mt-2">
                  Trouvez des réponses à vos questions et accédez à nos
                  ressources
                </p>
              </div>

              {/* Barre de recherche */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher dans l'aide..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === "all"
                              ? "Toutes les catégories"
                              : category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact rapide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <IconMail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      support@recruteur20.com
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="mailto:support@recruteur20.com">
                        Envoyer un email
                      </a>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <IconPhone className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      +33 1 23 45 67 89
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="tel:+33123456789">Appeler</a>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <IconMessage className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Chat en direct</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Disponible 9h-18h
                    </p>
                    <Button variant="outline" size="sm">
                      Ouvrir le chat
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconQuestionMark className="h-5 w-5" />
                    Questions fréquemment posées
                  </CardTitle>
                  <CardDescription>
                    Trouvez rapidement des réponses aux questions les plus
                    courantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFAQ.length === 0 ? (
                      <div className="text-center py-8">
                        <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Aucune question trouvée
                        </h3>
                        <p className="text-muted-foreground">
                          Essayez de modifier vos critères de recherche.
                        </p>
                      </div>
                    ) : (
                      filteredFAQ.map((faq) => (
                        <div key={faq.id} className="border rounded-lg">
                          <button
                            onClick={() => handleFAQToggle(faq.id)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-medium">{faq.question}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {faq.category}
                                  </Badge>
                                  {faq.popular && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                      <IconStar className="h-3 w-3 mr-1" />
                                      Populaire
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {expandedFAQ === faq.id ? (
                              <IconChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <IconChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                          {expandedFAQ === faq.id && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                              <p className="text-sm text-muted-foreground mt-3">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ressources */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBook className="h-5 w-5" />
                    Ressources et guides
                  </CardTitle>
                  <CardDescription>
                    Téléchargez nos guides et ressources pour optimiser votre
                    recrutement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ressourcesData.map((ressource) => (
                      <div
                        key={ressource.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <ressource.icon className="h-8 w-8 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {ressource.titre}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {ressource.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <IconDownload className="h-3 w-3" />
                                  {ressource.type}
                                </span>
                                {ressource.taille && (
                                  <span>{ressource.taille}</span>
                                )}
                                {ressource.duree && (
                                  <span className="flex items-center gap-1">
                                    <IconClock className="h-3 w-3" />
                                    {ressource.duree}
                                  </span>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                <IconDownload className="h-4 w-4" />
                                Télécharger
                              </Button>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {ressource.downloads &&
                                `${ressource.downloads} téléchargements`}
                              {ressource.vues && `${ressource.vues} vues`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Formulaire de contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconMail className="h-5 w-5" />
                    Nous contacter
                  </CardTitle>
                  <CardDescription>
                    Vous ne trouvez pas la réponse à votre question ?
                    Envoyez-nous un message
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nom complet *
                        </label>
                        <Input
                          placeholder="Votre nom"
                          value={contactForm.nom}
                          onChange={(e) =>
                            handleInputChange("nom", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          value={contactForm.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sujet *</label>
                      <Input
                        placeholder="Résumé de votre question"
                        value={contactForm.sujet}
                        onChange={(e) =>
                          handleInputChange("sujet", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message *</label>
                      <Textarea
                        placeholder="Décrivez votre problème ou votre question en détail..."
                        className="min-h-[120px]"
                        value={contactForm.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconClock className="h-4 w-4" />
                      <span>Nous répondons généralement sous 24h</span>
                    </div>
                    <Button type="submit" className="w-full md:w-auto">
                      <IconMail className="h-4 w-4" />
                      Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
