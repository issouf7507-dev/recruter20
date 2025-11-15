export interface CreateConversationData {
  recruteurId: string;
  candidatId: string;
  jobOfferId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  isNew?: boolean;
}
