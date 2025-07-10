import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const fastapiBaseUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");
    
    if (!authToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get form data from request
    const formData = await request.formData();
    
    // Create new form data for backend request
    const backendFormData = new FormData();
    
    // Add query and conversation_id from form data
    const query = formData.get("query") as string;
    const conversationId = formData.get("conversation_id") as string;
    const processAttachments = formData.get("process_attachments") as string || "false";
    const folderId = formData.get("folder_id") as string;
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    backendFormData.append("query", query);
    if (conversationId) {
      backendFormData.append("conversation_id", conversationId);
    }
    backendFormData.append("process_attachments", processAttachments);
    if (folderId) {
      backendFormData.append("folder_id", folderId);
    }

    // Add all attachment files
    const files = formData.getAll("attachments") as File[];
    files.forEach((file) => {
      backendFormData.append("attachments", file);
    });

    // Create the streaming request to backend
    const response = await fetch(`${fastapiBaseUrl}/api/v1/chat/stream/with-attachments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken.value}`,
        "Accept": "text/event-stream",
        // Don't set Content-Type - let fetch set it automatically for FormData
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          error: "Stream request failed",
          message: response.statusText,
          details: errorText,
        };
      }
      
      return new Response(
        JSON.stringify(errorData),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a ReadableStream to forward the SSE data
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
          const encoder = new TextEncoder();
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
    console.error("API /api/chat/stream/with-attachments error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Unable to process streaming chat request with attachments",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}