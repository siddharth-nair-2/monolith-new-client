import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "20";

    const response = await backendApiRequest(
      `/api/v1/focus-modes/${params.id}/documents?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to fetch focus mode documents",
          message: data.message || "Unable to fetch focus mode documents",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`API /api/focus-modes/${params.id}/documents GET error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to fetch focus mode documents",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await backendApiRequest(
      `/api/v1/focus-modes/${params.id}/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Failed to add documents to focus mode",
          message: data.message || "Unable to add documents to focus mode",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error(`API /api/focus-modes/${params.id}/documents POST error:`, error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to add documents to focus mode",
      },
      { status: 500 }
    );
  }
}