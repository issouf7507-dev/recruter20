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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { CheckCircle2, Send, Loader2 } from "lucide-react";

interface PostulerButtonProps {
  jobOfferId: string;
  jobTitle: string;
}

export function PostulerButton({ jobOfferId, jobTitle }: PostulerButtonProps) {
  const { data: session } = useSession();
  const { candidat } = useCandidat();
  const { hasApplied, createCandidature } = useCandidatures(candidat?.id);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const handlePostuler = async () => {
    if (!candidat?.id) {
      alert("Vous devez être connecté en tant que candidat pour postuler");
      return;
    }

    createCandidature.mutate(
      {
        jobOfferId,
        message: message || undefined,
        cv: candidat?.cv || undefined,
      },
      {
        onSuccess: (data) => {
          setShowForm(false);
          setMessage("");
          alert(data.message || "Candidature envoyée avec succès !");
        },
        onError: (error: any) => {
          alert(error.message || "Une erreur est survenue");
        },
      }
    );
  };

  // Si l'utilisateur n'est pas connecté
  if (!session) {
    return (
      <Button disabled variant="outline" className="w-full">
        Connectez-vous pour postuler
      </Button>
    );
  }

  // Si l'utilisateur a déjà postulé
  if (hasApplied(jobOfferId)) {
    return (
      <Button disabled variant="outline" className="w-full">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Candidature envoyée
      </Button>
    );
  }

  // Formulaire de postulation
  if (showForm) {
    return (
      <Card className="mt-4 border-primary">
        <CardHeader>
          <CardTitle>Postuler à : {jobTitle}</CardTitle>
          <CardDescription>
            Ajoutez un message personnalisé (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message de motivation</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
              className="min-h-[120px]"
            />
          </div>

          {candidat?.cv && (
            <div className="text-sm text-muted-foreground">
              ✓ Votre CV sera automatiquement joint à la candidature
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setMessage("");
              }}
              disabled={createCandidature.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePostuler}
              disabled={createCandidature.isPending}
              className="min-w-[120px]"
            >
              {createCandidature.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bouton initial
  return (
    <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
      <Send className="h-4 w-4 mr-2" />
      Postuler à cette offre
    </Button>
  );
}

