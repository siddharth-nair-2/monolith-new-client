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
  let accessToken = cookieStore.get("auth_token");
  const refreshToken = cookieStore.get("refresh_token");

  const headers = new Headers(options.headers);

  // Add auth header if token exists and not skipping auth
  if (!options.skipAuth && accessToken?.value) {
    headers.set("Authorization", `Bearer ${accessToken.value}`);
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we have refresh token, try to refresh once
  if (response.status === 401 && refreshToken?.value && !options.skipAuth) {
    try {
      // Call refresh endpoint
      const refreshResponse = await fetch(`${process.env.FASTAPI_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken.value })
      });

      if (refreshResponse.ok) {
        const { access_token, refresh_token: new_refresh_token } = await refreshResponse.json();
        
        // Update stored tokens
        cookieStore.set("auth_token", access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: process.env.NODE_ENV === "development" ? 30 : 60 * 60, // 30 seconds in dev, 1 hour in prod
        });

        cookieStore.set("refresh_token", new_refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days for refresh token
        });

        // Retry original request with new token
        headers.set("Authorization", `Bearer ${access_token}`);
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
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