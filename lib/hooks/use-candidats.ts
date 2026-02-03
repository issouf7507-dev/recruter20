import { useQuery } from "@tanstack/react-query";
import {
  searchCandidates,
  getCandidatsFacets,
} from "@/lib/api/candidats/service";

/**
 * Hook to search candidates with filters
 */
export function useSearchCandidates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  lieu?: string;
  experience?: string;
  competences?: string[];
  certifications?: string[];
  domaine?: string;
  niveauEtude?: string[];
  format?: string;
}) {
  return useQuery({
    queryKey: ["candidates", "search", params],
    queryFn: () => searchCandidates(params),
    enabled: true, // Always enabled, can search without filters
  });
}

/**
 * Hook to get filter facets (distinct lieux, competences, certifications)
 * so filter dropdowns search across ALL candidates, not only the current page.
 */
export function useCandidatsFacets() {
  return useQuery({
    queryKey: ["candidates", "facets"],
    queryFn: getCandidatsFacets,
  });
}
