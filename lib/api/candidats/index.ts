/**
 * Centralized exports for job offers API
 * Note: repository is not exported here to prevent bundling prisma in client components
 * Import repository directly from "./repository" in server-side code only
 */
export * from "./types";
export * from "./service";
// Do not export repository here - it imports prisma which should only be used server-side
// If you need repository, import it directly: import { CandidatRepository } from "@/lib/api/candidats/repository"
