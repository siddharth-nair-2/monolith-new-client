import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: validationResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration error",
          message: "Server is not properly configured"
        },
        { status: 500 }
      );
    }

    const apiUrl = `${fastapiBaseUrl}/api/v1/auth/login`;

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: validationResult.data.email,
        password: validationResult.data.password,
      }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Extract error details from the backend response
      const errorData = backendData.error || {};
      const errorCode = errorData.code;
      let errorMessage = errorData.message;

      // Enhance error messages based on error code or status
      switch (errorCode) {
        case 'TOO_MANY_REQUESTS':
          errorMessage = `Too many login attempts. The allowed limit is ${errorMessage}s.`;
          break;
        case 'AUTHENTICATION_ERROR':
          errorMessage = errorMessage || "Invalid email or password";
          break;
        case 'ACCOUNT_DISABLED':
          errorMessage = errorMessage || "Your account has been disabled";
          break;
        default:
          // Fallback to status code based messages if no error code
          switch (backendResponse.status) {
            case 401:
              errorMessage = errorMessage || "Invalid credentials";
              break;
            case 403:
              errorMessage = errorMessage || "Access forbidden";
              break;
            case 429:
              errorMessage = errorMessage || "Too many requests. Please try again later.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
          }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorCode || "AUTHENTICATION_ERROR",
          message: errorMessage || "Authentication failed",
          statusCode: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    // Extract both tokens from backend response
    const { access_token, refresh_token } = backendData;

    if (access_token && refresh_token) {
      const cookieStore = await cookies();

      // Store access token
      cookieStore.set("auth_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days (match refresh token)
      });

      // Store refresh token
      cookieStore.set("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    } else if (backendData.token) {
      // Fallback for old backend format
      const cookieStore = await cookies();
      cookieStore.set("auth_token", backendData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: validationResult.data.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      });
    }

    // Return success response (tokens are already set in cookies)
    return NextResponse.json({
      success: true,
      user: backendData.user,
      expires_at: backendData.expires_at,
      is_new_company: backendData.is_new_company
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/login error:", error);

    let errorMessage = "Unable to connect to server";
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
