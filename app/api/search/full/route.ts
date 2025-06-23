import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const fullSearchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(100).default(20),
  include_summary: z.boolean().default(true),
  filters: z.record(z.array(z.string())).nullable().optional(),
});

type FullSearchRequest = z.infer<typeof fullSearchSchema>;

interface FullSearchResponse {
  results: Array<Record<string, any>>;
  total_results: number;
  query_time_ms: number;
  search_type?: string;
}

export async function POST(request: Request): Promise<NextResponse<FullSearchResponse | { error: string; message?: string }>> {
  try {
    const body: unknown = await request.json();

    const validationResult = fullSearchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: validationResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/search/full", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validationResult.data),
    });

    const data: FullSearchResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: (data as any).detail || "Search failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/search/full error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}