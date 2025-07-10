import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.new_email) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "New email is required",
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.new_email)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/auth/change-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_email: body.new_email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to change email",
          message: data.message || "Unable to change email",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/change-email error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to change email",
      },
      { status: 500 }
    );
  }
}