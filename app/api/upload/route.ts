import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    // Get folder_id from query params
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folder_id");
    
    const url = folderId 
      ? `/api/v1/upload?folder_id=${folderId}`
      : "/api/v1/upload";
    
    const response = await backendApiRequest(url, {
      method: "POST",
      // Don't set Content-Type for FormData, let the browser set it
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Upload failed",
          message: data.message || "Error uploading file",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/upload error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to upload file",
      },
      { status: 500 }
    );
  }
}