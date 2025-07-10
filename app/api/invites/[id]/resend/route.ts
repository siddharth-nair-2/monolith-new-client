import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
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

    const response = await backendApiRequest(`/api/v1/invites/resend/${id}`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Failed to resend invite",
        message: "Unable to resend invitation",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/invites/[id]/resend POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to resend invite",
      },
      { status: 500 }
    );
  }
}