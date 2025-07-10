import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const response = await backendApiRequest("/api/v1/focus-modes/icons", {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch focus mode icons",
          message: data.message || "Unable to fetch focus mode icons",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/focus-modes/icons GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch focus mode icons",
      },
      { status: 500 }
    );
  }
}