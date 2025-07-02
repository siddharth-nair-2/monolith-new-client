import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_ids } = body;

    if (!conversation_ids || !Array.isArray(conversation_ids)) {
      return NextResponse.json(
        { error: "conversation_ids array is required" },
        { status: 400 }
      );
    }

    console.log('Sending batch delete request with:', { conversation_ids });
    
    const response = await backendApiRequest('/api/v1/conversations/batch/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_ids
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Delete operation failed" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}