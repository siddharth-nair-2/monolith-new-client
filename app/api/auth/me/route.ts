import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("auth_token");
    const refreshToken = cookieStore.get("refresh_token");

    if (!accessToken?.value) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_AUTH_TOKEN",
          message: "Not authenticated",
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

    const apiUrl = `${fastapiBaseUrl}/api/v1/auth/me`;

    // Call backend /me endpoint
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken.value}`,
      },
    });

    if (!backendResponse.ok) {
      // If 401, don't immediately clear tokens - let the client handle refresh
      if (backendResponse.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "TOKEN_EXPIRED",
            message: "Token expired",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to get user info",
          message: "Unable to retrieve user information",
        },
        { status: backendResponse.status }
      );
    }

    const userData = await backendResponse.json();

    // Calculate token expiration (1 hour from now if not provided)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Return user data with tokens
    return NextResponse.json({
      success: true,
      user: userData,
      access_token: accessToken.value,
      has_refresh_token: !!refreshToken?.value,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("API /api/auth/me error:", error);

    let errorMessage = "Unable to retrieve user information";
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