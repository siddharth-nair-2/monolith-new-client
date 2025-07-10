import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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
          error: "Invalid invite ID",
          message: "Invite ID is required",
        },
        { status: 400 }
      );
    }

    const response = await backendApiRequest(`/api/v1/invites/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to revoke invite",
        message: "Unable to revoke invitation",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/[id] DELETE error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to revoke invite",
      },
      { status: 500 }
    );
  }
}