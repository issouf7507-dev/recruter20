import { DocumentType } from "@/app/generated/prisma";

export interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  candidatId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentData {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  candidatId: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    document: Document;
    url: string;
  };
  error?: string;
}

export type { ApiResponse } from "../types";
