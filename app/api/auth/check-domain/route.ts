import { NextResponse } from "next/server";
import { z } from "zod";

const checkDomainSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validationResult = checkDomainSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      console.error("FASTAPI_BASE_URL environment variable is not set.");
      return NextResponse.json(
        { error: "Internal server configuration error." },
        { status: 500 }
      );
    }

    const apiUrl = `${fastapiBaseUrl}/api/v1/auth/check-domain`;

    const backendResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validationResult.data),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      let errorMessage = backendData.detail || backendData.message;
      
      if (backendResponse.status === 429) {
        errorMessage = errorMessage || "Too many requests. Please try again later.";
      }
      
      return NextResponse.json(
        {
          success: false,
          error: backendData.detail || "Failed to check domain",
          message: errorMessage || "Unable to check domain",
          statusCode: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(backendData, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/check-domain error:", error);
    
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