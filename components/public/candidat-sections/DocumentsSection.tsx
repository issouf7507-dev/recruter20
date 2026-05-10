"use client";

import { useState, useEffect } from "react";
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
import { Upload, Download, Trash2, File, Plus, Link } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";
import { useQuery } from "@tanstack/react-query";

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
  updatedAt: string;
}

export function DocumentsSection({ candidatId }: DocumentsSectionProps) {
  // const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { edgestore } = useEdgeStore();

  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["documents", candidatId],
    queryFn: async () => {
      if (!candidatId) return [];
      const response = await fetch(`/api/candidats/${candidatId}/documents`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  console.log(documents);

  const handleFileUpload = async (
    file: File,
    documentType: "cv" | "lettre" | "autre"
  ) => {
    if (!candidatId) {
      alert("Erreur: candidatId manquant");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload vers EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
      });

      // 2. Enregistrer les métadonnées dans la base de données via l'API
      const response = await fetch(`/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidatId,
          fileName: file.name,
          fileUrl: res.url,
          fileType: file.type,
          fileSize: file.size,
          documentType,
        }),
      });

      if (response.ok) {
        await refetchDocuments();
        alert("Document téléchargé avec succès");
      } else {
        const error = await response.json();
        alert(
          `Erreur: ${error.error || "Impossible de télécharger le document"}`
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Une erreur est survenue lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }
    try {
      // 1. Supprimer de la base de données via l'API
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 2. Supprimer d'EdgeStore
        try {
          await edgestore.publicFiles.delete({
            url: fileUrl,
          });
        } catch (edgeError) {
          console.error(
            "Erreur lors de la suppression sur EdgeStore:",
            edgeError
          );
          // Continue même si la suppression EdgeStore échoue
        }

        await refetchDocuments();
        alert("Document supprimé avec succès");
      } else {
        const error = await response.json();
        alert(
          `Erreur: ${error.error || "Impossible de supprimer le document"}`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    return "📎";
  };

  const cvs = documents?.filter((d: Document) => d.documentType === "cv");
  const lettres = documents?.filter(
    (d: Document) => d.documentType === "lettre"
  );
  const autres = documents?.filter((d: Document) => d.documentType === "autre");

  if (isLoadingDocuments) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <Card>
        <CardHeader> Vous n'avez pas de CV ? </CardHeader>
        <CardContent>
          <p>
            Vous n'avez pas de CV ? Vous pouvez en créer un en quelques clics.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            onClick={() => window.open("https://cv.ylsix.com/", "_blank")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un CV
          </Button>
        </CardFooter>
      </Card>
      <div>
        <h3 className="text-2xl font-bold text-[#a590ff]">Documents</h3>
        <p className="text-muted-foreground">
          Gérez vos CV, lettres de motivation et autres documents
        </p>
      </div>

      {/* CV */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">CV</CardTitle>
              <CardDescription>
                Téléchargez et gérez vos fichiers CV (PDF, DOC, DOCX)
              </CardDescription>
            </div>
            <Button
              onClick={() => document.getElementById("cv-upload")?.click()}
              disabled={
                uploading ||
                documents?.some((d: Document) => d.documentType === "cv")
              }
              size="sm"
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Upload..." : "Télécharger CV"}
            </Button>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "cv");
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {cvs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun CV téléchargé
            </div>
          ) : (
            <div className="space-y-3">
              {cvs?.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)} •{" "}
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.fileUrl)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lettres de motivation */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">
                Lettres de motivation
              </CardTitle>
              <CardDescription>
                Téléchargez et gérez vos lettres de motivation
              </CardDescription>
            </div>
            <Button
              onClick={() => document.getElementById("lettre-upload")?.click()}
              disabled={
                uploading ||
                documents?.some((d: Document) => d.documentType === "lettre")
              }
              size="sm"
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Upload..." : "Télécharger Lettre"}
            </Button>
            <input
              id="lettre-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "lettre");
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {lettres?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune lettre de motivation téléchargée
            </div>
          ) : (
            <div className="space-y-3">
              {lettres?.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)} •{" "}
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.fileUrl)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Autres documents */}
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#a590ff]">Autres documents</CardTitle>
              <CardDescription>Certificats, attestations, etc.</CardDescription>
            </div>
            <Button
              onClick={() => document.getElementById("autre-upload")?.click()}
              disabled={uploading}
              size="sm"
              variant="outline"
              className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Upload..." : "Télécharger"}
            </Button>
            <input
              id="autre-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "autre");
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {autres?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun autre document téléchargé
            </div>
          ) : (
            <div className="space-y-3">
              {autres?.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)} •{" "}
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.fileUrl)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
