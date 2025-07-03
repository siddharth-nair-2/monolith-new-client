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
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "markdown-to-jsx";

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
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
          citations: msg.metadata?.citations || [],
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
    <div className="min-h-0 flex-1 flex flex-col bg-gray-50/30">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#A3BC02]/15 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#A3BC02]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 font-serif">Chat with Monolith</h1>
              <p className="text-sm text-gray-500">Ask questions about your documents</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 md:px-8 lg:px-12">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full py-16">
            <div className="text-center max-w-lg">
              <div className="mx-auto w-20 h-20 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-[#A3BC02]" />
              </div>
              <h2 className="text-xl font-serif font-semibold mb-3 text-gray-900">Start a conversation</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Ask questions about your documents and get intelligent answers with source citations.
              </p>
              <div className="grid gap-3 text-left">
                {[
                  "What are the key insights from recent documents?",
                  "Summarize the main themes across all documents",
                  "Find information about budget planning"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="group p-4 text-sm bg-white border border-gray-200 rounded-xl hover:border-[#A3BC02]/30 hover:bg-[#A3BC02]/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-3 text-[#A3BC02] group-hover:text-[#8BA000]" />
                      <span className="text-gray-700 group-hover:text-gray-900">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "mb-6 flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-3 max-w-[85%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === "assistant" ? (
                        <div className="w-8 h-8 bg-[#A3BC02]/15 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-[#A3BC02]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          message.role === "user"
                            ? "bg-[#3E4128] text-white"
                            : "bg-white border border-gray-200"
                        )}
                      >
                        {/* Message Text */}
                        <div className="max-w-none">
                          {!message.content && message.role === "assistant" && isStreaming ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-500">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-sm">Thinking...</span>
                              </div>
                            </div>
                          ) : message.role === "assistant" ? (
                            <div className="markdown-content">
                              <Markdown
                                options={{
                                  overrides: {
                                    h1: {
                                      component: 'h1',
                                      props: {
                                        className: 'text-xl font-serif font-semibold mb-3 text-gray-900'
                                      }
                                    },
                                    h2: {
                                      component: 'h2',
                                      props: {
                                        className: 'text-lg font-serif font-semibold mb-2 mt-4 text-gray-900'
                                      }
                                    },
                                    h3: {
                                      component: 'h3',
                                      props: {
                                        className: 'text-base font-semibold mb-2 mt-3 text-gray-900'
                                      }
                                    },
                                    p: {
                                      component: 'p',
                                      props: {
                                        className: 'mb-3 leading-relaxed text-gray-800 last:mb-0'
                                      }
                                    },
                                    ul: {
                                      component: 'ul',
                                      props: {
                                        className: 'list-disc pl-4 mb-3 space-y-1'
                                      }
                                    },
                                    ol: {
                                      component: 'ol',
                                      props: {
                                        className: 'list-decimal pl-4 mb-3 space-y-1'
                                      }
                                    },
                                    li: {
                                      component: 'li',
                                      props: {
                                        className: 'text-gray-800 leading-relaxed'
                                      }
                                    },
                                    strong: {
                                      component: 'strong',
                                      props: {
                                        className: 'font-semibold text-gray-900'
                                      }
                                    },
                                    em: {
                                      component: 'em',
                                      props: {
                                        className: 'italic text-gray-800'
                                      }
                                    },
                                    code: {
                                      component: 'code',
                                      props: {
                                        className: 'bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800'
                                      }
                                    },
                                    pre: {
                                      component: 'pre',
                                      props: {
                                        className: 'bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 overflow-x-auto'
                                      }
                                    },
                                    blockquote: {
                                      component: 'blockquote',
                                      props: {
                                        className: 'border-l-4 border-[#A3BC02] pl-4 italic text-gray-700 my-3'
                                      }
                                    },
                                    a: {
                                      component: 'a',
                                      props: {
                                        className: 'text-[#A3BC02] hover:text-[#8BA000] underline transition-colors',
                                        target: '_blank',
                                        rel: 'noopener noreferrer'
                                      }
                                    },
                                    table: {
                                      component: 'table',
                                      props: {
                                        className: 'w-full border-collapse border border-gray-200 mb-3 text-sm'
                                      }
                                    },
                                    thead: {
                                      component: 'thead',
                                      props: {
                                        className: 'bg-gray-50'
                                      }
                                    },
                                    th: {
                                      component: 'th',
                                      props: {
                                        className: 'border border-gray-200 px-3 py-2 text-left font-semibold text-gray-900'
                                      }
                                    },
                                    td: {
                                      component: 'td',
                                      props: {
                                        className: 'border border-gray-200 px-3 py-2 text-gray-800'
                                      }
                                    },
                                    hr: {
                                      component: 'hr',
                                      props: {
                                        className: 'border-gray-200 my-4'
                                      }
                                    }
                                  }
                                }}
                              >
                                {message.content}
                              </Markdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap mb-0 leading-relaxed text-white">
                              {message.content}
                            </p>
                          )}
                        </div>

                        {/* Error state */}
                        {message.error && (
                          <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{message.error}</span>
                          </div>
                        )}

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                              Sources
                            </div>
                            <div className="space-y-2">
                              {message.citations.map((citation, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium text-gray-800 text-sm truncate">
                                          {citation.metadata?.filename || `Source ${citation.index}`}
                                        </span>
                                        {citation.metadata?.page && (
                                          <Badge variant="secondary" className="text-xs">
                                            Page {citation.metadata.page}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                                        {citation.content}
                                      </p>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
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

                        {/* Actions for assistant messages */}
                        {message.role === "assistant" && message.content && !message.error && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => handleCopy(message.content)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[#A3BC02]/50 focus-within:bg-white transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="min-h-[56px] max-h-[120px] resize-none border-0 bg-transparent px-4 py-4 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
              disabled={isStreaming}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {isStreaming ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopStreaming}
                  className="h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
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
                      className="h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className="h-8 bg-[#A3BC02] hover:bg-[#8BA000] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}