import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unauthorized(message = "Non autorisé") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Accès refusé") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(resource: string) {
  return NextResponse.json(
    { success: false, error: `${resource} introuvable` },
    { status: 404 },
  );
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

type RouteHandler = (req: Request, ctx: unknown) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode },
        );
      }
      logger.error("[API Error]", { error: String(error) });
      return NextResponse.json(
        { success: false, error: "Erreur interne du serveur" },
        { status: 500 },
      );
    }
  };
}
