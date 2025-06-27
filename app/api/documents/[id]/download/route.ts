import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    if (!authToken?.value) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_AUTH_TOKEN",
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration error",
          message: "Server is not properly configured",
        },
        { status: 500 }
      );
    }

    // Get the view parameter from the URL
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") === "true";

    const { id } = await params;
    const apiUrl = `${fastapiBaseUrl}/api/v1/documents/${id}/download${view ? '?view=true' : ''}`;

    // Stream the file from backend
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    if (!backendResponse.ok) {
      const backendData = await backendResponse.json().catch(() => ({}));
      const errorData = backendData.error || {};

      return NextResponse.json(
        {
          success: false,
          error: errorData.code || "DOWNLOAD_ERROR",
          message: errorData.message || "Failed to download document",
          statusCode: backendResponse.status,
        },
        { status: backendResponse.status }
      );
    }

    // Get headers from backend response
    const contentType = backendResponse.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = backendResponse.headers.get("content-disposition");
    const contentLength = backendResponse.headers.get("content-length");

    // Create response headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }
    
    // If viewing and it's a PDF, ensure correct content type
    if (view && contentType.includes("pdf")) {
      headers.set("Content-Type", "application/pdf");
    }
    
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Stream the response body
    const body = backendResponse.body;
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: "EMPTY_RESPONSE",
          message: "No content received from server",
        },
        { status: 500 }
      );
    }

    return new Response(body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    const { id } = await params;
    console.error(`API /api/documents/${id}/download error:`, error);

    let errorMessage = "Unable to download document";
    if (error.name === "TypeError" && error.message.includes("fetch failed")) {
      errorMessage = "Backend service is unavailable";
    }

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}