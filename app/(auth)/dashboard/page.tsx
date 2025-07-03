"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  Loader2,
  Search,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);


  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || isStreaming) return;

    setIsStreaming(true);
    setInput("");

    try {
      // Create conversation  
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: query.slice(0, 50) + (query.length > 50 ? "..." : ""),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await response.json();
      const conversationId = conversation.id;

      // Store initial message in session storage for the conversation page to pick up
      sessionStorage.setItem(`initial-message-${conversationId}`, query);

      // Navigate to conversation page
      router.push(`/c/${conversationId}`);
      
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to start conversation");
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-0 flex-1 flex flex-col">
      {/* Dashboard Welcome State */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Monolith Branding */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-[#3E4128] font-semibold mb-4">
              Mono
              <span className="underline decoration-[#A3BC02] decoration-4 underline-offset-4">
                l
              </span>
              ith
            </h1>
          </div>

          {/* Search Bar and Attach Button */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-custom-dark-green" />
              <Input
                type="text"
                placeholder="Ask or Find"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                className={`text-custom-dark-green pl-12 py-4 text-lg rounded-3xl bg-[#F0F0F0] focus:bg-white border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_15px_rgba(163,188,1,0.2),0_4px_4px_0_rgba(163,188,1,1)] transition-shadow duration-200 ${
                  input.trim() ? "pr-12" : "pr-4"
                }`}
              />

              {/* Submit Button - only shows when there's text */}
              {input.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSubmit}
                  disabled={isStreaming}
                  className="absolute right-3 top-2 w-6 h-6  hover:bg-[#A3BC02] hover:text-white border border-[#A3BC02] shadow-[inset_0_0_15px_rgba(163,188,1,0.2)] text-custom-dark-green rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>

            {/* Separate Attach Button */}
            <Button
              size="default"
              variant="outline"
              className="rounded-full w-10 h-10 bg-[#F0F0F0] hover:border-[#A3BC02] hover:bg-[#A3BC02]/10"
            >
              <Paperclip className="w-5 h-5 text-gray-600" strokeWidth={2.2} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}