import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const fullSearchSchema = z.object({
  query: z.string().min(1).max(500),
  page: z.number().min(1).optional().default(1),
  size: z.number().min(1).max(100).optional().default(20),
  limit: z.number().min(1).max(100).optional().default(20),
  include_summary: z.boolean().optional().default(true),
  filters: z.object({
    document_type: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
  }).optional(),
  sort_by: z.enum(["relevance", "date", "name"]).optional().default("relevance"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
  relevance_threshold: z.number().min(0).max(1).optional().default(0.1),
});

type FullSearchRequest = z.infer<typeof fullSearchSchema>;

interface FullSearchResponse {
  results: Array<Record<string, any>>;
  total: number;
  total_results: number;
  query_time_ms: number;
  search_type?: string;
  has_more?: boolean;
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

    // Transform the request to match backend expectations
    const backendRequest = {
      query: validationResult.data.query,
      limit: validationResult.data.limit || validationResult.data.size || 20,
      include_summary: validationResult.data.include_summary,
      filters: validationResult.data.filters && Object.keys(validationResult.data.filters).length > 0 
        ? validationResult.data.filters 
        : undefined,
      relevance_threshold: validationResult.data.relevance_threshold,
    };

    const response = await backendApiRequest("/api/v1/search/full", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Search failed" },
        { status: response.status }
      );
    }

    // Transform backend response to match frontend expectations
    const transformedResponse: FullSearchResponse = {
      results: data.results || [],
      total: data.total_results || 0,
      total_results: data.total_results || 0,
      query_time_ms: data.query_time_ms || 0,
      search_type: data.search_type || "hybrid",
      has_more: data.results ? data.results.length >= (validationResult.data.limit || 20) : false,
    };

    return NextResponse.json(transformedResponse, { status: 200 });
  } catch (error: unknown) {
    console.error("API /api/search/full error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}