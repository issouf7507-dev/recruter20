import type { ApiResponse, Candidat } from "./types";

/**
 * Update an offer
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
    }),
  });

  const result: ApiResponse<Candidat> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update offer");
  }

  return result;
}
