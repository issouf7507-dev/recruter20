import { prisma } from "@/lib/prisma";
import type { Document, CreateDocumentData } from "./types";

/**
 * Repository for documents - Database operations
 */
export class DocumentRepository {
  /**
   * Find all documents for a candidate
   */
  async findByCandidatId(candidatId: string): Promise<Document[]> {
    return prisma.document.findMany({
      where: { candidatId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find document by ID with candidat relation
   */
  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        candidat: true,
      },
    });
  }

  /**
   * Create a new document
   */
  async create(data: CreateDocumentData): Promise<Document> {
    return prisma.document.create({
      data: {
        candidatId: data.candidatId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        documentType: data.documentType,
      },
    });
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    await prisma.document.delete({
      where: { id },
    });
  }

  /**
   * Update candidat CV or letter URL
   */
  async updateCandidatFile(
    candidatId: string,
    type: "cv" | "lettre",
    url: string,
  ) {
    return prisma.candidat.update({
      where: { id: candidatId },
      data: type === "cv" ? { cv: url } : { letterm: url },
    });
  }
}

export const documentRepository = new DocumentRepository();
