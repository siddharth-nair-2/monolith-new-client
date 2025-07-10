import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const response = await backendApiRequest("/api/v1/focus-modes/", {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch focus modes",
          message: data.message || "Unable to fetch focus modes",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/focus-modes GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch focus modes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await backendApiRequest("/api/v1/focus-modes/", {
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
          error: data.detail || "Failed to create focus mode",
          message: data.message || "Unable to create focus mode",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("API /api/focus-modes POST error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to create focus mode",
      },
      { status: 500 }
    );
  }
}