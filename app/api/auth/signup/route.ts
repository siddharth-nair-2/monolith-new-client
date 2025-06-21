import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  company_name: z.string().optional(),
  company_size: z.string().optional(),
  industry: z.string().optional(),
  invite_token: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validationResult = signupSchema.safeParse(body);
    
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

    const apiUrl = `${fastapiBaseUrl}/api/v1/auth/signup`;

    // Data is already in snake_case format matching OpenAPI spec
    const backendPayload = {
      email: validationResult.data.email,
      password: validationResult.data.password,
      first_name: validationResult.data.first_name,
      last_name: validationResult.data.last_name,
      company_name: validationResult.data.company_name,
      company_size: validationResult.data.company_size,
      industry: validationResult.data.industry,
      invite_token: validationResult.data.invite_token,
    };

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Extract error details from the backend response
      const errorData = backendData.error || {};
      const errorCode = errorData.code;
      let errorMessage = errorData.message;
      
      // Enhance error messages based on error code or status
      switch (errorCode) {
        case 'EMAIL_ALREADY_EXISTS':
          errorMessage = errorMessage || "An account with this email already exists";
          break;
        case 'DOMAIN_NOT_ALLOWED':
          errorMessage = errorMessage || "This email domain requires an invitation to join";
          break;
        case 'INVALID_INVITE_TOKEN':
          errorMessage = errorMessage || "Invalid or expired invitation";
          break;
        case 'TOO_MANY_REQUESTS':
          errorMessage = `Too many signup attempts. Please wait ${errorMessage}s before trying again.`;
          break;
        case 'VALIDATION_ERROR':
          errorMessage = errorMessage || "Please check your input and try again";
          break;
        default:
          // Fallback to status code based messages if no error code
          switch (backendResponse.status) {
            case 400:
              errorMessage = errorMessage || "Invalid signup data";
              break;
            case 409:
              errorMessage = errorMessage || "Email already registered";
              break;
            case 422:
              errorMessage = errorMessage || "Invalid input data";
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
          error: errorCode || "SIGNUP_ERROR",
          message: errorMessage || "Failed to create account",
          statusCode: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    // The backend returns 'token' field for signup
    const token = backendData.token;
    
    if (token) {
      const cookieStore = await cookies();
      
      // Set auth cookie
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 1 day for new signups
      });
    }

    return NextResponse.json({
      success: true,
      user: backendData.user,
      message: "Account created successfully",
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/signup error:", error);
    
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