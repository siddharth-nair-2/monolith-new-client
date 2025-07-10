import { cookies } from "next/headers";

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

// Request queue to hold requests during token refresh
interface QueuedRequest {
  resolve: (response: Response) => void;
  reject: (error: any) => void;
  url: string;
  options: ApiRequestOptions;
}

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

// Process queued requests after refresh
function processQueue(error: Error | null = null) {
  const queue = [...requestQueue];
  requestQueue = [];
  
  queue.forEach(({ resolve, reject, url, options }) => {
    if (error) {
      reject(error);
    } else {
      // Retry the request
      authApiRequest(url, options).then(resolve).catch(reject);
    }
  });
}

// Server-side auth-aware API request function
export async function authApiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("auth_token");
  const refreshToken = cookieStore.get("refresh_token");

  const headers = new Headers(options.headers);

  // Add auth header if token exists and not skipping auth
  if (!options.skipAuth && accessToken?.value) {
    headers.set("Authorization", `Bearer ${accessToken.value}`);
  }

  // Make the initial request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 responses
  if (response.status === 401 && refreshToken?.value && !options.skipAuth) {
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, url, options });
      });
    }

    isRefreshing = true;

    try {
      // Attempt to refresh token
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
          maxAge: 60 * 60, // 1 hour for access token
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

        // Process any queued requests
        processQueue();
      } else {
        // Refresh failed - clear tokens
        cookieStore.delete("auth_token");
        cookieStore.delete("refresh_token");
        
        // Process queue with error
        processQueue(new Error('Token refresh failed'));
      }
    } catch (refreshError) {
      console.error('Token refresh error:', refreshError);
      
      // Clear tokens on error
      cookieStore.delete("auth_token");
      cookieStore.delete("refresh_token");
      
      // Process queue with error
      processQueue(refreshError as Error);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// Helper function for making backend API requests
export async function backendAuthApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const baseUrl = process.env.FASTAPI_BASE_URL;
  if (!baseUrl) {
    throw new Error("FASTAPI_BASE_URL is not configured");
  }

  const url = `${baseUrl}${endpoint}`;
  return authApiRequest(url, options);
}

// Type-safe wrapper for JSON responses
export async function authApiRequestJson<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<{ data?: T; error?: any; response: Response }> {
  try {
    const response = await authApiRequest(url, options);
    
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