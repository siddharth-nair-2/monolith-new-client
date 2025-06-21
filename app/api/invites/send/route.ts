import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    
    const response = await backendApiRequest("/api/v1/invites/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to send invites",
          message: data.message || "Error sending team invitations",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/send error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to send invitations",
      },
      { status: 500 }
    );
  }
}