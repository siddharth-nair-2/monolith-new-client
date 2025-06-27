import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    const response = await backendApiRequest(`/api/v1/upload/task/${taskId}`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to get task status",
          message: data.message || "Error retrieving upload status",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`API /api/upload/task/${(await params).taskId} error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to retrieve task status",
      },
      { status: 500 }
    );
  }
}