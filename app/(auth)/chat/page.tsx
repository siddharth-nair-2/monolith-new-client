"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  FileText,
  ExternalLink,
  Copy,
  RotateCw,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Citation {
  index: number;
  content: string;
  metadata?: {
    filename?: string;
    source?: string;
    page?: number;
    [key: string]: any;
  };
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  error?: string;
  timestamp: Date;
}


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchParams = useSearchParams();

  // Load conversation from URL params on mount
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [searchParams]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}?include_messages=true`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversationId(conversationId);
        
        // Convert backend messages to frontend format
        const formattedMessages: ChatMessage[] = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          citations: msg.citations || [],
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    // Clear URL params
    window.history.replaceState({}, '', '/chat');
  };

  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || isLoading || isStreaming) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      citations: [],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          conversation_id: currentConversationId,
          conversation_history: currentConversationId ? null : messages.filter((m) => !m.error).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Read the stream using a simple approach
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages (ending with \n\n)
        let boundary = buffer.lastIndexOf("\n\n");
        if (boundary !== -1) {
          const complete = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);
          
          // Process each line
          const lines = complete.split("\n");
          for (const line of lines) {
            if (!line.trim()) continue;
            
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data === "[DONE]") {
                setIsStreaming(false);
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                // Update the last assistant message
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  const lastMessage = newMessages[lastIndex];
                  
                  if (lastMessage && lastMessage.role === "assistant") {
                    if (parsed.type === "token" && parsed.content !== null && parsed.content !== undefined) {
                      // Create a new message object to ensure React detects the change
                      newMessages[lastIndex] = {
                        ...lastMessage,
                        content: lastMessage.content + parsed.content,
                      };
                    } else if (parsed.type === "citations") {
                      newMessages[lastIndex] = {
                        ...lastMessage,
                        citations: parsed.citations,
                      };
                    } else if (parsed.type === "error") {
                      newMessages[lastIndex] = {
                        ...lastMessage,
                        error: parsed.error,
                      };
                      toast.error(parsed.error);
                    } else if (parsed.type === "done") {
                      setIsStreaming(false);
                      // Update conversation ID if this was a new conversation
                      if (parsed.conversation_id && !currentConversationId) {
                        setCurrentConversationId(parsed.conversation_id);
                      }
                    }
                  }
                  
                  return newMessages;
                });
              } catch (e) {
                console.error("Failed to parse SSE data:", e, data);
              }
            }
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "done") {
                setIsStreaming(false);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete data
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Stream was aborted by user
      } else {
        console.error("Chat error:", error);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.error = error.message || "Failed to get response";
          return newMessages;
        });
        toast.error(error.message || "Failed to get response");
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        // Remove the last assistant message if it had an error
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "assistant" && lastMessage.error) {
          setMessages((prev) => prev.slice(0, -1));
        }
      }
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A3BC02]/10 rounded-lg">
              <Bot className="w-5 h-5 text-[#A3BC02]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-500">Chat with your documents</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-gray-500 hover:text-gray-700"
            >
              New chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full py-20">
            <div className="text-center max-w-md">
              <div className="mx-auto w-16 h-16 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#A3BC02]" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Start a conversation</h2>
              <p className="text-gray-500 mb-6">
                Ask questions about your documents and get intelligent answers with citations
              </p>
              <div className="space-y-2 text-left">
                <button
                  onClick={() => setInput("What are the key insights from recent documents?")}
                  className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-[#A3BC02]" />
                  What are the key insights from recent documents?
                </button>
                <button
                  onClick={() => setInput("Summarize the main themes across all documents")}
                  className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-[#A3BC02]" />
                  Summarize the main themes across all documents
                </button>
                <button
                  onClick={() => setInput("Find information about budget planning")}
                  className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-[#A3BC02]" />
                  Find information about budget planning
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-4",
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-[#A3BC02]/10 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#A3BC02]" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "flex-1 max-w-2xl",
                      message.role === "user" && "max-w-lg"
                    )}
                  >
                    <Card
                      className={cn(
                        "overflow-hidden",
                        message.role === "user"
                          ? "bg-[#3E4128] text-white"
                          : "bg-white"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none">
                          <p
                            className={cn(
                              "whitespace-pre-wrap mb-0",
                              message.role === "user" && "text-white"
                            )}
                          >
                            {message.content}
                          </p>
                        </div>

                        {/* Error state */}
                        {message.error && (
                          <div className="mt-3 flex items-center gap-2 text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{message.error}</span>
                          </div>
                        )}

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <Separator />
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sources
                            </div>
                            <div className="space-y-2">
                              {message.citations.map((citation, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-gray-50 rounded-lg text-sm"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-3 h-3 text-gray-400" />
                                        <span className="font-medium text-gray-700">
                                          {citation.metadata?.filename || `Source ${citation.index}`}
                                        </span>
                                        {citation.metadata?.page && (
                                          <Badge variant="secondary" className="text-xs">
                                            Page {citation.metadata.page}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-gray-600 text-xs line-clamp-2">
                                        {citation.content}
                                      </p>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        // TODO: Open document viewer
                                        toast.info("Document viewer coming soon");
                                      }}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {message.role === "assistant" && !message.error && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleCopy(message.content)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming indicator */}
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-500 text-sm"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                AI is thinking...
              </motion.div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="min-h-[60px] max-h-[200px] pr-24 resize-none"
              disabled={isStreaming}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {isStreaming ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopStreaming}
                  className="h-8"
                >
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Stop
                </Button>
              ) : (
                <>
                  {messages.length > 0 && messages[messages.length - 1].error && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRetry}
                      className="h-8"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className="h-8 bg-[#A3BC02] hover:bg-[#8BA000]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}