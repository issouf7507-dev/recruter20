"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUnlinkedApplications, useImportApplicationAsCard } from "@/lib/hooks/use-kanban";
import { IconSearch } from "@tabler/icons-react";

interface Column { id: string; titre: string }

interface Props {
  open: boolean;
  onClose: () => void;
  recruteurId: string;
  columns: Column[];
}

export function ImportApplicationsDialog({ open, onClose, recruteurId, columns }: Props) {
  const { data: applications = [], isLoading } = useUnlinkedApplications(
    open ? recruteurId : undefined
  );
  const importApp = useImportApplicationAsCard();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetColumnId, setTargetColumnId] = useState<string>("");
  const [search, setSearch] = useState("");

  function toggle(id: string, checked: boolean) {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
  }

  function handleClose() {
    setSelectedIds([]);
    setTargetColumnId("");
    setSearch("");
    onClose();
  }

  async function handleImport() {
    if (!targetColumnId || selectedIds.length === 0) return;
    for (const applicationId of selectedIds) {
      await importApp.mutateAsync({ applicationId, columnId: targetColumnId, recruteurId });
    }
    handleClose();
  }

  const filtered = applications.filter((app) => {
    const name =
      app.candidat?.user?.name ||
      `${app.candidat?.prenom || ""} ${app.candidat?.nom || ""}`.trim();
    return (
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      app.jobOffer?.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des candidatures</DialogTitle>
          <DialogDescription>
            Sélectionnez les candidatures à ajouter au Kanban.{" "}
            {applications.length === 0 && !isLoading
              ? "Toutes vos candidatures sont déjà dans le Kanban."
              : `${applications.length} candidature(s) disponible(s).`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Colonne cible</Label>
            <Select value={targetColumnId} onValueChange={setTargetColumnId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une colonne…" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.titre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {applications.length > 0 && (
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Rechercher un candidat ou un poste…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {search ? "Aucun résultat" : "Aucune candidature à importer"}
            </p>
          ) : (
            <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
              {filtered.map((app) => {
                const name =
                  app.candidat?.user?.name ||
                  `${app.candidat?.prenom || ""} ${app.candidat?.nom || ""}`.trim() ||
                  "Candidat";
                const initials = name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={app.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                    <Checkbox
                      id={`import-${app.id}`}
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={(c) => toggle(app.id, !!c)}
                    />
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={app.candidat?.user?.image || ""} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <label htmlFor={`import-${app.id}`} className="flex-1 cursor-pointer min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.jobOffer?.title}</p>
                    </label>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button
            onClick={handleImport}
            disabled={
              !targetColumnId ||
              selectedIds.length === 0 ||
              importApp.isPending
            }
          >
            {importApp.isPending
              ? "Import…"
              : `Importer ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
