import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeAccepted = searchParams.get("include_accepted") === "true";

    // Build query string for backend request
    const queryParams = new URLSearchParams();
    if (includeAccepted) {
      queryParams.append("include_accepted", "true");
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/invites/list${queryString ? `?${queryString}` : ""}`;

    const response = await backendApiRequest(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to fetch invites",
        message: "Unable to retrieve invitation list",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/list GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch invites",
      },
      { status: 500 }
    );
  }
}