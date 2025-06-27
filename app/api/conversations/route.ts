import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "20";
    const includeArchived = searchParams.get("include_archived") === "true";

    const response = await backendApiRequest(`/api/v1/conversations/?page=${page}&page_size=${pageSize}&include_archived=${includeArchived}`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch conversations",
          message: data.message || "Unable to fetch conversations",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/conversations GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch conversations",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await backendApiRequest("/api/v1/conversations/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to create conversation",
          message: data.message || "Unable to create conversation",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("API /api/conversations POST error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to create conversation",
      },
      { status: 500 }
    );
  }
}