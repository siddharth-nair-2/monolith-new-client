import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const response = await backendApiRequest(
      `/api/v1/focus-modes/${params.id}/documents/${params.documentId}`,
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

    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    console.error(
      `API /api/focus-modes/${params.id}/documents/${params.documentId} DELETE error:`,
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