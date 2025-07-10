import { NextRequest, NextResponse } from "next/server";
import { authApiRequest } from "@/lib/auth-api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const response = await authApiRequest(
      `${process.env.FASTAPI_BASE_URL}/api/v1/documents/${id}/thumbnail`,
      {
        headers: {
          'Accept': 'image/jpeg, image/png, image/*',
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Thumbnail request failed with status: ${response.status}`);
      return NextResponse.json(
        { error: "Thumbnail not found" },
        { status: response.status }
      );
    }
    
    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Match backend cache control
        'Content-Disposition': response.headers.get('Content-Disposition') || 'inline',
      },
    });
  } catch (error: any) {
    console.error("Error fetching thumbnail:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}