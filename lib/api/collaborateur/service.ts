import type { ApiResponse, Collaborateur } from "./types";

/**
 * Fetch recruteur by userId
 */
export async function fetchCollaborateurByUserId(
  userId: string
): Promise<Collaborateur | null> {
  try {
    const response = await fetch(`/api/collaborateur?userId=${userId}`);
    const result: ApiResponse<Collaborateur> = await response.json();

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
export async function fetchCollaborateurById(
  id: string
): Promise<Collaborateur | null> {
  try {
    const response = await fetch(`/api/collaborateur/${id}`);
    const result: ApiResponse<Collaborateur> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching recruteur:", error);
    return null;
  }
}
