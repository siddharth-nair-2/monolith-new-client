import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50).optional(),
  last_name: z.string().min(1, "Last name is required").max(50).optional(),
});

export async function GET(request: Request) {
  try {
    const response = await backendApiRequest("/api/v1/users/profile", {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to get user profile",
          message: data.message || "Error retrieving profile",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/users/profile GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to retrieve user profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/users/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult.data),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to update profile",
          message: data.message || "Error updating profile",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/users/profile PATCH error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to update user profile",
      },
      { status: 500 }
    );
  }
}