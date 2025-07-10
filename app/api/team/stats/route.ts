import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const response = await backendApiRequest("/api/v1/team/stats", {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch team stats",
          message: data.message || "Unable to fetch team statistics",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/team/stats GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch team statistics",
      },
      { status: 500 }
    );
  }
}