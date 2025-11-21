import type {
  Recruteur,
  ApiResponse,
  RecruteurInformation,
  RecruteurInformationEntreprise,
} from "./types";

/**
 * Fetch recruteur by userId
 */
export async function fetchRecruteurByUserId(
  userId: string
): Promise<Recruteur | null> {
  try {
    const response = await fetch(`/api/recruteurs?userId=${userId}`);

    // If 404, user is not a recruteur (could be a collaborateur), return null silently
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch recruteur: ${response.statusText}`);
    }

    const result: ApiResponse<Recruteur> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching recruteur:", error);
    return null;
  }
}

/**
 * Fetch recruteur by ID
 */
export async function fetchRecruteurById(
  id: string
): Promise<Recruteur | null> {
  try {
    const response = await fetch(`/api/recruteurs/${id}`);
    const result: ApiResponse<Recruteur> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching recruteur:", error);
    return null;
  }
}

/**
 * Update recruteur information
 */
export async function updateRecruteurInformation(
  id: string,
  data: RecruteurInformation
): Promise<ApiResponse<Recruteur>> {
  const response = await fetch(`/api/recruteurs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result: ApiResponse<Recruteur> = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to update recruteur information");
  }
  return result;
}

export async function updateRecruteurInformationEntreprise(
  id: string,
  data: RecruteurInformationEntreprise
): Promise<ApiResponse<Recruteur>> {
  const response = await fetch(`/api/recruteurs/${id}/companyinfo`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result: ApiResponse<Recruteur> = await response.json();
  if (!result.success) {
    throw new Error(
      result.error || "Failed to update recruteur information entreprise"
    );
  }
  return result;
}
