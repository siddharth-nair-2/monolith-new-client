import { NextRequest, NextResponse } from "next/server";
import { backendApiRequest } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "Avatar file is required",
          message: "Please select an image file to upload",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          message: "Avatar file must be smaller than 5MB",
        },
        { status: 400 }
      );
    }

    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append("avatar", file);

    const response = await backendApiRequest("/api/v1/users/upload-avatar", {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Avatar upload failed",
        message: "Unable to upload avatar image",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/users/avatar POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to upload avatar",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = await backendApiRequest("/api/v1/users/avatar", {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "Avatar deletion failed",
        message: "Unable to delete avatar",
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API /api/users/avatar DELETE error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Unable to delete avatar",
      },
      { status: 500 }
    );
  }
}