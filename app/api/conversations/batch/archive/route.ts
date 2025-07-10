import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_ids, is_archived } = body;

    if (!conversation_ids || !Array.isArray(conversation_ids)) {
      return NextResponse.json(
        { error: "conversation_ids array is required" },
        { status: 400 }
      );
    }

    if (typeof is_archived !== "boolean") {
      return NextResponse.json(
        { error: "is_archived boolean is required" },
        { status: 400 }
      );
    }

    const response = await backendApiRequest('/api/v1/conversations/batch/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_ids,
        is_archived
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Archive operation failed" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Batch archive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}