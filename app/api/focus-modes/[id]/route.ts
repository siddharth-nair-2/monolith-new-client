import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDocuments = searchParams.get("include_documents") === "true";

    const response = await backendApiRequest(
      `/api/v1/focus-modes/${params.id}?include_documents=${includeDocuments}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch focus mode",
          message: data.message || "Unable to fetch focus mode",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`API /api/focus-modes/${params.id} GET error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch focus mode",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await backendApiRequest(`/api/v1/focus-modes/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to update focus mode",
          message: data.message || "Unable to update focus mode",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`API /api/focus-modes/${params.id} PUT error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to update focus mode",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await backendApiRequest(`/api/v1/focus-modes/${params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        {
          error: data.detail || "Failed to delete focus mode",
          message: data.message || "Unable to delete focus mode",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    console.error(`API /api/focus-modes/${params.id} DELETE error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to delete focus mode",
      },
      { status: 500 }
    );
  }
}