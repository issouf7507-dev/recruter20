"use client";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Share2,
  Bookmark,
  Building2,
  Users,
  Calendar,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Loader2Icon,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { useOffer, useOffers } from "@/lib/hooks/use-offers";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

export default function OffreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostulerModal, setShowPostulerModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const { candidat } = useCandidat();
  const { hasApplied, createCandidature } = useCandidatures(candidat?.id);

  // Trouver l'offre correspondante
  // const jobDetail = allJobs.find((job) => job.id === parseInt(params.id));

  // Offres similaires (exclure l'offre actuelle)

  const { id } = React.use(params); // 🔹 Déstructure après "unwrap"
  const hasIncrementedView = useRef(false);

  const { data: jobDetail, isLoading, refetch: refetchOffer } = useOffer(id);

  // Incrémenter le compteur de vues une seule fois au chargement
  useEffect(() => {
    const incrementViews = async () => {
      if (id && !hasIncrementedView.current) {
        hasIncrementedView.current = true;
        try {
          await fetch(`/api/offres/${id}/views`, {
            method: "POST",
          });
          // Rafraîchir les données de l'offre pour avoir le nouveau compteur
          refetchOffer();
        } catch (error) {
          console.error("Error incrementing views:", error);
        }
      }
    };

    incrementViews();
  }, [id, refetchOffer]);
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["documents", candidat?.id],
    queryFn: async () => {
      if (!candidat?.id) return [];
      const response = await fetch(`/api/candidats/${candidat?.id}/documents`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Fetch similar offers from API
  const { data: similarOffersData } = useOffers(
    {
      limit: 4,
    },
    {
      enabled: !!id,
    }
  );

  // Transform similar offers and exclude current offer
  const similarJobs = React.useMemo(() => {
    if (!similarOffersData?.items) return [];

    return similarOffersData.items
      .filter((offer) => offer.id !== id)
      .slice(0, 3)
      .map((offer) => ({
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
        logo: offer.logo || null,
        salaryCurrency: offer.salaryCurrency || "",
      }));
  }, [similarOffersData, id]);

  // console.log(documents);

  // Si l'offre n'existe pas, rediriger ou afficher un message
  if (!jobDetail || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          {/* <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Offre non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            Cette offre d'emploi n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/offres"
            className="bg-[#a590ff] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9580ef] transition-colors inline-block"
          >
            Retour aux offres
          </Link> */}
        </div>
      </div>
    );
  }

  // Formater la date limite
  const formatDueDate = (duedate: Date | string | undefined) => {
    if (!duedate) return null;

    const dueDate = new Date(duedate);
    const now = new Date();
    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const isExpired = diffInMs < 0;
    const isSoon = diffInDays >= 0 && diffInDays <= 7;

    let formatted = "";
    if (isExpired) {
      formatted = "Expiré";
    } else if (diffInDays === 0) {
      formatted = "Aujourd'hui";
    } else if (diffInDays === 1) {
      formatted = "Demain";
    } else if (diffInDays < 7) {
      formatted = `Dans ${diffInDays} jours`;
    } else {
      formatted = dueDate.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return { formatted, isExpired, isSoon };
  };

  const dueDateInfo = formatDueDate(jobDetail.duedate);

  const handleShare = () => {
    // if (navigator.share) {
    //   navigator.share({
    //     title: jobDetail.title,
    //     text: `Découvrez cette offre d'emploi : ${jobDetail.title} chez ${jobDetail.company}`,
    //     url: window.location.href,
    //   });
    // } else {
    setShowShareModal(true);
    // }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Lien copié dans le presse-papier !");
    setShowShareModal(false);
  };

  const shareViaWhatsApp = () => {
    const text = `Découvrez cette offre d'emploi : ${jobDetail.title} chez ${jobDetail.company}\n${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePostulerModal = () => {
    if (
      candidat &&
      documents?.some((document: any) => document.documentType === "cv")
    ) {
      setShowPostulerModal(true);
    } else if (
      !documents?.some((document: any) => document.documentType === "cv")
    ) {
      setShowDocumentsModal(true);
    } else {
      window.location.href = "/auth/candidat/login";
    }
  };

  // console.log("hasApplied", hasApplied(jobDetail?.id));
  const handlePostuler = async () => {
    if (!candidat?.id || !jobDetail?.id) {
      alert("Erreur lors de la postulation");
      return;
    }

    // Vérifier si déjà postulé
    if (hasApplied(jobDetail.id)) {
      alert("Vous avez déjà postulé à cette offre");
      setShowPostulerModal(false);
      return;
    }

    createCandidature.mutate(
      {
        jobOfferId: jobDetail.id,
        message: applicationMessage || undefined,
        cv: candidat?.cv || undefined,
      },
      {
        onSuccess: (data) => {
          setShowPostulerModal(false);
          setApplicationMessage("");
          alert(data.message || "Candidature envoyée avec succès !");
        },
        onError: (error: any) => {
          alert(
            error.message || "Une erreur est survenue lors de la postulation"
          );
        },
      }
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/offres"
            className="flex items-center gap-2 text-white hover:text-[#a590ff] transition-colors w-fit cursor-pointer hover:scale-105 hover:text-white bg-[#a590ff] px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux offres</span>
          </Link>
        </div>
      </div> */}

      {/* Job Header */}
      <div
        className=" bg-cover bg-center bg-no-repeat py-8 md:py-12"
        style={{
          backgroundImage: "url('/img/banniereweb_.png')",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {jobDetail.logo ? (
                <img
                  src={jobDetail.logo}
                  alt={jobDetail.company}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 flex items-center justify-center shadow-md">
                  <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    {/* {jobDetail.urgent && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                        Urgently hiring
                      </span>
                    )} */}
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                      {jobDetail.title}
                    </h1>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-lg md:text-xl text-gray-700 font-medium">
                        {jobDetail.company}
                      </p>
                      {/* <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {jobDetail.rating}
                        </span>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="p-3 cursor-pointer text-gray-600 hover:text-[#a590ff] transition-all hover:scale-105"
                      title="Partager l'offre"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 md:gap-4 mb-6 text-sm md:text-base text-gray-600">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.location}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.type}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    {new Date(jobDetail.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2  bg-gray-50 px-3 py-2 rounded-lg font-semibold">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                    {jobDetail.salaryMax} - {jobDetail.salaryMin}{" "}
                    {jobDetail.salaryCurrency}
                  </span>
                  {dueDateInfo && (
                    <span
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
                        dueDateInfo.isExpired
                          ? "bg-red-50 text-red-700"
                          : dueDateInfo.isSoon
                          ? "bg-orange-50 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                      {dueDateInfo.isExpired
                        ? "⚠️ " + dueDateInfo.formatted
                        : "Clôture: " + dueDateInfo.formatted}
                    </span>
                  )}
                </div>

                {/* <div className="flex flex-wrap gap-2 mb-6">
                  {jobDetail.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-50 text-[#a590ff] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border border-purple-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div> */}

                <button
                  className="w-full md:w-auto bg-[#a590ff] hover:bg-[#9580ef] text-white px-8 py-2 rounded-full font-semibold text-lg transition-all cursor-pointer"
                  onClick={handlePostulerModal}
                  disabled={hasApplied(jobDetail?.id)}
                >
                  {hasApplied(jobDetail?.id)
                    ? "Candidature envoyée"
                    : candidat
                    ? "Postuler maintenant"
                    : "Connectez-vous pour postuler"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-6 md:p-8 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Description du poste
                </h2>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: jobDetail.description || "",
                }}
                className="text-gray-700 leading-relaxed whitespace-pre-line"
              />
            </motion.div>
            {/* Missions */}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA Sticky */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl bg-gray-50 p-6 sticky top-24 border border-gray-200"
            >
              <button
                className="w-full bg-[#a590ff] hover:bg-[#9580ef] text-white px-6 py-2 rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-xl hover:scale-105 mb-3
              
              "
                onClick={handlePostulerModal}
                disabled={hasApplied(jobDetail?.id)}
              >
                {hasApplied(jobDetail?.id)
                  ? "Candidature envoyée"
                  : candidat
                  ? "Postuler maintenant"
                  : "Connectez-vous pour postuler"}
              </button>
              <p className="text-sm text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Postulez en moins de 2 minutes
              </p>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Publié</span>
                  <span className="text-gray-700 font-medium">
                    {new Date(jobDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {dueDateInfo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date limite</span>
                    <span
                      className={`font-medium ${
                        dueDateInfo.isExpired
                          ? "text-red-600"
                          : dueDateInfo.isSoon
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    >
                      {dueDateInfo.formatted}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Candidatures</span>
                  <span className="text-[#a590ff] font-semibold">
                    {jobDetail.applications?.length || 0} reçues
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Vues</span>
                  <span className="text-gray-700 font-medium">
                    {jobDetail.views || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  À propos de {jobDetail.company}
                </h3>
              </div>
              <div className="space-y-3 mb-4">
                {/* <div className="flex items-start gap-3 text-sm">
                  <Users className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Taille</p>
                    <p className="text-gray-700 font-medium">
                      {jobDetail.companyInfo.size}
                    </p>
                  </div>
                </div> */}
                {/* <div className="flex items-start gap-3 text-sm">
                  <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Secteur</p>
                    <p className="text-gray-700 font-medium">
                      {jobDetail}
                    </p>
                  </div>
                </div> */}
                {/* <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Fondée en</p>
                    <p className="text-gray-700 font-medium">
                      {jobDetail.companyInfo.founded}
                    </p>
                  </div>
                </div> */}
                {/* {jobDetail.companyInfo.website && (
                  <div className="flex items-start gap-3 text-sm">
                    <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Site web</p>
                      <a
                        href={`https://${jobDetail.companyInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a590ff] hover:underline font-medium"
                      >
                        {jobDetail.companyInfo.website}
                      </a>
                    </div>
                  </div>
                )} */}
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: jobDetail.description || "",
                }}
                className="text-gray-700 leading-relaxed whitespace-pre-line"
              />
            </motion.div>
          </div>
        </div>

        {/* Similar Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Offres similaires
            </h2>
            <Link
              href="/offres"
              className="text-[#a590ff] hover:underline font-semibold text-sm md:text-base"
            >
              Voir toutes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/offres/${job.id}`}>
                  <div className="bg-white rounded-xl transition-all p-6 cursor-pointer  border border-gray-200  hover:border-[#a590ff] h-full">
                    <div className="flex items-start gap-3 mb-4">
                      {job.logo ? (
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900 mb-1 hover:text-[#a590ff] transition-colors line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-[#a590ff] font-bold text-lg">
                        {job.salary} {job.salaryCurrency}
                      </span>
                      <span className="bg-purple-50 text-[#a590ff] px-3 py-1 rounded-full text-xs font-medium">
                        Voir l'offre
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Partager cette offre</h3>
            <div className="space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Copier le lien</span>
              </button>
              <button
                onClick={shareViaWhatsApp}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Partager par WhatsApp</span>
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  jobDetail.title
                )}&body=${encodeURIComponent(window.location.href)}`}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Partager par email</span>
              </a>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-[#a590ff] hover:bg-[#9580ef]  rounded-full font-semibold text-white transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}

      {/*  */}

      <AlertDialog open={showPostulerModal} onOpenChange={setShowPostulerModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Postuler à : {jobDetail?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Ajoutez un message personnalisé pour vous démarquer (optionnel)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label
              htmlFor="app-message"
              className="text-sm font-medium mb-2 block"
            >
              Message de motivation
            </Label>
            <Textarea
              id="app-message"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
              className="min-h-[120px]"
            />
            {candidat?.cv && (
              <p className="text-sm text-muted-foreground mt-2">
                ✓ Votre CV sera automatiquement joint à la candidature
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createCandidature.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#a590ff] hover:bg-[#9580ef] text-white"
              onClick={handlePostuler}
              disabled={createCandidature.isPending}
            >
              {createCandidature.isPending ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Postuler"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/*  */}
      <AlertDialog
        open={showDocumentsModal}
        onOpenChange={setShowDocumentsModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Documents requis</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devez télécharger un CV pour postuler à cette offre. Allez
              dans votre espace candidat dans la section "Documents" pour
              télécharger votre CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#a590ff] hover:bg-[#9580ef] text-white"
              // onClick={handleDocuments}
            >
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
