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
  Globe,
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
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "var(--y-bg)" }}>
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: "var(--y-primary)" }} />
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
    <div className="min-h-screen" style={{ background: "var(--y-bg)" }}>
      {/* Job Header — bloc violet cohérent avec la refonte */}
      <div
        className="relative overflow-hidden px-6 md:px-12 lg:px-20 pt-28 pb-14 md:pb-16"
        style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
      >
        <div className="yl-orb" style={{ width: 420, height: 420, top: -160, right: -120, background: "rgba(255,255,255,0.14)" }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Link
            href="/offres"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            ← Retour aux offres
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-5 rounded-3xl p-6 md:p-8"
            style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {jobDetail.logo ? (
                <img
                  src={jobDetail.logo}
                  alt={jobDetail.company}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0"
                  style={{ boxShadow: "var(--y-shadow-md)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                >
                  <Briefcase className="w-10 h-10 md:w-12 md:h-12" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-4xl font-semibold tracking-[-0.02em] mb-2" style={{ color: "var(--y-ink)" }}>
                      {jobDetail.title}
                    </h1>
                    <p className="text-lg md:text-xl font-medium" style={{ color: "var(--y-ink-2)" }}>
                      {jobDetail.company}
                    </p>
                  </div>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: "var(--y-bg-soft)", color: "var(--y-ink-3)" }}
                    title="Partager l'offre"
                  >
                    <Share2 className="w-[18px] h-[18px]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3 mb-6 text-sm">
                  {[
                    { icon: MapPin, label: jobDetail.location },
                    { icon: Briefcase, label: jobDetail.type },
                    { icon: Clock, label: new Date(jobDetail.createdAt).toLocaleDateString() },
                    (jobDetail.salaryMin || jobDetail.salaryMax) && {
                      icon: DollarSign,
                      label: `${jobDetail.salaryMin ?? ""}${jobDetail.salaryMin && jobDetail.salaryMax ? " - " : ""}${jobDetail.salaryMax ?? ""} ${jobDetail.salaryCurrency ?? ""}`,
                    },
                  ]
                    .filter(Boolean)
                    .map((m: any, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "var(--y-bg-soft)", color: "var(--y-ink-2)" }}
                      >
                        <m.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" style={{ color: "var(--y-primary-700)" }} />
                        {m.label}
                      </span>
                    ))}
                  {dueDateInfo && (
                    <span
                      className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium"
                      style={
                        dueDateInfo.isExpired
                          ? { background: "#fef2f2", color: "#b91c1c" }
                          : dueDateInfo.isSoon
                            ? { background: "#fff7ed", color: "#c2410c" }
                            : { background: "var(--y-primary-50)", color: "var(--y-primary-700)" }
                      }
                    >
                      <Calendar className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                      {dueDateInfo.isExpired ? (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {dueDateInfo.formatted}
                        </>
                      ) : (
                        "Clôture : " + dueDateInfo.formatted
                      )}
                    </span>
                  )}
                </div>

                <button
                  className="w-full md:w-auto h-12 px-8 rounded-full font-medium text-base transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{
                    background: hasApplied(jobDetail?.id)
                      ? "var(--y-bg-soft)"
                      : "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))",
                    color: hasApplied(jobDetail?.id) ? "var(--y-ink-3)" : "#fff",
                    boxShadow: hasApplied(jobDetail?.id) ? "none" : "var(--y-shadow-violet)",
                  }}
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
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-6 md:p-8"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.02em]" style={{ color: "var(--y-ink)" }}>
                  Description du poste
                </h2>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: jobDetail.description || "",
                }}
                className="leading-relaxed whitespace-pre-line"
                style={{ color: "var(--y-ink-2)" }}
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
              className="rounded-2xl p-6 sticky top-24"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-md)" }}
            >
              <button
                className="w-full h-12 rounded-full font-medium text-base transition-transform hover:-translate-y-0.5 mb-3 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
                style={{
                  background: hasApplied(jobDetail?.id)
                    ? "var(--y-bg-soft)"
                    : "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))",
                  color: hasApplied(jobDetail?.id) ? "var(--y-ink-3)" : "#fff",
                  boxShadow: hasApplied(jobDetail?.id) ? "none" : "var(--y-shadow-violet)",
                }}
                onClick={handlePostulerModal}
                disabled={hasApplied(jobDetail?.id)}
              >
                {hasApplied(jobDetail?.id)
                  ? "Candidature envoyée"
                  : candidat
                    ? "Postuler maintenant"
                    : "Connectez-vous pour postuler"}
              </button>
              <p className="text-sm text-center mb-4 flex items-center justify-center gap-1" style={{ color: "var(--y-ink-3)" }}>
                <Clock className="w-4 h-4" />
                Postulez en moins de 2 minutes
              </p>
              <div className="pt-4 space-y-3" style={{ borderTop: "1px solid var(--y-line)" }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--y-ink-3)" }}>Publié</span>
                  <span className="font-medium" style={{ color: "var(--y-ink)" }}>
                    {new Date(jobDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {dueDateInfo && (
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--y-ink-3)" }}>Date limite</span>
                    <span
                      className="font-medium"
                      style={{
                        color: dueDateInfo.isExpired ? "#dc2626" : dueDateInfo.isSoon ? "#ea580c" : "var(--y-primary-700)",
                      }}
                    >
                      {dueDateInfo.formatted}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--y-ink-3)" }}>Candidatures</span>
                  <span className="font-semibold" style={{ color: "var(--y-primary-700)" }}>
                    {jobDetail.applications?.length || 0} reçues
                  </span>
                </div>
                {/* <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Vues</span>
                  <span className="text-gray-700 font-medium">
                    {jobDetail.views || 0}
                  </span>
                </div>*/}
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-6"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              {(() => {
                const r = jobDetail.recruteur;
                const companyName = jobDetail.company || r?.companyName || "l'entreprise";
                const logo = r?.logo || jobDetail.logo;
                const infos = [
                  r?.industry ? { icon: Building2, label: "Secteur", value: r.industry } : null,
                  r?.size ? { icon: Users, label: "Taille", value: r.size } : null,
                  r?.location ? { icon: MapPin, label: "Localisation", value: r.location } : null,
                ].filter(Boolean) as { icon: any; label: string; value: string }[];

                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      {logo ? (
                        <img src={logo} alt={companyName} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold min-w-0 truncate" style={{ color: "var(--y-ink)" }}>
                        {companyName}
                      </h3>
                    </div>

                    {r?.description ? (
                      <p className="text-sm leading-relaxed mb-4 whitespace-pre-line" style={{ color: "var(--y-ink-2)" }}>
                        {r.description}
                      </p>
                    ) : (
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--y-ink-3)" }}>
                        {companyName} recrute sur Ylsix. Postulez pour rejoindre l&apos;équipe et
                        découvrir un environnement de travail stimulant.
                      </p>
                    )}

                    {infos.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {infos.map((info) => (
                          <div key={info.label} className="flex items-start gap-3 text-sm">
                            <info.icon className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: "var(--y-primary-700)" }} />
                            <div>
                              <p className="text-xs" style={{ color: "var(--y-ink-3)" }}>{info.label}</p>
                              <p className="font-medium" style={{ color: "var(--y-ink)" }}>{info.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {r?.website && (
                      <a
                        href={r.website.startsWith("http") ? r.website : `https://${r.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
                        style={{ color: "var(--y-primary-700)" }}
                      >
                        <Globe className="w-4 h-4" /> Visiter le site web
                      </a>
                    )}
                  </>
                );
              })()}
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
            <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em]" style={{ color: "var(--y-ink)" }}>
              Offres similaires
            </h2>
            <Link
              href="/offres"
              className="font-medium text-sm md:text-base flex items-center gap-1 hover:underline"
              style={{ color: "var(--y-primary-700)" }}
            >
              Voir toutes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {similarJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/offres/${job.id}`} className="block h-full">
                  <div
                    className="rounded-2xl p-5 cursor-pointer h-full flex flex-col transition-transform hover:-translate-y-1"
                    style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line)" }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {job.logo ? (
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                        >
                          <Briefcase className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 line-clamp-2" style={{ color: "var(--y-ink)" }}>
                          {job.title}
                        </h3>
                        <p className="text-sm" style={{ color: "var(--y-ink-3)" }}>{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--y-ink-3)" }}>
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--y-ink-3)" }}>
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px dashed var(--y-line-2)" }}>
                      <span className="font-semibold text-sm" style={{ color: job.salary ? "var(--y-primary-700)" : "var(--y-ink-4)" }}>
                        {job.salary ? `${job.salary} ${job.salaryCurrency}` : "Salaire à négocier"}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}>
                        Voir l&apos;offre
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
            className="rounded-2xl p-6 max-w-md w-full"
            style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--y-ink)" }}>Partager cette offre</h3>
            <div className="space-y-3">
              {[
                { onClick: copyToClipboard, icon: FileText, label: "Copier le lien" },
                { onClick: shareViaWhatsApp, icon: MessageCircle, label: "Partager par WhatsApp" },
              ].map(({ onClick, icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[color:var(--y-bg-soft)]"
                  style={{ boxShadow: "inset 0 0 0 1px var(--y-line)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--y-primary-700)" }} />
                  <span style={{ color: "var(--y-ink)" }}>{label}</span>
                </button>
              ))}
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  jobDetail.title
                )}&body=${encodeURIComponent(window.location.href)}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[color:var(--y-bg-soft)]"
                style={{ boxShadow: "inset 0 0 0 1px var(--y-line)" }}
              >
                <Mail className="w-5 h-5" style={{ color: "var(--y-primary-700)" }} />
                <span style={{ color: "var(--y-ink)" }}>Partager par email</span>
              </a>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 h-11 rounded-full font-medium text-white transition-transform hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", boxShadow: "var(--y-shadow-violet)" }}
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
              className="text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
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
              className="text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
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
