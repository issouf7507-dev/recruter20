"use client";
import {
  Search,
  MapPin,
  Filter,

} from "lucide-react";

import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useOffers } from "@/lib/hooks/use-offers";
import { Card, CardContent } from "@/components/ui/card";
import { OffreCard } from "@/components/public/OffreCard";

import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Options de filtres basées sur le schéma JobOffer
const contractTypes = [
  { label: "CDI", value: "cdi" },
  { label: "CDD", value: "cdd" },
  { label: "Stage", value: "stage" },
  { label: "Freelance", value: "freelance" },
  { label: "Temps partiel", value: "temps-partiel" },
];

const currencies = [
  { label: "XOF (FCFA)", value: "XOF" },
  { label: "EUR (€)", value: "EUR" },
  { label: "USD ($)", value: "USD" },
];

const experienceLevels = [
  { label: "Débutant (0-2 ans)", value: "0-2" },
  { label: "Junior (2-4 ans)", value: "2-4" },
  { label: "Confirmé (4-6 ans)", value: "4-6" },
  { label: "Senior (6-10 ans)", value: "6-10" },
  { label: "Expert (10+ ans)", value: "10+" },
];

export default function OffresPage() {
  // Récupérer les vraies offres depuis l'API

  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    setSubmittedSearch(searchQuery);
    setCurrentPage(1);
  };
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>(
    []
  );
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("Toutes");
  const [datePosted, setDatePosted] = useState<string>("N'importe quand");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Convertir les filtres UI en paramètres API
  const filterParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Recherche textuelle
    if (submittedSearch) {
      params.search = submittedSearch;
    }

    // Types de contrat (utilise les valeurs du schéma: cdi, cdd, stage, freelance, temps-partiel)
    if (selectedContractTypes.length > 0) {
      params.types = selectedContractTypes;
    }

    // Salaire min/max
    if (salaryMin) {
      params.salaryMin = parseFloat(salaryMin);
    }
    if (salaryMax) {
      params.salaryMax = parseFloat(salaryMax);
    }

    // Devise (XOF, EUR, USD)
    if (selectedCurrency && selectedCurrency !== "Toutes") {
      params.salaryCurrency = selectedCurrency;
    }

    // Expérience
    if (selectedExperience) {
      const [minExp, maxExp] = selectedExperience.split("-");
      if (minExp)
        params.experienceMin = minExp === "10+" ? 10 : parseInt(minExp);
      if (maxExp && maxExp !== "+") params.experienceMax = parseInt(maxExp);
    }

    // Date de publication
    if (datePosted !== "N'importe quand") {
      params.datePosted = datePosted;
    }

    return params;
  }, [
    currentPage,
    itemsPerPage,
    submittedSearch,
    selectedContractTypes,
    salaryMin,
    salaryMax,
    selectedCurrency,
    selectedExperience,
    datePosted,
  ]);

  const { data: offersData, isLoading: isLoadingOffers } =
    useOffers(filterParams);

  // console.log("offersData", offersData);

  const pagination = offersData?.pagination;

  // Transformer les vraies offres pour correspondre au format attendu
  const jobOffers = useMemo(() => {
    if (!offersData?.items) return [];

    return offersData.items
      .filter((offer) => offer.etat === "active")
      .map((offer) => {
        // Format date relative
        const createdAt = new Date(offer.createdAt);
        const now = new Date();
        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        let postedAt = "";
        if (diffInHours < 1) {
          postedAt = "Publié il y a 5 min";
        } else if (diffInHours < 24) {
          postedAt = `Publié il y a ${diffInHours}h`;
        } else if (diffInDays === 1) {
          postedAt = "Publié il y a 1 jour";
        } else if (diffInDays < 7) {
          postedAt = `Publié il y a ${diffInDays} jours`;
        } else if (diffInDays < 14) {
          postedAt = "Publié il y a 1 semaine";
        } else {
          postedAt = `Publié il y a ${Math.floor(diffInDays / 7)} semaines`;
        }

        // Format date limite
        let dueDateFormatted = "";
        let isDueDateSoon = false;
        let isDueDateExpired = false;

        if (offer.duedate) {
          const dueDate = new Date(offer.duedate);
          const now = new Date();
          const diffInMs = dueDate.getTime() - now.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

          isDueDateExpired = diffInMs < 0;
          isDueDateSoon = diffInDays >= 0 && diffInDays <= 7;

          if (isDueDateExpired) {
            dueDateFormatted = "Expiré";
          } else if (diffInDays === 0) {
            dueDateFormatted = "Aujourd'hui";
          } else if (diffInDays === 1) {
            dueDateFormatted = "Demain";
          } else if (diffInDays < 7) {
            dueDateFormatted = `Dans ${diffInDays} jours`;
          } else {
            dueDateFormatted = dueDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        }

        return {
          id: offer.id,
          title: offer.title,
          company: offer.company || "Entreprise",
          location: offer.location || "Non spécifié",
          type: offer.type?.toUpperCase() || "CDI",
          salary:
            offer.salaryMin && offer.salaryMax
              ? `${offer.salaryMin.toLocaleString()}-${offer.salaryMax.toLocaleString()}`
              : offer.salaryMin
                ? `${offer.salaryMin.toLocaleString()}+`
                : "",
          experience: "Non spécifié",
          remote: offer.location ? "Sur site" : "Télétravail",
          logo: offer.logo || null,
          tags: [],
          postedAt,
          description: offer.description || "",
          urgent: false,
          rating: 4.5,
          salaryCurrency: offer.salaryCurrency || "",
          duedate: offer.duedate,
          dueDateFormatted,
          isDueDateSoon,
          isDueDateExpired,
        };
      });
  }, [offersData]);

  const toggleFilter = (
    filterArray: string[],
    setFilter: any,
    value: string
  ) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter((item) => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedContractTypes([]);
    setSelectedExperience("");
    setSalaryMin("");
    setSalaryMax("");
    setSelectedCurrency("Toutes");
    setDatePosted("N'importe quand");
    setSearchQuery("");
    setSubmittedSearch("");
  };

  const hasActiveFilters =
    selectedContractTypes.length > 0 ||
    selectedExperience !== "" ||
    salaryMin !== "" ||
    salaryMax !== "" ||
    selectedCurrency !== "Toutes" ||
    datePosted !== "N'importe quand" ||
    submittedSearch !== "";

  const toggleSavedJob = (jobId: number) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [
    submittedSearch,
    selectedContractTypes,
    salaryMin,
    salaryMax,
    selectedCurrency,
    selectedExperience,
    datePosted,
  ]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleLastPage = useCallback(() => {
    setCurrentPage(pagination?.totalPages || 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, pagination?.totalPages]);

  // État de chargement initial
  if (isLoadingOffers) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-[#a590ff] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base md:text-lg">
            Chargement des offres...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center bg-no-repeat py-8 sm:py-12 md:py-20 lg:py-32"
        style={{
          backgroundImage: "url('/img/banniereweb_.png')",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-gray-900">
              Trouvez votre emploi idéal
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-black mb-6 md:mb-8 max-w-3xl mx-auto px-2">
              Vous cherchez un emploi ? Parcourez nos dernières offres d'emploi
              pour voir et postuler aux meilleurs emplois d'aujourd'hui !
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl md:rounded-full shadow-lg border border-gray-200 p-3 sm:p-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-2">
                <div className="flex-1 flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Rechercher un poste ou mot-clé"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base min-w-0"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-[#a590ff] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors cursor-pointer text-sm sm:text-base hover:bg-[#9580ef]"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`${showFilters ? "block" : "hidden"
              } lg:block w-full lg:w-72 xl:w-80 bg-white rounded-xl p-4 sm:p-6 h-fit lg:sticky lg:top-24 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filtres</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-green-600 hover:underline"
                >
                  Tout effacer
                </button>
              )}
            </div>

            {/* Date Posted */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                Date de publication
              </h3>
              <select
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="N'importe quand">N'importe quand</option>
                <option value="Aujourd'hui">Aujourd'hui</option>
                <option value="3 jours">3 jours</option>
                <option value="1 semaine">1 semaine</option>
                <option value="1 mois">1 mois</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                Type de contrat
              </h3>
              <div className="space-y-2">
                {contractTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContractTypes.includes(type.value)}
                      onChange={() =>
                        toggleFilter(
                          selectedContractTypes,
                          setSelectedContractTypes,
                          type.value
                        )
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Range Salary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                Fourchette de salaire
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="text-gray-500">à</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Devise</h3>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Toutes">Toutes les devises</option>
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                Années d'expérience
              </h3>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={selectedExperience === level.value}
                      onChange={() => setSelectedExperience(level.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700">{level.label}</span>
                  </label>
                ))}
                {selectedExperience && (
                  <button
                    onClick={() => setSelectedExperience("")}
                    className="text-sm text-green-600 hover:underline mt-2"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Job List */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 w-full bg-white rounded-lg shadow-sm px-4 py-3 font-semibold border border-gray-100"
              >
                <Filter className="w-5 h-5 text-[#a590ff]" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="bg-[#a590ff] text-white text-xs px-2 py-1 rounded-full ml-auto">
                    Actifs
                  </span>
                )}
              </button>
            </div>

            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <p className="text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-gray-900">
                  {pagination?.total || 0}
                </span>{" "}
                résultats
              </p>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {!jobOffers || jobOffers.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-white rounded-xl p-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-base sm:text-lg font-medium">
                    Aucune offre trouvée
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-sm mx-auto">
                    Essayez de modifier vos critères de recherche ou d'élargir
                    votre zone géographique
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 text-[#a590ff] hover:underline text-sm font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {jobOffers.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.04 }}
                    >
                      <OffreCard offre={job} index={index} />
                    </motion.div>
                  ))}

                  <div>
                    {pagination && pagination.totalPages > 1 && (
                      <Card className="shadow-none mt-4">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                          {/* Mobile pagination */}
                          <div className="flex flex-col gap-4 sm:hidden">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Page {pagination.page} / {pagination.totalPages}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-1">
                                  Afficher
                                </span>
                                <Select
                                  value={itemsPerPage.toString()}
                                  onValueChange={(value) => {
                                    setItemsPerPage(parseInt(value));
                                    setCurrentPage(1);
                                  }}
                                >
                                  <SelectTrigger className="w-[60px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="flex-1"
                              >
                                <IconChevronLeft className="h-4 w-4 mr-1" />
                                Préc.
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium bg-[#a590ff] text-white rounded">
                                {pagination.page}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={
                                  currentPage === pagination.totalPages ||
                                  !pagination.totalPages
                                }
                                className="flex-1"
                              >
                                Suiv.
                                <IconChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>

                          {/* Desktop pagination */}
                          <div className="hidden sm:flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Afficher
                              </span>
                              <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                  setItemsPerPage(parseInt(value));
                                  setCurrentPage(1);
                                }}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">
                                par page
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              <span className="text-sm text-muted-foreground">
                                Page {pagination.page} sur{" "}
                                {pagination.totalPages}
                              </span>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleFirstPage}
                                  disabled={currentPage === 1}
                                  className="hidden md:flex"
                                >
                                  <IconChevronLeft className="h-4 w-4 mr-1" />
                                  Première
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handlePreviousPage}
                                  disabled={currentPage === 1}
                                >
                                  <IconChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="px-3 sm:px-4 py-2 text-sm font-medium bg-[#a590ff] text-white rounded">
                                  {pagination.page}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleNextPage}
                                  disabled={
                                    currentPage === pagination.totalPages ||
                                    !pagination.totalPages
                                  }
                                >
                                  <IconChevronRight className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLastPage}
                                  disabled={
                                    currentPage === pagination.totalPages ||
                                    !pagination.totalPages
                                  }
                                  className="hidden md:flex"
                                >
                                  Dernière
                                  <IconChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-10 sm:py-12 md:py-16 mt-10 sm:mt-16 md:mt-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 px-2">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto px-4">
              Créez une alerte emploi et recevez les nouvelles offres d'emploi
              par email
            </p>
            <button className="text-white bg-[#a590ff] hover:bg-[#9580ef] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-colors shadow-lg cursor-pointer">
              Créer une alerte emploi
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
