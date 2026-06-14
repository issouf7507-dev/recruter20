"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { KanbanColumn } from "@/lib/hooks/use-kanban";

const COLUMN_COLORS = [
  { value: "bg-gray-50 border-gray-200", label: "Gris" },
  { value: "bg-blue-50 border-blue-200", label: "Bleu" },
  { value: "bg-green-50 border-green-200", label: "Vert" },
  { value: "bg-yellow-50 border-yellow-200", label: "Jaune" },
  { value: "bg-red-50 border-red-200", label: "Rouge" },
  { value: "bg-purple-50 border-purple-200", label: "Violet" },
  { value: "bg-pink-50 border-pink-200", label: "Rose" },
  { value: "bg-orange-50 border-orange-200", label: "Orange" },
];

const MAPPED_STATUSES = [
  { value: "", label: "Aucun (colonne générique)" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_REVISION", label: "En révision" },
  { value: "ACCEPTE", label: "Accepté" },
  { value: "REFUSE", label: "Refusé" },
];

interface CreateColumnDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
  color: string;
  onColorChange: (v: string) => void;
  maxCards: string;
  onMaxCardsChange: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateColumnDialog({
  open, onOpenChange, name, onNameChange, color, onColorChange,
  maxCards, onMaxCardsChange, onSubmit, isPending,
}: CreateColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une colonne</DialogTitle>
          <DialogDescription>Ajoutez une nouvelle étape à votre pipeline</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="col-name">Nom</Label>
            <Input
              id="col-name"
              placeholder="Ex : CV reçu, Entretien RH, Proposition…"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
          </div>
          <div className="grid gap-2">
            <Label>Couleur</Label>
            <Select value={color} onValueChange={onColorChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLUMN_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="col-max-cards">Limite WIP (optionnel)</Label>
            <Input
              id="col-max-cards"
              type="number"
              min={1}
              placeholder="Ex : 5"
              value={maxCards}
              onChange={(e) => onMaxCardsChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Création…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditColumnDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  column: KanbanColumn | null;
  name: string;
  onNameChange: (v: string) => void;
  color: string;
  onColorChange: (v: string) => void;
  mappedStatus: string;
  onMappedStatusChange: (v: string) => void;
  maxCards: string;
  onMaxCardsChange: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function EditColumnDialog({
  open, onOpenChange, column, name, onNameChange, color, onColorChange,
  mappedStatus, onMappedStatusChange, maxCards, onMaxCardsChange, onSubmit, isPending,
}: EditColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la colonne</DialogTitle>
          <DialogDescription>Modifier le nom, la couleur et le statut mappé</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Couleur</Label>
            <Select value={color} onValueChange={onColorChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLUMN_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Statut candidature mappé</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Glisser une candidature sur cette colonne mettra son statut à jour automatiquement.
            </p>
            <Select value={mappedStatus} onValueChange={onMappedStatusChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MAPPED_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-col-max-cards">Limite WIP (optionnel)</Label>
            <Input
              id="edit-col-max-cards"
              type="number"
              min={1}
              placeholder="Ex : 5"
              value={maxCards}
              onChange={(e) => onMaxCardsChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  column: KanbanColumn | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteColumnDialog({
  open, onOpenChange, column, onConfirm, isPending,
}: DeleteColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer la colonne</DialogTitle>
          <DialogDescription>
            La colonne <strong>{column?.name}</strong> et toutes ses cartes seront supprimées définitivement.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
