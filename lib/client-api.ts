"use client";

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
async function processQueue(error: Error | null = null) {
  const queue = [...requestQueue];
  requestQueue = [];
  
  for (const { resolve, reject, url, options } of queue) {
    if (error) {
      reject(error);
    } else {
      try {
        const response = await clientApiRequest(url, options);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    }
  }
}

// Client-side API request with automatic token refresh
export async function clientApiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  // Skip auth for auth endpoints
  const isAuthEndpoint = url.includes('/api/auth/') && 
    (url.includes('/login') || url.includes('/signup') || url.includes('/refresh'));
  
  if (isAuthEndpoint) {
    options.skipAuth = true;
  }

  // Always include credentials for cookie handling
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  // Make the initial request
  let response = await fetch(url, requestOptions);

  // Handle 401 responses
  if (response.status === 401 && !options.skipAuth) {
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, url, options });
      });
    }

    isRefreshing = true;

    try {
      // Attempt to refresh token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry original request
        response = await fetch(url, requestOptions);
        
        // Process any queued requests
        await processQueue();
      } else {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        
        // Process queue with error
        await processQueue(new Error('Authentication failed'));
      }
    } catch (refreshError) {
      console.error('Token refresh error:', refreshError);
      
      // Redirect to login on refresh error
      window.location.href = '/login';
      
      // Process queue with error
      await processQueue(refreshError as Error);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// Type-safe wrapper for JSON responses
export async function clientApiRequestJson<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<{ data?: T; error?: any; ok: boolean }> {
  try {
    const response = await clientApiRequest(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "An error occurred",
      }));
      return { error, ok: false };
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : "Network error",
      },
      ok: false,
    };
  }
}

// Helper to build backend API URLs
export function buildBackendUrl(endpoint: string): string {
  // In client-side code, we use relative URLs that go through Next.js API routes
  return `/api/proxy${endpoint}`;
}