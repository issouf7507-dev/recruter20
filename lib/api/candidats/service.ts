import type { ApiResponse, Candidat } from "./types";
import type { PaginatedResponse } from "../offres/types";

/**
 * Search candidates with filters
 */
export async function searchCandidates(params?: {
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
}): Promise<PaginatedResponse<any>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.search) queryParams.set("search", params.search);
  if (params?.lieu) queryParams.set("lieu", params.lieu);
  if (params?.experience) queryParams.set("experience", params.experience);
  if (params?.competences && params.competences.length > 0) {
    params.competences.forEach((comp) => {
      queryParams.append("competences", comp);
    });
  }
  if (params?.certifications && params.certifications.length > 0) {
    params.certifications.forEach((cert) => {
      queryParams.append("certifications", cert);
    });
  }
  if (params?.domaine) queryParams.set("domaine", params.domaine);
  if (params?.niveauEtude && params.niveauEtude.length > 0) {
    params.niveauEtude.forEach((niveau) => {
      queryParams.append("niveauEtude", niveau);
    });
  }
  if (params?.format) queryParams.set("format", params.format);

  const response = await fetch(`/api/candidats?${queryParams.toString()}`);
  const result: ApiResponse<PaginatedResponse<any>> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to search candidates");
  }

  return result.data;
}

/**
 * Get distinct filter values (facets) for all candidates
 */
export async function getCandidatsFacets(): Promise<{
  lieux: string[];
  competences: string[];
  certifications: string[];
}> {
  const response = await fetch("/api/candidats/facets");
  const result: ApiResponse<{
    lieux: string[];
    competences: string[];
    certifications: string[];
  }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch facets");
  }

  return result.data;
}

/**
 * Update a candidat
 */
export async function updateCandidat(
  id: string,
  data: Partial<Candidat>
): Promise<ApiResponse<Candidat>> {
  const response = await fetch(`/api/candidats/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nom: data.nom ?? undefined,
      prenom: data.prenom ?? undefined,
      telephone: data.telephone ?? undefined,
      cv: data.cv ?? undefined,
      letterm: data.letterm ?? undefined,
      bio: data.bio ?? undefined,
      adresse: data.adresse ?? undefined,
      ville: data.ville ?? undefined,
      statut: data.statut ?? undefined,
      pays: data.pays ?? undefined,
      dateNaissance: data.dateNaissance ?? undefined,
      nationalite: data.nationalite ?? undefined,
      situationFamiliale: data.situationFamiliale ?? undefined,
      permisConduire: data.permisConduire ?? undefined,
      image: data.image ?? undefined,
      competences: data.competences ?? undefined,
      certifications: data.certifications ?? undefined,
      linkedinUrl: data.linkedinUrl ?? undefined,
      domaine: data.domaine ?? undefined,
      portfolioUrl: data.portfolioUrl ?? undefined,
      niveauxEtude: data.niveauxEtude ?? undefined,
    }),
  });

  const result: ApiResponse<Candidat> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update candidat");
  }

  return result;
}
