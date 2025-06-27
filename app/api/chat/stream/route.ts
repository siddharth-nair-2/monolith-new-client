import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const fastapiBaseUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");
    
    if (!authToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure conversation_id is properly passed to backend
    const chatPayload = {
      query: body.query,
      conversation_id: body.conversation_id || null,
      conversation_history: body.conversation_history || null,
      limit: body.limit || 10,
      filters: body.filters || null,
    };

    // Create the streaming request to backend
    const response = await fetch(`${fastapiBaseUrl}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken.value}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(chatPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Stream request failed",
        message: response.statusText,
      }));
      
      return new Response(
        JSON.stringify(errorData),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a TransformStream to handle the SSE format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            // Forward the SSE data as-is
            controller.enqueue(value);
          }
        } catch (error) {
          console.error("Stream reading error:", error);
          
          // Send error event
          const errorEvent = `data: ${JSON.stringify({
            type: "error",
            error: "Stream interrupted",
            done: true,
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable Nginx buffering
      },
    });
  } catch (error: any) {
    console.error("API /api/chat/stream error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Unable to process streaming chat request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}