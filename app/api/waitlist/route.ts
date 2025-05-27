import { NextResponse } from "next/server";
import { z } from "zod";

// Zod schema now includes turnstileToken
const apiFormSchema = z.object({
  // Renamed to avoid conflict with client-side formSchema if different
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  companyName: z.string().min(1, "Company name is required."),
  position: z.string().min(1, "Position is required."),
  city: z.string().min(1, "City is required."),
  country: z.string().min(1, "Please select a country."),
  turnstileToken: z.string().min(1, "Turnstile token is required."),
});

async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error(
      "CRITICAL: TURNSTILE_SECRET_KEY is not set in environment variables."
    );
    // In production, you might want to fail closed more silently or log to an alerting system.
    // For development, this console error is important.
    return false; // Fail verification if secret key is missing
  }

  const verifyEndpoint =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const body = new URLSearchParams();
  body.append("secret", secretKey);
  body.append("response", token);
  if (remoteIp) {
    // Cloudflare recommends sending the IP address of the client
    body.append("remoteip", remoteIp);
  }

  try {
    console.log("VERIFYING TURNSTILE TOKEN - SECRET KEY BEING USED:", secretKey); // Temporary log
    console.log("Verifying Turnstile token with Cloudflare...");
    const response = await fetch(verifyEndpoint, {
      method: "POST",
      body: body,
    });
    const data = await response.json(); // data will be like { success: boolean, 'error-codes'?: string[], ... }
    console.log("Cloudflare Turnstile verification response:", data);
    return data.success === true;
  } catch (error) {
    console.error("Error verifying Turnstile token with Cloudflare:", error);
    return false; // On network or other errors, assume failure
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Attempt to get client's IP address
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") || // Common for Cloudflare proxy
      request.headers.get("x-real-ip") ||
      request.headers.get("remote-addr"); // Fallback

    console.log("Next.js API /api/waitlist: Received body:", body);
    if (clientIp) {
      console.log("Next.js API /api/waitlist: Client IP:", clientIp);
    }

    const validationResult = apiFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "Next.js API validation failed (including Turnstile token):",
        validationResult.error.format()
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Destructure token and the rest of the data
    const { turnstileToken, ...waitlistData } = validationResult.data;

    // Verify the Turnstile token with Cloudflare
    const isTokenValid = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!isTokenValid) {
      console.warn("Turnstile token verification failed for IP:", clientIp);
      return NextResponse.json(
        {
          error: "Security check failed. Please try again or refresh the page.",
        },
        { status: 403 } // 403 Forbidden is appropriate
      );
    }
    console.log("Turnstile token verified successfully.");

    // Token is valid, proceed to call your FastAPI backend
    // (The `waitlistData` object no longer contains `turnstileToken`)
    const fastapiBaseUrl = process.env.FASTAPI_BASE_URL;
    if (!fastapiBaseUrl) {
      console.error("FASTAPI_BASE_URL environment variable is not set.");
      return NextResponse.json(
        { error: "Internal server configuration error." },
        { status: 500 }
      );
    }

    const fastapiWaitlistUrl = `${fastapiBaseUrl}${
      process.env.API_PREFIX || "/api"
    }/waitlist`;
    console.log(
      "Next.js API: Calling FastAPI at:",
      fastapiWaitlistUrl,
      "with data:",
      waitlistData
    );

    const backendResponse = await fetch(fastapiWaitlistUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(waitlistData), // Send only the waitlist form data
    });

    const backendData = await backendResponse.json();
    console.log("Next.js API: Response from FastAPI:", {
      status: backendResponse.status,
      data: backendData,
    });

    if (!backendResponse.ok) {
      console.error(
        "Next.js API: FastAPI backend returned an error:",
        backendData
      );
      return NextResponse.json(
        {
          error:
            backendData.detail ||
            backendData.error ||
            "Failed to submit to waitlist via backend.",
          details: backendData.details || null,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(
      {
        success: backendData.success,
        message: backendData.message,
        data: backendData.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Next.js API /api/waitlist critical error:", error);
    let errorMessage = "Internal server error during proxying.";
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Log the type of error for better debugging
    if (error.name === "TypeError" && error.message.includes("fetch failed")) {
      errorMessage = `Network error: Could not connect to the backend service at ${process.env.FASTAPI_BASE_URL}. Please ensure the backend is running and accessible.`;
      console.error(
        `Details: Is FASTAPI_BASE_URL (${process.env.FASTAPI_BASE_URL}) correct and is the backend server running and reachable from the Next.js server environment?`
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
