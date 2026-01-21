"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSparkles,
  IconBriefcase,
  IconMapPin,
  IconUser,
  IconChevronRight,
  IconTrophy,
  IconTarget,
  IconBolt,
  IconCheck,
  IconX,
  IconExternalLink,
  IconMail,
  IconBrandLinkedin,
  IconRefresh,
  IconFilter,
  IconChartBar,
} from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId } from "@/lib/hooks/use-recruteurs";
import { useOffers } from "@/lib/hooks/use-offers";
import { getMatchLevel } from "@/lib/matching/scoring";
import Link from "next/link";

interface MatchResult {
  candidat: {
    id: string;
    nom: string | null;
    prenom: string | null;
    image: string | null;
    ville: string | null;
    pays: string;
    domaine: string | null;
    statut: string | null;
    bio: string | null;
    linkedinUrl: string | null;
    user: {
      email: string;
      name: string | null;
    };
  };
  score: number;
  scoreDetails: {
    competences: number;
    localisation: number;
    experience: number;
    domaine: number;
    disponibilite: number;
    formations: number;
  };
  matchedCompetences: string[];
  missingCompetences: string[];
  highlights: string[];
}

interface OfferMatch {
  offre: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    type: string | null;
    applicationsCount: number;
  };
  topMatches: MatchResult[];
  averageScore: number;
}

function ScoreCircle({
  score,
  size = "lg",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-24 h-24 text-xl",
  };

  const strokeWidth = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
    >
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={
            score >= 70
              ? "text-green-500"
              : score >= 50
              ? "text-blue-500"
              : "text-orange-500"
          }
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="font-bold z-10">{score}%</span>
    </div>
  );
}

