import { NextResponse } from "next/server";
import { z } from "zod";
import { backendApiRequest } from "@/lib/api-client";

const skipStepSchema = z.object({
  step: z.string().min(1, "Step is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = skipStepSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/onboarding/skip-step", {
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
          error: data.detail || "Failed to skip step",
          message: data.message || "Error skipping onboarding step",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/onboarding/skip-step error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to skip onboarding step",
      },
      { status: 500 }
    );
  }
}