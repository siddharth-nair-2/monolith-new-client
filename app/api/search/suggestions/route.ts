import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const limit = searchParams.get("limit") || "10";

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest(
      `/api/v1/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}&field=topics`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to get suggestions",
          message: data.message || "Unable to fetch search suggestions",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/search/suggestions error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch search suggestions",
      },
      { status: 500 }
    );
  }
}