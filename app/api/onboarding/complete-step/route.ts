import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const completeStepSchema = z.object({
  step: z.string().min(1, "Step is required"),
  step_data: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = completeStepSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/onboarding/complete-step", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult.data),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to complete step",
          message: data.message || "Error completing onboarding step",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/onboarding/complete-step error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to complete onboarding step",
      },
      { status: 500 }
    );
  }
}