import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validationResult = forgotPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validationResult.data),
      skipAuth: true, // This endpoint doesn't require authentication
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to send reset email",
          message: data.message || "Something went wrong",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Password reset instructions sent",
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/forgot-password error:", error);
    
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