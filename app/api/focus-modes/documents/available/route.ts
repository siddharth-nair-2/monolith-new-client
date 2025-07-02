import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query parameters for backend request
    const backendParams = new URLSearchParams();
    
    // Copy search parameters
    ["page", "page_size", "search", "exclude_focus_mode_id"].forEach((param) => {
      const value = searchParams.get(param);
      if (value !== null) {
        backendParams.append(param, value);
      }
    });

    // Handle array parameters for mime types
    const mimeTypes = searchParams.getAll("mime_type");
    mimeTypes.forEach((type) => {
      backendParams.append("mime_type", type);
    });

    const response = await backendApiRequest(
      `/api/v1/focus-modes/documents/available?${backendParams.toString()}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch available documents",
          message: data.message || "Unable to fetch available documents",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/focus-modes/documents/available GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch available documents",
      },
      { status: 500 }
    );
  }
}