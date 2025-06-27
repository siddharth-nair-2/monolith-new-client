import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate query parameter
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    // Prepare search payload with defaults for instant search
    const searchPayload = {
      query: body.query.trim(),
      limit: body.limit || 5, // Lower limit for instant search
      filters: body.filters || undefined,
    };

    const response = await backendApiRequest("/api/v1/search/instant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Search failed",
          message: data.message || "Unable to perform instant search",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/search/instant error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to perform instant search",
      },
      { status: 500 }
    );
  }
}