"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Download, Trash2, Plus, Eye, Star } from "lucide-react";
import { IconFileTypePdf, IconFileTypeDocx, IconPaperclip } from "@tabler/icons-react";
import { useEdgeStore } from "@/lib/edgestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DocumentsSectionProps {
  candidatId?: string;
}

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: "cv" | "lettre" | "autre";
  createdAt: string;
}

export function DocumentsSection({ candidatId }: DocumentsSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();
  const qc = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", candidatId],
    queryFn: async () => {
      if (!candidatId) return [];
      const res = await fetch(`/api/candidats/${candidatId}/documents`);
      if (!res.ok) return [];
      const result = await res.json();
      return result.success ? result.data : [];
    },
    enabled: !!candidatId,
  });

  const { data: candidatData } = useQuery({
    queryKey: ["candidat-cv", candidatId],
    queryFn: async () => {
      const res = await fetch(`/api/candidats/${candidatId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
    enabled: !!candidatId,
  });

  const primaryCvUrl = candidatData?.cv ?? null;

  const handleFileUpload = async (file: File, documentType: "cv" | "lettre" | "autre") => {
    if (!candidatId) return;
    setUploading(true);
    try {
      const res = await edgestore.publicFiles.upload({ file });
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatId, fileName: file.name, fileUrl: res.url, fileType: file.type, fileSize: file.size, documentType }),
      });
      if (response.ok) {
        qc.invalidateQueries({ queryKey: ["documents", candidatId] });
        toast.success("Document téléchargé avec succès");
      } else {
        toast.error("Impossible de télécharger le document");
      }
    } catch {
      toast.error("Une erreur est survenue lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (response.ok) {
        try { await edgestore.publicFiles.delete({ url: fileUrl }); } catch {}
        qc.invalidateQueries({ queryKey: ["documents", candidatId] });
        toast.success("Document supprimé");
      } else {
        toast.error("Impossible de supprimer le document");
      }
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const handleSetPrimary = async (fileUrl: string) => {
    try {
      const res = await fetch(`/api/candidats/${candidatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: fileUrl }),
      });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["candidat-cv", candidatId] });
        toast.success("CV principal mis à jour");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <IconFileTypePdf className="h-6 w-6 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document")) return <IconFileTypeDocx className="h-6 w-6 text-blue-500" />;
    return <IconPaperclip className="h-6 w-6 text-muted-foreground" />;
  };

  const canPreview = (fileType: string) => fileType.includes("pdf");

  const cvs = (documents as Document[]).filter((d) => d.documentType === "cv");
  const lettres = (documents as Document[]).filter((d) => d.documentType === "lettre");
  const autres = (documents as Document[]).filter((d) => d.documentType === "autre");

  const DocRow = ({ doc, showPrimary = false }: { doc: Document; showPrimary?: boolean }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center shrink-0">{getFileIcon(doc.fileType)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center gap-2">
            {doc.fileName}
            {showPrimary && primaryCvUrl === doc.fileUrl && (
              <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs shrink-0">Principal</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatFileSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
      <div className="flex gap-1 shrink-0 ml-2">
        {showPrimary && primaryCvUrl !== doc.fileUrl && (
          <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(doc.fileUrl)} title="Définir comme CV principal">
            <Star className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {canPreview(doc.fileType) && (
          <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(doc.fileUrl)} title="Prévisualiser">
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => window.open(doc.fileUrl, "_blank")} title="Télécharger">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id, doc.fileUrl)} title="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="space-y-6 pb-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Pas encore de CV ?</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Créez un CV professionnel en quelques clics sur cv.ylsix.com.</p></CardContent>
        <CardFooter>
          <Button className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90" onClick={() => window.open("https://cv.ylsix.com/", "_blank")}>
            <Plus className="h-4 w-4 mr-2" />Créer un CV
          </Button>
        </CardFooter>
      </Card>

      <div>
        <h3 className="text-2xl font-bold text-[#a590ff]">Documents</h3>
        <p className="text-muted-foreground">Gérez vos CV, lettres de motivation et autres documents</p>
      </div>

      {/* CV */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">CV</CardTitle>
              <CardDescription>Téléchargez et gérez vos fichiers CV (PDF, DOC, DOCX). Marquez un CV comme principal avec ⭐.</CardDescription>
            </div>
            <div>
              <Button onClick={() => document.getElementById("cv-upload")?.click()} disabled={uploading} size="sm" className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Upload..." : "Télécharger CV"}
              </Button>
              <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "cv"); e.target.value = ""; }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cvs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun CV téléchargé</div>
          ) : (
            <div className="space-y-3">
              {cvs.map((doc) => <DocRow key={doc.id} doc={doc} showPrimary />)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lettres */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">Lettres de motivation</CardTitle>
              <CardDescription>Téléchargez et gérez vos lettres de motivation</CardDescription>
            </div>
            <div>
              <Button onClick={() => document.getElementById("lettre-upload")?.click()} disabled={uploading} size="sm" className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Upload..." : "Télécharger"}
              </Button>
              <input id="lettre-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "lettre"); e.target.value = ""; }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lettres.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune lettre de motivation téléchargée</div>
          ) : (
            <div className="space-y-3">{lettres.map((doc) => <DocRow key={doc.id} doc={doc} />)}</div>
          )}
        </CardContent>
      </Card>

      {/* Autres */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">Autres documents</CardTitle>
              <CardDescription>Certificats, attestations, etc.</CardDescription>
            </div>
            <div>
              <Button onClick={() => document.getElementById("autre-upload")?.click()} disabled={uploading} size="sm" variant="outline" className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Upload..." : "Télécharger"}
              </Button>
              <input id="autre-upload" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "autre"); e.target.value = ""; }} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {autres.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun autre document téléchargé</div>
          ) : (
            <div className="space-y-3">{autres.map((doc) => <DocRow key={doc.id} doc={doc} />)}</div>
          )}
        </CardContent>
      </Card>

      {/* Prévisualisation PDF */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0">
            <DialogTitle>Prévisualisation</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-4 pb-4">
            {previewUrl && (
              <iframe src={previewUrl} className="w-full h-full rounded border" title="Aperçu du document" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
