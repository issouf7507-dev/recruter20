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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBriefcase,
  IconMail,
  IconEye,
  IconCalendar,
  IconDownload,
  IconFilter,
  IconRefresh,
  IconMapPin,
  IconStar,
} from "@tabler/icons-react";

// Données mockées pour les statistiques
const mockStats = {
  periode: "2024",
  offres: {
    total: 24,
    actives: 18,
    expirees: 6,
    nouvelles: 3,
  },
  candidatures: {
    total: 156,
    nouvelles: 23,
    enCours: 45,
    acceptees: 12,
    refusees: 76,
  },
  candidats: {
    total: 89,
    nouveaux: 15,
    favoris: 8,
    contactes: 34,
  },
  performance: {
    tauxConversion: 7.7,
    tempsMoyenRecrutement: 21,
    satisfactionCandidats: 4.2,
    tauxReponse: 68.5,
  },
  evolution: {
    candidatures: [
      { mois: "Jan", valeur: 45 },
      { mois: "Fév", valeur: 52 },
      { mois: "Mar", valeur: 38 },
      { mois: "Avr", valeur: 61 },
      { mois: "Mai", valeur: 48 },
      { mois: "Juin", valeur: 55 },
    ],
    offres: [
      { mois: "Jan", valeur: 8 },
      { mois: "Fév", valeur: 12 },
      { mois: "Mar", valeur: 6 },
      { mois: "Avr", valeur: 15 },
      { mois: "Mai", valeur: 9 },
      { mois: "Juin", valeur: 11 },
    ],
  },
  topCompetences: [
    { nom: "React", candidats: 23, pourcentage: 25.8 },
    { nom: "JavaScript", candidats: 19, pourcentage: 21.3 },
    { nom: "Python", candidats: 15, pourcentage: 16.9 },
    { nom: "Node.js", candidats: 12, pourcentage: 13.5 },
    { nom: "TypeScript", candidats: 10, pourcentage: 11.2 },
  ],
  sourcesCandidatures: [
    { source: "Site web", candidatures: 45, pourcentage: 28.8 },
    { source: "LinkedIn", candidatures: 38, pourcentage: 24.4 },
    { source: "Indeed", candidatures: 28, pourcentage: 17.9 },
    { source: "Apec", candidatures: 22, pourcentage: 14.1 },
    { source: "Autres", candidatures: 23, pourcentage: 14.7 },
  ],
  lieux: [
    { lieu: "Paris", candidats: 45, pourcentage: 50.6 },
    { lieu: "Lyon", candidats: 18, pourcentage: 20.2 },
    { lieu: "Marseille", candidats: 12, pourcentage: 13.5 },
    { lieu: "Toulouse", candidats: 8, pourcentage: 9.0 },
    { lieu: "Autres", candidats: 6, pourcentage: 6.7 },
  ],
};

