import { NextRequest, NextResponse } from "next/server";
import { authApiRequest } from "@/lib/auth-api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}/documents?${queryString}`
      : `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}/documents`;
    
    const response = await authApiRequest(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error fetching folder documents:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const body = await request.json();
    
    const response = await authApiRequest(
      `${process.env.FASTAPI_BASE_URL}/api/v1/folders/${folderId}/documents`,
      {
        method: "POST",
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
    console.error("Error moving documents to folder:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}