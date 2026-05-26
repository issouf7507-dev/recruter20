import { Conversation } from "../candidats";
import type { CreateConversationData, ApiResponse } from "./types";

/**
 * Fetch all offers
 */
// export async function fetchOffers(params?: {
//   page?: number;
//   limit?: number;
//   recruteurId?: string;
//   search?: string;
//   etat?: string;
// }): Promise<PaginatedResponse<JobOffer>> {
//   const queryParams = new URLSearchParams();
//   if (params?.page) queryParams.set("page", params.page.toString());
//   if (params?.limit) queryParams.set("limit", params.limit.toString());
//   if (params?.recruteurId) queryParams.set("recruteurId", params.recruteurId);
//   if (params?.search) queryParams.set("search", params.search);
//   if (params?.etat) queryParams.set("etat", params.etat);

//   const response = await fetch(`/api/offres?${queryParams.toString()}`);
//   const result: ApiResponse<PaginatedResponse<JobOffer>> =
//     await response.json();

//   if (!result.success || !result.data) {
//     throw new Error(result.error || "Failed to fetch offers");
//   }

//   return result.data;
// }

/**
 * Fetch a single offer by ID
 */
// export async function fetchOffer(id: string): Promise<JobOffer> {
//   const response = await fetch(`/api/offres/${id}`);
//   const result: ApiResponse<JobOffer> = await response.json();

//   if (!result.success || !result.data) {
//     throw new Error(result.error || "Failed to fetch offer");
//   }

//   return result.data;
// }

/**
 * Create a new offer
 */
export async function createConversation(
  data: CreateConversationData
): Promise<Conversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recruteurId: data.recruteurId,
      candidatId: data.candidatId,
      jobOfferId: data.jobOfferId,
    }),
  });

  const result: ApiResponse<Conversation> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to create offer");
  }

  return result.data;
}

/**
 * Update an offer
 */
// export async function updateOffer(
//   id: string,
//   data: Partial<CreateOfferData>
// ): Promise<JobOffer> {
//   const response = await fetch(`/api/offres/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       title: data.titre,
//       company: data.entreprise,
//       type: data.typeContrat,
//       location: data.lieu,
//       salaryMin: data.salaireMin,
//       salaryMax: data.salaireMax,
//       description: data.description,
//       requirements: data.profilRecherche,
//       skills: data.competences,
//       benefits: data.avantages,
//       duedate: data.duedate,
//     }),
//   });

//   const result: ApiResponse<JobOffer> = await response.json();

//   if (!result.success || !result.data) {
//     throw new Error(result.error || "Failed to update offer");
//   }

//   return result.data;
// }

/**
 * Delete an offer
 */
// export async function deleteOffer(id: string): Promise<void> {
//   const response = await fetch(`/api/offres/${id}`, {
//     method: "DELETE",
//   });

//   const result: ApiResponse<void> = await response.json();

//   if (!result.success || !result.data) {
//     throw new Error(result.error || "Failed to delete offer");
//   }
// }
