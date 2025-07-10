import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token");

    if (!refreshToken?.value) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_REFRESH_TOKEN",
          message: "No refresh token provided",
        },
        { status: 401 }
      );
    }

    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration error",
          message: "Server is not properly configured",
        },
        { status: 500 }
      );
    }

    const apiUrl = `${fastapiBaseUrl}/api/v1/auth/refresh`;

    // Call backend refresh endpoint
    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken.value }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Clear invalid tokens
      cookieStore.delete("auth_token");
      cookieStore.delete("refresh_token");

      const errorData = backendData.error || {};
      const errorMessage = errorData.message || "Token refresh failed";

      return NextResponse.json(
        {
          success: false,
          error: errorData.code || "REFRESH_FAILED",
          message: errorMessage,
          statusCode: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    // Extract new tokens from backend response
    const { access_token, refresh_token: new_refresh_token } = backendData;

    if (!access_token || !new_refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_RESPONSE",
          message: "Invalid token response from server",
        },
        { status: 500 }
      );
    }

    // Update tokens in cookies
    cookieStore.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour for access token
    });

    cookieStore.set("refresh_token", new_refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days for refresh token
    });

    // Return success with new tokens
    return NextResponse.json({
      success: true,
      access_token,
      refresh_token: new_refresh_token,
      expires_at: backendData.expires_at,
    });
  } catch (error: any) {
    console.error("API /api/auth/refresh error:", error);

    // Clear tokens on error
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("refresh_token");

    let errorMessage = "Unable to refresh authentication";
    if (error.name === "TypeError" && error.message.includes("fetch failed")) {
      errorMessage = "Backend service is unavailable";
    }

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}