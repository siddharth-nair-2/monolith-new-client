import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("auth_token");
  const refreshToken = cookieStore.get("refresh_token");

  const headers = new Headers(options.headers);

  // Add auth headers if tokens exist and not skipping auth
  if (!options.skipAuth) {
    if (accessToken?.value) {
      headers.set("Authorization", `Bearer ${accessToken.value}`);
    }
    if (refreshToken?.value) {
      headers.set("X-Refresh-Token", refreshToken.value);
    }
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for new tokens in response headers
  const newAccessToken = response.headers.get("X-New-Access-Token");
  const newRefreshToken = response.headers.get("X-New-Refresh-Token");

  if (newAccessToken && newRefreshToken) {
    // Update stored tokens
    cookieStore.set("auth_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    cookieStore.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  return response;
}

// Helper function for making backend API requests
export async function backendApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const baseUrl = process.env.FASTAPI_BASE_URL;
  if (!baseUrl) {
    throw new Error("FASTAPI_BASE_URL is not configured");
  }

  const url = `${baseUrl}${endpoint}`;
  return apiRequest(url, options);
}

// Type-safe wrapper for JSON responses
export async function apiRequestJson<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<{ data?: T; error?: any; response: Response }> {
  try {
    const response = await apiRequest(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      return { error, response };
    }

    const data = await response.json();
    return { data, response };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : "Network error",
      },
      response: new Response(null, { status: 500 }),
    };
  }
}