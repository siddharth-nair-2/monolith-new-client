import { NextResponse } from "next/server";
import { z } from "zod";

const declineSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validationResult = declineSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // For declining invites, we might want to notify the backend
    // but for now, we'll just return success
    // The actual implementation depends on backend support
    
    return NextResponse.json({
      success: true,
      message: "Invite declined",
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/decline error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}