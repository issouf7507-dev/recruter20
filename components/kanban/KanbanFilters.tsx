"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { IconFilter } from "@tabler/icons-react";
import { useLabels } from "@/lib/hooks/use-kanban";
import { useCollaborateurs } from "@/lib/hooks/use-collaborateurs";

export interface KanbanFiltersState {
  labelIds: string[];
  memberIds: string[];
  overdueOnly: boolean;
}

export const EMPTY_KANBAN_FILTERS: KanbanFiltersState = {
  labelIds: [],
  memberIds: [],
  overdueOnly: false,
};

interface Props {
  recruteurId: string;
  filters: KanbanFiltersState;
  onChange: (filters: KanbanFiltersState) => void;
}

export function KanbanFilters({ recruteurId, filters, onChange }: Props) {
  const { data: labels = [] } = useLabels(recruteurId);
  const { data: collaborateurs = [] } = useCollaborateurs(recruteurId);

  const activeCount =
    filters.labelIds.length + filters.memberIds.length + (filters.overdueOnly ? 1 : 0);

  function toggleLabel(id: string, checked: boolean) {
    onChange({
      ...filters,
      labelIds: checked ? [...filters.labelIds, id] : filters.labelIds.filter((x) => x !== id),
    });
  }

  function toggleMember(id: string, checked: boolean) {
    onChange({
      ...filters,
      memberIds: checked ? [...filters.memberIds, id] : filters.memberIds.filter((x) => x !== id),
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <IconFilter className="h-4 w-4 mr-1.5" /> Filtres
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Filtres</p>
            {activeCount > 0 && (
              <Button
                variant="ghost" size="sm" className="h-7 text-xs"
                onClick={() => onChange(EMPTY_KANBAN_FILTERS)}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <Label className="text-sm font-normal cursor-pointer">Échéance dépassée</Label>
            <Checkbox
              checked={filters.overdueOnly}
              onCheckedChange={(c) => onChange({ ...filters, overdueOnly: !!c })}
            />
          </label>

          {labels.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Labels</p>
              {labels.map((label) => (
                <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.labelIds.includes(label.id)}
                    onCheckedChange={(c) => toggleLabel(label.id, !!c)}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </label>
              ))}
            </div>
          )}

          {collaborateurs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Membres</p>
              {collaborateurs.map((collab) => (
                <label key={collab.userId} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.memberIds.includes(collab.userId)}
                    onCheckedChange={(c) => toggleMember(collab.userId, !!c)}
                  />
                  <span className="text-sm">{collab.user?.name || collab.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
