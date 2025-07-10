import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;
    
    const response = await backendApiRequest(
      `/api/v1/focus-modes/${id}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        {
          error: data.detail || "Failed to remove document from focus mode",
          message: data.message || "Unable to remove document from focus mode",
        },
        { status: response.status }
      );
    }

    // For 204 responses, use new Response() instead of NextResponse.json()
    return new Response(null, { status: 204 });
  } catch (error: any) {
    const { id, documentId } = await params;
    console.error(
      `API /api/focus-modes/${id}/documents/${documentId} DELETE error:`,
      error
    );
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to remove document from focus mode",
      },
      { status: 500 }
    );
  }
}