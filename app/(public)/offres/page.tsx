"use client";
import { Search, MapPin, Filter, DollarSignIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { useOffers } from "@/lib/hooks/use-offers";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

// Tableau initial vide (sera remplacé par les vraies données)

const contractTypes = ["CDI", "CDD", "Stage", "Freelance", "Temps partiel"];
const remoteOptions = ["Sur site", "Hybride", "Télétravail"];

const salaryRanges = [
  "Moins de €1,000",
  "€1,000 à €2,500",
  "€2,500 à €5,000",
  "Personnalisé",
];
const jobFunctions = [
  "Relations Publiques",
  "Management",
  "Ingénierie",
  "Finance",
  "Marketing",
  "Design",
  "Ventes",
  "Opérations",
];
const currencies = ["EUR (€)", "USD ($)", "GBP (£)", "CHF (CHF)"];

export default function OffresPage() {
  // Récupérer les vraies offres depuis l'API

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>(
    []
  );
  const [selectedRemote, setSelectedRemote] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedSalaryRange, setSelectedSalaryRange] =
    useState<string>("Personnalisé");
  const [selectedJobFunctions, setSelectedJobFunctions] = useState<string[]>(
    []
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>("EUR (€)");
  const [datePosted, setDatePosted] = useState<string>("N'importe quand");
  const [displayedCount, setDisplayedCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: offersData, isLoading: isLoadingOffers } = useOffers({
    page: currentPage,
    limit: itemsPerPage,
    // recruteurId: recruteurId,
  });

  const pagination = offersData?.pagination;

  // Transformer les vraies offres pour correspondre au format attendu
  const jobOffers = useMemo(() => {
    if (!offersData?.items) return [];

    return offersData.items.map((offer) => {
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
        logo: "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
        tags: [],
        postedAt,
        description: offer.description || "",
        urgent: false,
        rating: 4.5,
        salaryCurrency: offer.salaryCurrency || "",
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
    setSelectedRemote([]);
    setSelectedExperience([]);
    setSelectedJobFunctions([]);
    setSelectedSalaryRange("Personnalisé");
    setSelectedCurrency("EUR (€)");
    setDatePosted("N'importe quand");
    setSearchQuery("");
    setLocationQuery("");
  };

  const hasActiveFilters =
    selectedContractTypes.length > 0 ||
    selectedRemote.length > 0 ||
    selectedExperience.length > 0 ||
    selectedJobFunctions.length > 0 ||
    selectedSalaryRange !== "Personnalisé" ||
    selectedCurrency !== "EUR (€)" ||
    datePosted !== "N'importe quand" ||
    searchQuery !== "" ||
    locationQuery !== "";

  const toggleSavedJob = (jobId: number) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  // Fonction pour charger plus d'offres
  const loadMoreJobs = () => {
    setIsLoading(true);
    // Simuler un délai de chargement (comme un appel API)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 3, filteredJobs.length));
      setIsLoading(false);
    }, 800);
  };

  // Filtrage des offres
  const filteredJobs = useMemo(() => {
    let filtered = jobOffers;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par localisation
    if (locationQuery) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    // Filtre par type de contrat
    if (selectedContractTypes.length > 0) {
      filtered = filtered.filter((job) =>
        selectedContractTypes.includes(job.type.toUpperCase())
      );
    }

    // Filtre par salaire
    if (selectedSalaryRange !== "Personnalisé") {
      filtered = filtered.filter((job) => {
        const salaryText = job.salary.replace(/€/g, "").replace(/,/g, "");
        const parts = salaryText.split("-");

        if (parts.length === 2) {
          const min = parseInt(parts[0]);
          const max = parseInt(parts[1]);

          switch (selectedSalaryRange) {
            case "Moins de €1,000":
              return max < 1000;
            case "€1,000 à €2,500":
              return min >= 1000 && max <= 2500;
            case "€2,500 à €5,000":
              return min >= 2500 && max <= 5000;
            default:
              return true;
          }
        }
        return true;
      });
    }

    // Filtre par date de publication
    if (datePosted !== "N'importe quand") {
      filtered = filtered.filter((job) => {
        const createdAt = new Date(job.id); // Utiliser l'ID pour simuler la date
        const now = new Date();
        const diffInDays = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (datePosted) {
          case "Aujourd'hui":
            return diffInDays === 0;
          case "3 jours":
            return diffInDays <= 3;
          case "1 semaine":
            return diffInDays <= 7;
          case "1 mois":
            return diffInDays <= 30;
          default:
            return true;
        }
      });
    }

    // Filtre par remote (basé sur le type d'offre)
    if (selectedRemote.length > 0) {
      filtered = filtered.filter((job) => selectedRemote.includes(job.remote));
    }

    return filtered;
  }, [
    jobOffers,
    searchQuery,
    locationQuery,
    selectedContractTypes,
    selectedRemote,
    selectedSalaryRange,
    selectedJobFunctions,
    selectedCurrency,
    datePosted,
  ]);

  // Offres à afficher
  const displayedJobs = filteredJobs.slice(0, displayedCount);
  const hasMoreJobs = displayedCount < filteredJobs.length;

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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a590ff] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center bg-no-repeat py-12 md:py-32 "
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Trouvez votre emploi idéal
            </h1>
            <p className="text-lg text-black mb-8 max-w-3xl mx-auto">
              Vous cherchez un emploi ? Parcourez nos dernières offres d'emploi
              pour voir et postuler aux meilleurs emplois d'aujourd'hui !
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-full shadow-lg border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 border-r border-gray-200 pr-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un poste ou mot-clé"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="flex-1 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pays ou fuseau horaire"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <button className="bg-[#a590ff] text-white px-8 py-3 rounded-full font-semibold transition-colors cursor-pointer">
                Rechercher
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-80 bg-white rounded-xl  p-6 h-fit sticky top-4`}
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
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContractTypes.includes(type)}
                      onChange={() =>
                        toggleFilter(
                          selectedContractTypes,
                          setSelectedContractTypes,
                          type
                        )
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Range Salary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                Fourchette de salaire
              </h3>
              <div className="space-y-2">
                {salaryRanges.map((range) => (
                  <label
                    key={range}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="salaryRange"
                      checked={selectedSalaryRange === range}
                      onChange={() => setSelectedSalaryRange(range)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
              {selectedSalaryRange === "Personnalisé" && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="€1,500"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <span className="text-gray-500">à</span>
                    <input
                      type="number"
                      placeholder="€2,500"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Devise</h3>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            {/* On-site/Remote */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">
                On-site/remote
              </h3>
              <div className="space-y-2">
                {remoteOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="remote"
                      checked={selectedRemote.includes(option)}
                      onChange={() => setSelectedRemote([option])}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Function */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Job function</h3>
              <div className="space-y-2">
                {jobFunctions.map((function_) => (
                  <label
                    key={function_}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedJobFunctions.includes(function_)}
                      onChange={() =>
                        toggleFilter(
                          selectedJobFunctions,
                          setSelectedJobFunctions,
                          function_
                        )
                      }
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-gray-700">{function_}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Job List */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 w-full bg-white rounded-lg shadow-md px-4 py-3 font-semibold"
              >
                <Filter className="w-5 h-5" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full ml-auto">
                    Active
                  </span>
                )}
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredJobs.length}
                </span>{" "}
                Jobs resultats
              </p>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Aucune offre trouvée</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              ) : (
                <>
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/offres/${job.id}`}>
                        <div className="bg-white rounded-xl  p-6 cursor-pointer   hover:border-[#a590ff] hover:border transition-all hover:shadow-lg">
                          <div className="flex gap-4">
                            <img
                              src={job.logo}
                              alt={job.company}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 hover:text-[#a590ff] transition-colors">
                                    {job.title}
                                  </h3>
                                  <p className="text-gray-600 font-medium">
                                    {job.company}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex items-start gap-2">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-x-2">
                                        <MapPin className="w-5 h-5" />
                                        <span className="flex items-center gap-1 text-lg font-bold">
                                          {job.location}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-500 ml-7">
                                        {job.postedAt}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 mb-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-base font-medium ${
                                    job.type === "CDI"
                                      ? "bg-green-100 text-green-700"
                                      : job.type === "FREELANCE"
                                      ? "bg-orange-100 text-orange-700"
                                      : job.type === "CDD"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {job.type}
                                </span>
                                {job.salary && (
                                  <span className="  px-3 py-1 rounded-full text-base font-medium flex items-center gap-2">
                                    {/* <DollarSignIcon className="h-4 w-4" /> */}
                                    {job.salary} {job.salaryCurrency}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2 mb-3">
                                {job.description
                                  .split(". ")
                                  .slice(0, 2)
                                  .map((sentence, idx) => (
                                    <p
                                      key={idx}
                                      className="text-gray-600 text-sm"
                                    >
                                      • {sentence.trim()}
                                    </p>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  <div>
                    {pagination && pagination.totalPages > 1 && (
                      <Card className="shadow-none">
                        <CardContent>
                          <div className="flex items-center justify-between">
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
                                <SelectTrigger className="w-[80px]">
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

                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Page {pagination.page} sur{" "}
                                {pagination.totalPages}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  // onClick={() => {
                                  //   setCurrentPage(1);
                                  //   window.scrollTo({
                                  //     top: 0,
                                  //     behavior: "smooth",
                                  //   });
                                  // }}
                                  onClick={handleFirstPage}
                                  disabled={currentPage === 1}
                                >
                                  <IconChevronLeft className="h-4 w-4 mr-1" />
                                  Première
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  // onClick={() => {
                                  //   setCurrentPage(currentPage - 1);
                                  //   window.scrollTo({
                                  //     top: 0,
                                  //     behavior: "smooth",
                                  //   });
                                  // }}
                                  onClick={handlePreviousPage}
                                  disabled={currentPage === 1}
                                >
                                  <IconChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="px-4 py-2 text-sm font-medium">
                                  {pagination.page}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  // onClick={() => {
                                  //   setCurrentPage(currentPage + 1);
                                  //   window.scrollTo({
                                  //     top: 0,
                                  //     behavior: "smooth",
                                  //   });
                                  // }}
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
                                  // onClick={() => {
                                  //   window.scrollTo({
                                  //     top: 0,
                                  //     behavior: "smooth",
                                  //   });
                                  //   setCurrentPage(pagination.totalPages || 1);
                                  // }}
                                  onClick={handleLastPage}
                                  disabled={
                                    currentPage === pagination.totalPages ||
                                    !pagination.totalPages
                                  }
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

            {/* Message quand toutes les offres sont affichées */}
            {!hasMoreJobs && displayedJobs.length > 0 && (
              <div className="mt-8 text-center p-6 rounded-lg">
                <p className="text-gray-700 font-medium">
                  Vous avez vu toutes les offres disponibles !
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Créez une alerte pour être informé des nouvelles offres
                  d'emploi
                </p>
                <button className="mt-4 bg-[#a590ff] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#9580ef] transition-colors cursor-pointer">
                  Créer une alerte
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 mt-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Créez une alerte emploi et recevez les nouvelles offres d'emploi
              par email
            </p>
            <button className=" text-white bg-[#a590ff] px-8 py-2 rounded-full font-semibold text-lg transition-colors shadow-lg cursor-pointer">
              Créer une alerte emploi
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
