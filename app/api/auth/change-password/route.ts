import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.current_password || !body.new_password) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/auth/change-password", {
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
          error: data.detail || "Failed to change password",
          message: data.message || "Unable to change password",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/auth/change-password error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to change password",
      },
      { status: 500 }
    );
  }
}