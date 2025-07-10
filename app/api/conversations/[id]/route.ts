import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get("include_messages") === "true";
    const includeFocusModes = searchParams.get("include_focus_modes") === "true";

    const queryParams = new URLSearchParams();
    if (includeMessages) {
      queryParams.append("include_messages", "true");
    }
    if (includeFocusModes) {
      queryParams.append("include_focus_modes", "true");
    }

    const response = await backendApiRequest(
      `/api/v1/conversations/${params.id}?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch conversation",
          message: data.message || "Unable to fetch conversation",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/conversations/[id] GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch conversation",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await backendApiRequest(`/api/v1/conversations/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to update conversation",
          message: data.message || "Unable to update conversation",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/conversations/[id] PATCH error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to update conversation",
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
    const response = await backendApiRequest(`/api/v1/conversations/${params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        {
          error: data.detail || "Failed to delete conversation",
          message: data.message || "Unable to delete conversation",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/conversations/[id] DELETE error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to delete conversation",
      },
      { status: 500 }
    );
  }
}