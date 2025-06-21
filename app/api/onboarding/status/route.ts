import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const response = await backendApiRequest("/api/v1/onboarding/status", {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to get onboarding status",
          message: data.message || "Error retrieving onboarding progress",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/onboarding/status error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to retrieve onboarding status",
      },
      { status: 500 }
    );
  }
}