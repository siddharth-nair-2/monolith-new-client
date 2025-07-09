import { NextRequest, NextResponse } from "next/server";
import { authApiRequest } from "@/lib/auth-api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await authApiRequest(
      `${process.env.FASTAPI_BASE_URL}/api/v1/folders/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error creating folders in bulk:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}