import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";
import { z } from "zod";

// Validation schema for query parameters
const documentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  source_types: z.array(z.string()).optional(),
  processing_statuses: z.array(z.string()).optional(),
  search: z.string().optional(),
  exclude_failed: z.boolean().default(true),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  extensions: z.array(z.string()).optional(),
  mime_types: z.array(z.string()).optional(),
  author: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  topic_ids: z.array(z.string()).optional(),
  has_chunks: z.boolean().optional(),
  has_errors: z.boolean().optional(),
  sort_by: z.enum(["created_at", "updated_at", "name", "file_size_bytes", "file_created_at", "file_modified_at"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const queryObject: any = {
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      search: searchParams.get("search"),
      exclude_failed: searchParams.get("exclude_failed"),
      created_after: searchParams.get("created_after"),
      created_before: searchParams.get("created_before"),
      author: searchParams.get("author"),
      sort_by: searchParams.get("sort_by"),
      sort_order: searchParams.get("sort_order"),
    };

    // Handle array parameters
    const arrayParams = [
      "source_types",
      "processing_statuses",
      "extensions",
      "mime_types",
      "keywords",
      "category_ids",
      "topic_ids",
    ];

    arrayParams.forEach((param) => {
      const values = searchParams.getAll(param);
      if (values.length > 0) {
        queryObject[param] = values;
      }
    });

    // Handle boolean parameters
    const booleanParams = ["has_chunks", "has_errors"];
    booleanParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value !== null) {
        queryObject[param] = value === "true";
      }
    });

    // Remove null values
    Object.keys(queryObject).forEach((key) => {
      if (queryObject[key] === null || queryObject[key] === undefined) {
        delete queryObject[key];
      }
    });

    // Validate query parameters
    const validationResult = documentsQuerySchema.safeParse(queryObject);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Build query string for backend request
    const backendParams = new URLSearchParams();
    Object.entries(validationResult.data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => backendParams.append(key, String(v)));
      } else if (value !== undefined) {
        backendParams.append(key, String(value));
      }
    });

    // Make request to backend
    const response = await backendApiRequest(
      `/api/v1/documents?${backendParams.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to fetch documents",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}