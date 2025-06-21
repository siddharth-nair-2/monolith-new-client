import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      console.error("FASTAPI_BASE_URL environment variable is not set.");
      return NextResponse.json(
        { error: "Internal server configuration error." },
        { status: 500 }
      );
    }

    const apiUrl = `${fastapiBaseUrl}/api/v1/invites/validate?token=${encodeURIComponent(token)}`;

    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: backendData.detail || "Invalid invite token",
          message: backendData.message || "Validation failed",
        },
        { status: backendResponse.status }
      );
    }

    // Transform backend response to match frontend expectations
    return NextResponse.json({
      companyName: backendData.company_name,
      inviterName: backendData.inviter_name,
      inviterEmail: backendData.inviter_email,
      email: backendData.email,
      role: backendData.role,
      customMessage: backendData.custom_message,
      expiresAt: backendData.expires_at,
      isExpired: backendData.is_expired || false,
      isUsed: backendData.is_used || false,
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/validate error:", error);
    
    let errorMessage = "Internal server error";
    if (error.name === "TypeError" && error.message.includes("fetch failed")) {
      errorMessage = "Could not connect to backend service";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}