export default function StatistiquesRapportsPage() {
  const [periode, setPeriode] = useState("2024");
  const [vue, setVue] = useState("global");

  const generateRapport = () => {
    console.log("Génération du rapport pour la période:", periode);
    // Ici vous pouvez ajouter la logique pour générer un rapport PDF
  };

  const exportData = () => {
    console.log("Export des données pour la période:", periode);
    // Ici vous pouvez ajouter la logique pour exporter les données
  };

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
                  <IconChartBar className="h-6 w-6" />
                  Statistiques et rapports
                </h1>
                <p className="text-muted-foreground mt-2">
                  Analysez vos performances de recrutement et générez des
                  rapports détaillés
                </p>
              </div>

              {/* Contrôles */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Période</label>
                        <Select value={periode} onValueChange={setPeriode}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="custom">
                              Personnalisée
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Vue</label>
                        <Select value={vue} onValueChange={setVue}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Globale</SelectItem>
                            <SelectItem value="offres">Par offres</SelectItem>
                            <SelectItem value="candidats">
                              Par candidats
                            </SelectItem>
                            <SelectItem value="performance">
                              Performance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={generateRapport}>
                        <IconDownload className="h-4 w-4" />
                        Générer rapport
                      </Button>
                      <Button variant="outline" onClick={exportData}>
                        <IconDownload className="h-4 w-4" />
                        Exporter données
                      </Button>
                      <Button variant="outline" size="icon">
                        <IconRefresh className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Offres actives
                        </p>
                        <p className="text-2xl font-bold">
                          {mockStats.offres.actives}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mockStats.offres.total} au total
                        </p>
                      </div>
                      <IconBriefcase className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Candidatures
                        </p>
                        <p className="text-2xl font-bold">
                          {mockStats.candidatures.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mockStats.candidatures.nouvelles} nouvelles
                        </p>
                      </div>
                      <IconMail className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Taux de conversion
                        </p>
                        <p className="text-2xl font-bold">
                          {mockStats.performance.tauxConversion}%
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconTrendingUp className="h-3 w-3 text-green-500" />
                          +2.1% vs mois dernier
                        </p>
                      </div>
                      <IconTrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Temps moyen
                        </p>
                        <p className="text-2xl font-bold">
                          {mockStats.performance.tempsMoyenRecrutement}j
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconTrendingDown className="h-3 w-3 text-red-500" />
                          -3j vs mois dernier
                        </p>
                      </div>
                      <IconCalendar className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Évolution des candidatures */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconChartBar className="h-5 w-5" />
                      Évolution des candidatures
                    </CardTitle>
                    <CardDescription>
                      Nombre de candidatures reçues par mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockStats.evolution.candidatures.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">
                            {item.mois}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.valeur / 70) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {item.valeur}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top compétences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUsers className="h-5 w-5" />
                      Top compétences recherchées
                    </CardTitle>
                    <CardDescription>
                      Compétences les plus demandées par les candidats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockStats.topCompetences.map((competence, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{competence.nom}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {competence.candidats} candidats
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {competence.pourcentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analyses détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Sources de candidatures */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconEye className="h-5 w-5" />
                      Sources de candidatures
                    </CardTitle>
                    <CardDescription>
                      D'où viennent vos candidats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockStats.sourcesCandidatures.map((source, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{source.source}</span>
                            <span className="font-medium">
                              {source.candidatures}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${source.pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Répartition géographique */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMapPin className="h-5 w-5" />
                      Répartition géographique
                    </CardTitle>
                    <CardDescription>
                      Localisation des candidats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockStats.lieux.map((lieu, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{lieu.lieu}</span>
                            <span className="font-medium">
                              {lieu.candidats}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${lieu.pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Indicateurs de performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconTrendingUp className="h-5 w-5" />
                      Indicateurs clés
                    </CardTitle>
                    <CardDescription>Métriques de performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de réponse</span>
                        <span className="font-bold text-green-600">
                          {mockStats.performance.tauxReponse}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Satisfaction candidats</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">
                            {mockStats.performance.satisfactionCandidats}
                          </span>
                          <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Candidats favoris</span>
                        <span className="font-bold">
                          {mockStats.candidats.favoris}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Candidats contactés</span>
                        <span className="font-bold">
                          {mockStats.candidats.contactes}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Résumé et recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconChartBar className="h-5 w-5" />
                    Résumé et recommandations
                  </CardTitle>
                  <CardDescription>
                    Analyse de vos performances et suggestions d'amélioration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-600">
                        Points positifs
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Taux de conversion en hausse (+2.1%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Temps de recrutement réduit (-3 jours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>
                            Forte présence sur le site web (28.8% des
                            candidatures)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Satisfaction candidats élevée (4.2/5)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-600">
                        Axes d'amélioration
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Diversifier les sources de candidatures</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Améliorer le taux de réponse (actuellement 68.5%)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Étendre la recherche géographique</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Optimiser les offres pour les compétences React/JS
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
