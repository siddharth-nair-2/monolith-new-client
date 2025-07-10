import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Invalid document ID",
          message: "Document ID is required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest(`/api/v1/documents/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to fetch document",
        message: "Unable to retrieve document",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/documents/[id] GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to retrieve document",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Invalid document ID",
          message: "Document ID is required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest(`/api/v1/documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to delete document",
        message: "Unable to delete document",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/documents/[id] DELETE error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to delete document",
      },
      { status: 500 }
    );
  }
}