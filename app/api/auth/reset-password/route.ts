import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.token || !body.new_password) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Reset token and new password are required",
        },
        { status: 400 }
      );
    }

    // Password strength validation
    if (body.new_password.length < 8) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to reset password",
          message: data.message || "Unable to reset password",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/auth/reset-password error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to reset password",
      },
      { status: 500 }
    );
  }
}