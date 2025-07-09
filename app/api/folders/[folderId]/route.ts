import { NextRequest, NextResponse } from "next/server";
import { authApiRequest } from "@/lib/auth-api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const response = await authApiRequest(
      `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error fetching folder:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const body = await request.json();
    
    const response = await authApiRequest(
      `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error updating folder:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force");
    
    const url = force 
      ? `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}?force=${force}`
      : `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}`;
    
    const response = await authApiRequest(url, { method: "DELETE" });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    // DELETE might return empty response
    const data = await response.text();
    try {
      const jsonData = data ? JSON.parse(data) : {};
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return NextResponse.json({}, { status: response.status });
    }
  } catch (error: any) {
    console.error("Error deleting folder:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}