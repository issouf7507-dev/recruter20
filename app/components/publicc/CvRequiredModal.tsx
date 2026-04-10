"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getCandidat } from "@/action/getCandidat";
import { useEdgeStore } from "@/lib/edgestore";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function CvRequiredModal() {
  const { data: session } = useSession();
  const { edgestore } = useEdgeStore();
  const queryClient = useQueryClient();
  const [candidat, setCandidat] = useState<{ id: string } | null>(null);
  const [documents, setDocuments] = useState<{ documentType: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);


  // console.log("session", session);


  // Charger le candidat et ses documents
  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const c = await getCandidat(session.user!.id);
        if (cancelled) return;
        setCandidat(c ?? null);
        if (!c?.id) {
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/candidats/${c.id}/documents`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setDocuments(data.success ? data.data : []);
      } catch {
        if (!cancelled) setDocuments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const hasCv = documents.some((d) => d.documentType === "cv");

  useEffect(() => {
    if (loading) return;
    if (session?.user && candidat && !hasCv) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [loading, session?.user, candidat, hasCv]);

  const handleUpload = async (file: File) => {
    if (!candidat?.id) return;
    setUploading(true);
    try {
      const res = await edgestore.publicFiles.upload({ file });
      const response = await fetch(`/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidatId: candidat.id,
          fileName: file.name,
          fileUrl: res.url,
          fileType: file.type,
          fileSize: file.size,
          documentType: "cv",
        }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["documents", candidat.id] });
        const resDocs = await fetch(`/api/candidats/${candidat.id}/documents`);
        const dataDocs = await resDocs.json();
        const newDocs = dataDocs.success ? dataDocs.data : [];
        setDocuments(newDocs);
        toast.success("CV enregistré. Vous pouvez continuer.");
        setShowModal(false);
      } else {
        const err = await response.json();
        toast.error(err.error || "Erreur lors de l'upload du CV");
      }
    } catch (e) {
      console.error(e);
      toast.error("Une erreur est survenue lors du téléchargement du CV");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
      handleUpload(file);
    } else if (file) {
      toast.error("Format accepté : PDF, DOC ou DOCX");
    }
    e.target.value = "";
  };
  //si le fichier est trop grand, afficher un message d'erreur
  if (loading || !showModal) return null;

  return (
    <Dialog open={true} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#a590ff]">
            <FileText className="h-5 w-5" />
            CV obligatoire
          </DialogTitle>
          <DialogDescription>
            Pour continuer à utiliser la plateforme, vous devez déposer au moins
            un CV (PDF, DOC ou DOCX). Ce document sera visible par les
            recruteurs.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="rounded-lg border border-[#a590ff]/30 bg-[#a590ff]/5 p-4">
            <p className="text-sm font-medium mb-2">Vous n&apos;avez pas encore de CV ?</p>
            <a
              href="https://cv.ylsix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#a590ff] hover:underline font-medium"
            >
              <Plus className="h-4 w-4" />
              Créer un CV en ligne sur cv.ylsix.com
              <ExternalLink className="size-4" />
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Choisissez un modèle, renseignez vos infos puis téléchargez votre CV avant de le déposer ici.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Choisir un fichier (PDF, DOC, DOCX)
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="cv-required-upload"
                disabled={uploading}
                onChange={onFileChange}
              />
              <Button
                type="button"
                className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90 flex-1"
                disabled={uploading}
                onClick={() =>
                  document.getElementById("cv-required-upload")?.click()
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Téléversement..." : "Télécharger mon CV"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ce modal ne peut pas être fermé tant qu&apos;un CV n&apos;a pas été
              déposé.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
