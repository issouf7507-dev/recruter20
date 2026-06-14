"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Offer {
  id: string;
  title: string;
  company?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  jobOfferIds: string[];
  onJobOfferIdsChange: (ids: string[]) => void;
  offers: Offer[];
  onSubmit: () => void;
  isPending: boolean;
  disabled?: boolean;
}

export function CreateCardDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  priority,
  onPriorityChange,
  jobOfferIds,
  onJobOfferIdsChange,
  offers,
  onSubmit,
  isPending,
  disabled,
}: Props) {
  function toggleOffer(id: string, checked: boolean) {
    onJobOfferIdsChange(
      checked ? [...jobOfferIds, id] : jobOfferIds.filter((x) => x !== id),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une carte</DialogTitle>
          <DialogDescription>
            Carte générique — pour importer une candidature, utilisez le bouton
            "Importer".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="card-title">Titre</Label>
            <Input
              id="card-title"
              placeholder="Titre de la carte"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && onSubmit()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="card-desc">Description</Label>
            <Textarea
              id="card-desc"
              placeholder="Notes, détails…"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Priorité</Label>
            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {offers.length > 0 && (
            <div className="grid gap-2">
              <Label>Offres associées (optionnel)</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {offers.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`offer-${o.id}`}
                      checked={jobOfferIds.includes(o.id)}
                      onCheckedChange={(c) => toggleOffer(o.id, !!c)}
                    />
                    <label
                      htmlFor={`offer-${o.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {o.title}
                      {o.company && (
                        <span className="text-muted-foreground ml-1">
                          — {o.company}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!title.trim() || isPending || disabled}
          >
            {isPending ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
