"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ProfilSection } from "@/components/public/candidat-sections/ProfilSection";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { Button } from "@/components/ui/button";
import { IconShare, IconPrinter, IconExternalLink } from "@tabler/icons-react";
import { toast } from "sonner";

export default function CandidatProfilPage() {
  const { candidat } = useCandidat();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!candidat?.id) return;
    const url = `${window.location.origin}/profil/${candidat.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <>
      <SiteHeader title="Mon profil" />
      {/* Barre d'actions profil */}
      <div className="flex items-center gap-2 px-4 lg:px-6 py-2 border-b bg-background print:hidden">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <IconShare className="h-4 w-4 mr-2" />
          {copied ? "Lien copié !" : "Partager mon profil"}
        </Button>
        {candidat?.id && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/profil/${candidat.id}`} target="_blank">
              <IconExternalLink className="h-4 w-4 mr-2" />
              Voir la version publique
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <IconPrinter className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <ProfilSection candidat={candidat} />
        </div>
      </div>
    </>
  );
}
