import { documentRepository } from "./repository";
import type { CreateDocumentData } from "./types";

/**
 * Service layer for documents - Business logic
 */
export class DocumentService {
  /**
   * Get all documents for a candidate
   */
  async getDocumentsByCandidatId(candidatId: string) {
    return documentRepository.findByCandidatId(candidatId);
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string) {
    return documentRepository.findById(id);
  }

  /**
   * Create a new document
   */
  async createDocument(data: CreateDocumentData) {
    // Validation
    if (!data.candidatId || !data.fileName || !data.fileUrl) {
      throw new Error("Missing required fields: candidatId, fileName, fileUrl");
    }

    const document = await documentRepository.create(data);

    // Update candidat profile if it's a CV or letter
    if (data.documentType === "cv" || data.documentType === "lettre") {
      await documentRepository.updateCandidatFile(
        data.candidatId,
        data.documentType,
        data.fileUrl
      );
    }

    return document;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string) {
    const document = await documentRepository.findById(id);
    if (!document) {
      throw new Error("Document not found");
    }

    return documentRepository.delete(id);
  }

  /**
   * Check if user owns the document
   */
  async checkOwnership(documentId: string, userId: string): Promise<boolean> {
    const document = await documentRepository.findById(documentId);
    return document?.candidat.userId === userId;
  }
}

export const documentService = new DocumentService();
