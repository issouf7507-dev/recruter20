import { useQuery } from "@tanstack/react-query";
import { searchCandidates } from "@/lib/api/candidats/service";

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
