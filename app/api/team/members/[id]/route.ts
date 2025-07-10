import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await backendApiRequest(`/api/v1/team/members/${params.id}`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch team member",
          message: data.message || "Unable to fetch team member",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/team/members/[id] GET error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch team member",
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
    
    const response = await backendApiRequest(`/api/v1/team/members/${params.id}`, {
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
          error: data.detail || "Failed to update team member",
          message: data.message || "Unable to update team member",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/team/members/[id] PATCH error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to update team member",
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
    const response = await backendApiRequest(`/api/v1/team/members/${params.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        {
          error: data.detail || "Failed to remove team member",
          message: data.message || "Unable to remove team member",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Team member removed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/team/members/[id] DELETE error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to remove team member",
      },
      { status: 500 }
    );
  }
}