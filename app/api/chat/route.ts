import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure conversation_id is properly passed to backend
    const chatPayload = {
      query: body.query,
      conversation_id: body.conversation_id || null,
      conversation_history: body.conversation_history || null,
      limit: body.limit || 10,
      filters: body.filters || null,
    };
    
    const response = await backendApiRequest("/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Chat request failed",
          message: data.message || "Unable to process chat request",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to process chat request",
      },
      { status: 500 }
    );
  }
}