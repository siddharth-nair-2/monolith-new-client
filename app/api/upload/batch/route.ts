import { NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: Request) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    // The backend expects files to be in a specific format for batch upload
    const response = await backendApiRequest("/api/v1/upload/batch", {
      method: "POST",
      // Don't set Content-Type for FormData, let the browser set it
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.detail || "Batch upload failed",
          message: data.message || "Error uploading files",
          failed_files: data.failed_files || [],
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/upload/batch error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to upload files",
      },
      { status: 500 }
    );
  }
}