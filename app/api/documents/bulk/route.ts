import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.action || !body.document_ids || !Array.isArray(body.document_ids)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Action and document_ids array are required",
        },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['delete', 'archive', 'unarchive', 'reprocess', 'move_to_category'];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate document IDs
    if (body.document_ids.length === 0) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "At least one document ID is required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest("/api/v1/documents/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Bulk operation failed",
          message: data.message || "Unable to perform bulk operation on documents",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/documents/bulk error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to perform bulk operation",
      },
      { status: 500 }
    );
  }
}