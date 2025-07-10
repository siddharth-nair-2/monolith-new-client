"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusModeId = searchParams.get("focus_mode_id");
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isCreating) return;

    setIsCreating(true);
    try {
      // Create conversation via API (like dashboard does)
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus_mode_id: focusModeId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await response.json();
      const conversationId = conversation.id;

      // Store initial message for the conversation page (like dashboard does)
      sessionStorage.setItem(`initial-message-${conversationId}`, input.trim());

      // Navigate to conversation page with real conversation ID
      router.push(`/c/${conversationId}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-none flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-[#A3BC02]" />
          </div>
          <h1 className="text-2xl font-medium text-custom-dark-green font-serif mb-2">
            Start New Conversation
          </h1>
          {focusModeId && (
            <p className="text-gray-600 text-sm font-sans">
              This conversation will be focused on your selected focus mode documents.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or start a conversation..."
              className="pr-12 rounded-full py-3 text-base"
              disabled={isCreating}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!input.trim() || isCreating}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#A3BC02] hover:bg-[#8BA000] p-0"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}