function CandidatMatchCard({
  match,
  rank,
}: {
  match: MatchResult;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { label, color, bgColor } = getMatchLevel(match.score);

  const getInitials = (nom: string | null, prenom: string | null) => {
    return `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase() || "?";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card
        className={`overflow-hidden hover:shadow-lg transition-all ${
          rank === 0 ? "ring-2 ring-yellow-400" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Rang */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${
                rank === 0
                  ? "bg-yellow-100 text-yellow-700"
                  : rank === 1
                  ? "bg-gray-100 text-gray-700"
                  : rank === 2
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              {rank + 1}
            </div>

            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={match.candidat.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(match.candidat.nom, match.candidat.prenom)}
              </AvatarFallback>
            </Avatar>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold  truncate">
                  {match.candidat.prenom} {match.candidat.nom}
                </h4>
                <Badge className={`${bgColor} ${color} text-xs`}>{label}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm  mb-2">
                {match.candidat.domaine && (
                  <span className="flex items-center gap-1">
                    <IconBriefcase className="h-3.5 w-3.5" />
                    {match.candidat.domaine}
                  </span>
                )}
                {(match.candidat.ville || match.candidat.pays) && (
                  <span className="flex items-center gap-1">
                    <IconMapPin className="h-3.5 w-3.5" />
                    {match.candidat.ville || match.candidat.pays}
                  </span>
                )}
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {match.highlights.slice(0, 3).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                  >
                    <IconCheck className="h-3 w-3" />
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Compétences correspondantes */}
              {match.matchedCompetences.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {match.matchedCompetences.slice(0, 4).map((comp, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {comp}
                    </Badge>
                  ))}
                  {match.matchedCompetences.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.matchedCompetences.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Score */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <ScoreCircle score={match.score} size="md" />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Moins" : "Détails"}
              </Button>
            </div>
          </div>

          {/* Détails expandés */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium mb-3">Détail du score</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(match.scoreDetails).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 capitalize">
                            {key}
                          </span>
                          <span className="font-medium">{value}%</span>
                        </div>
                        <Progress value={value} className="h-1.5" />
                      </div>
                    ))}
                  </div>

                  {/* Compétences manquantes */}
                  {match.missingCompetences.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500">
                        Compétences manquantes:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.missingCompetences.map((comp, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full capitalize"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <IconMail className="h-4 w-4 mr-1" />
                      Contacter
                    </Button>
                    {match.candidat.linkedinUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={match.candidat.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconBrandLinkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/recruteur/candidatures?candidatId=${match.candidat.id}`}
                      >
                        <IconExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OfferMatchSection({ offerMatch }: { offerMatch: OfferMatch }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4  rounded-xl border hover:shadow-md transition-all mb-3"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconBriefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold ">{offerMatch.offre.title}</h3>
            <div className="flex items-center gap-3 text-sm ">
              {offerMatch.offre.company && (
                <span>{offerMatch.offre.company}</span>
              )}
              {offerMatch.offre.location && (
                <span className="flex items-center gap-1">
                  <IconMapPin className="h-3.5 w-3.5" />
                  {offerMatch.offre.location}
                </span>
              )}
              <span>{offerMatch.offre.applicationsCount} candidature(s)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {offerMatch.topMatches.length}
            </div>
            <div className="text-xs ">match(s)</div>
          </div>
          {offerMatch.averageScore > 0 && (
            <div className="text-right hidden sm:block">
              <div className="text-lg font-semibold ">
                {offerMatch.averageScore}%
              </div>
              <div className="text-xs ">score moyen</div>
            </div>
          )}
          <IconChevronRight
            className={`h-5 w-5 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pl-4">
              {offerMatch.topMatches.length > 0 ? (
                offerMatch.topMatches.map((match, idx) => (
                  <CandidatMatchCard
                    key={match.candidat.id}
                    match={match}
                    rank={idx}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center ">
                    <IconTarget className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun candidat correspondant trouvé pour cette offre.</p>
                    <p className="text-sm mt-1">
                      Essayez de réduire le score minimum.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchingPage() {
  const [selectedOfferId, setSelectedOfferId] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(10);

  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);

  const { data: offersData } = useOffers({
    recruteurId: recruteur?.id,
    etat: "active",
  });

  // Fetch matching data
  const {
    data: matchingData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["matching", recruteur?.id, minScore],
    queryFn: async () => {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minScore, limitPerOffer: 10 }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data as {
        results: OfferMatch[];
        totalOffers: number;
        totalCandidats: number;
      };
    },
    enabled: !!recruteur?.id,
  });

<<<<<<< HEAD
  // console.log("matchingData", matchingData);
=======
  console.log("matchingData", matchingData);
>>>>>>> 2c4d271fc97d9e15104d3e0711f18296d2c327c2

  // Filtrer les résultats par offre sélectionnée
  const filteredResults = matchingData?.results.filter(
    (r) => selectedOfferId === "all" || r.offre.id === selectedOfferId
  );

  // Statistiques globales
  const stats = {
    totalMatches:
      matchingData?.results.reduce((sum, r) => sum + r.topMatches.length, 0) ||
      0,
    avgScore: matchingData?.results.length
      ? Math.round(
          matchingData.results.reduce((sum, r) => sum + r.averageScore, 0) /
            matchingData.results.filter((r) => r.averageScore > 0).length
        ) || 0
      : 0,
    topScore: Math.max(
      ...(matchingData?.results.flatMap((r) =>
        r.topMatches.map((m) => m.score)
      ) || [0])
    ),
  };

  return (
    <>
      <SiteHeader title="Matching IA" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <IconSparkles className="h-8 w-8 " />
                    Matching Intelligent
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Trouvez les meilleurs candidats pour vos offres grâce à
                    notre algorithme de scoring
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2"
                >
                  <IconRefresh
                    className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                  Actualiser
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconBriefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {matchingData?.totalOffers || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Offres actives
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconUser className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {matchingData?.totalCandidats || 0}
                      </div>
                      <div className="text-xs text-gray-500">Candidats</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconTarget className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {stats.totalMatches}
                      </div>
                      <div className="text-xs text-gray-500">
                        Matchs trouvés
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <IconTrophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {stats.topScore}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Meilleur score
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-4 p-4  rounded-xl border">
                <div className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Filtres:</span>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select
                      value={selectedOfferId}
                      onValueChange={setSelectedOfferId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les offres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les offres</SelectItem>
                        {offersData?.items?.map((offre) => (
                          <SelectItem key={offre.id} value={offre.id}>
                            {offre.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select
                      value={minScore.toString()}
                      onValueChange={(v) => setMinScore(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Score min: 10%</SelectItem>
                        <SelectItem value="20">Score min: 20%</SelectItem>
                        <SelectItem value="30">Score min: 30%</SelectItem>
                        <SelectItem value="40">Score min: 40%</SelectItem>
                        <SelectItem value="50">Score min: 50%</SelectItem>
                        <SelectItem value="60">Score min: 60%</SelectItem>
                        <SelectItem value="70">Score min: 70%</SelectItem>
                        <SelectItem value="80">Score min: 80%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                  <IconSparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="mt-4 text-gray-500">
                  Analyse des profils en cours...
                </p>
                <p className="text-sm text-gray-400">
                  Notre IA calcule les meilleurs matchs
                </p>
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <div>
                {filteredResults.map((offerMatch) => (
                  <OfferMatchSection
                    key={offerMatch.offre.id}
                    offerMatch={offerMatch}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <IconChartBar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun match trouvé
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {matchingData?.totalOffers === 0
                      ? "Vous n'avez pas encore d'offres actives. Créez une offre pour commencer le matching."
                      : "Aucun candidat ne correspond à vos critères. Essayez de réduire le score minimum."}
                  </p>
                  {matchingData?.totalOffers === 0 && (
                    <Button className="mt-4" asChild>
                      <Link href="/recruteur/offres/nouvelle">
                        Créer une offre
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Légende */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconChartBar className="h-5 w-5" />
                  Comment fonctionne le scoring ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconBolt className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Compétences (40%)
                      </div>
                      <p className="text-xs text-gray-500">
                        Correspondance entre les compétences du candidat et
                        celles requises
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconMapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Localisation (20%)
                      </div>
                      <p className="text-xs text-gray-500">
                        Proximité géographique avec le lieu de travail
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="p-1.5 bg-primary/10rounded">
                      <IconBriefcase className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Expérience (20%)
                      </div>
                      <p className="text-xs text-gray-500">
                        Années d'expérience vs exigences du poste
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconTarget className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Domaine (10%)</div>
                      <p className="text-xs text-gray-500">
                        Adéquation du secteur d'activité
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconUser className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Disponibilité (5%)
                      </div>
                      <p className="text-xs text-gray-500">
                        Statut et disponibilité du candidat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3  rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <IconTrophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Formations (5%)</div>
                      <p className="text-xs text-gray-500">
                        Diplômes et certifications pertinents
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
