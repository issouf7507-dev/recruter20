import type {
  JobOffer,
  CreateOfferData,
  PaginatedResponse,
  ApiResponse,
} from "./types";

/**
 * Fetch all offers
 */
export async function fetchOffers(params?: {
  page?: number;
  limit?: number;
  recruteurId?: string;
  search?: string;
  etat?: string;
  location?: string;
  types?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  datePosted?: string;
  experience?: string[];
  experienceMin?: number;
  experienceMax?: number;
}): Promise<PaginatedResponse<JobOffer>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.recruteurId) queryParams.set("recruteurId", params.recruteurId);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.etat) queryParams.set("etat", params.etat);
  if (params?.location) queryParams.set("location", params.location);
  if (params?.types && params.types.length > 0)
    queryParams.set("types", params.types.join(","));
  if (params?.salaryMin !== undefined)
    queryParams.set("salaryMin", params.salaryMin.toString());
  if (params?.salaryMax !== undefined)
    queryParams.set("salaryMax", params.salaryMax.toString());
  if (params?.salaryCurrency)
    queryParams.set("salaryCurrency", params.salaryCurrency);
  if (params?.datePosted) queryParams.set("datePosted", params.datePosted);
  if (params?.experience && params.experience.length > 0)
    queryParams.set("experience", params.experience.join(","));
  if (params?.experienceMin !== undefined)
    queryParams.set("experienceMin", params.experienceMin.toString());
  if (params?.experienceMax !== undefined)
    queryParams.set("experienceMax", params.experienceMax.toString());

  const response = await fetch(`/api/offres?${queryParams.toString()}`);
  const result: ApiResponse<PaginatedResponse<JobOffer>> =
    await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch offers");
  }

  return result.data;
}

/**
 * Fetch a single offer by ID
 */
export async function fetchOffer(
  id: string,
  params?: {
    page?: number;
    limit?: number;
    recruteurId?: string;
    search?: string;
    etat?: string;
    location?: string;
    types?: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    datePosted?: string;
    experience?: string[];
    anneesexperience?: string;
  }
): Promise<JobOffer> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.recruteurId) queryParams.set("recruteurId", params.recruteurId);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.etat) queryParams.set("etat", params.etat);
  if (params?.location) queryParams.set("location", params.location);
  if (params?.types && params.types.length > 0)
    queryParams.set("types", params.types.join(","));
  if (params?.salaryMin !== undefined)
    queryParams.set("salaryMin", params.salaryMin.toString());
  if (params?.salaryMax !== undefined)
    queryParams.set("salaryMax", params.salaryMax.toString());
  if (params?.salaryCurrency)
    queryParams.set("salaryCurrency", params.salaryCurrency);
  if (params?.datePosted) queryParams.set("datePosted", params.datePosted);
  if (params?.experience && params.experience.length > 0)
    queryParams.set("experience", params.experience.join(","));
  if (params?.anneesexperience)
    queryParams.set("anneesexperience", params.anneesexperience);
  const queryString = queryParams.toString();
  const response = await fetch(`/api/offres/${id}?${queryString.toString()}`);
  const result: ApiResponse<JobOffer> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch offer");
  }

  return result.data;
}

/**
 * Create a new offer
 */
export async function createOffer(data: CreateOfferData): Promise<JobOffer> {
  const response = await fetch("/api/offres", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.titre,
      company: data.entreprise,
      type: data.typeContrat,
      location: data.lieu,
      salaryMin: data.salaireMin,
      salaryMax: data.salaireMax,
      description: data.description,
      requirements: data.profilRecherche,
      skills: data.competences,
      benefits: data.avantages,
      duedate: data.duedate,
      salaryCurrency: data.salaryCurrency,
      anneesexperience: data.anneesexperience,
      logo: data.logo,
    }),
  });

  const result: ApiResponse<JobOffer> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create offer");
  }

  return result.data;
}

/**
 * Update an offer
 */
export async function updateOffer(
  id: string,
  data: Partial<CreateOfferData>
): Promise<JobOffer> {
  const response = await fetch(`/api/offres/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: data.titre,
      company: data.entreprise,
      type: data.typeContrat,
      location: data.lieu,
      salaryMin: data.salaireMin,
      salaryMax: data.salaireMax,
      description: data.description,
      requirements: data.profilRecherche,
      skills: data.competences,
      benefits: data.avantages,
      duedate: data.duedate,
      logo: data.logo,
    }),
  });

  const result: ApiResponse<JobOffer> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update offer");
  }

  return result.data;
}

/**
 * Delete an offer
 */
export async function deleteOffer(id: string): Promise<void> {
  const response = await fetch(`/api/offres/${id}`, {
    method: "DELETE",
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete offer");
  }
}
