import { NextRequest, NextResponse } from "next/server";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import { auth } from "@/lib/auth";
import type {
  CreateKanbanColumnData,
  ApiResponse,
} from "@/lib/api/kanban/types";

/**
 * GET /api/kanban/columns
 * Get all columns for a recruteur and job offer
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const recruteurId = searchParams.get("recruteurId");

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "recruteurId is required" },
        { status: 400 }
      );
    }

    // Get all columns with their cards
    const result = await kanbanRepository.findColumnsByRecruteur(recruteurId);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching kanban columns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch kanban columns",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kanban/columns
 * Create a new column
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      recruteurId,
      ...data
    }: CreateKanbanColumnData & { recruteurId: string } = body;

    if (!recruteurId || !data.name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Kanban is independent of offers, but schema requires jobOfferId
    // Use empty string as placeholder
    const column = await kanbanRepository.createColumn(recruteurId, {
      ...data,
      jobOfferId: data.jobOfferId || "",
    });

    const result: ApiResponse<typeof column> = {
      success: true,
      data: column,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating kanban column:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create kanban column",
      },
      { status: 500 }
    );
  }
}
