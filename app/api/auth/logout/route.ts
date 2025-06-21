import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear both auth token and refresh token cookies
    cookieStore.delete("auth_token");
    cookieStore.delete("refresh_token");
    
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    }, { status: 200 });
  } catch (error: any) {
    console.error("API /api/auth/logout error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}