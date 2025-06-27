import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";
import { z } from "zod";

const deleteAccountSchema = z.object({
  confirm_email: z.string().email("Please enter a valid email address"),
  reason: z.string().optional(),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = deleteAccountSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: validationResult.error.errors[0]?.message || "Invalid input",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/users/account", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Account deletion failed",
        message: "Unable to delete account",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Clear auth cookies on successful account deletion
    const responseObj = NextResponse.json(data, { status: 200 });
    responseObj.cookies.delete("auth_token");
    responseObj.cookies.delete("refresh_token");

    return responseObj;
  } catch (error: any) {
    console.error("API /api/users/account DELETE error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to delete account",
      },
      { status: 500 }
    );
  }
}