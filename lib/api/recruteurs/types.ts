export interface Recruteur {
  id: string;
  userId: string;
  type: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
