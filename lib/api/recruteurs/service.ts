import type { Recruteur, ApiResponse } from "./types";

/**
 * Fetch recruteur by userId
 */
export async function fetchRecruteurByUserId(
  userId: string
): Promise<Recruteur | null> {
  try {
    const response = await fetch(`/api/recruteurs?userId=${userId}`);
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
