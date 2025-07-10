"use client";

import { useState, useRef, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Send,
  Paperclip,
  Loader2,
  Copy,
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  Search,
  CloudUpload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "markdown-to-jsx";
import Image from "next/image";

interface Citation {
  index: number;
  content: string;
  metadata?: {
    filename?: string;
    original_filename?: string;
    source?: string;
    page?: number;
    page_number?: number;
    [key: string]: any;
  };
  citationNumbers?: number[];
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  error?: string;
  timestamp: Date;
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitializedRef = useRef(false);

  // Drag and drop states for conversation page
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial load - only run once
  useEffect(() => {
    // Use ref to ensure this only runs once
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initializeConversation = async () => {
      // Small delay to ensure sessionStorage is set from dashboard
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check for initial message from dashboard
      const initialMessage = sessionStorage.getItem(`initial-message-${conversationId}`);
      
      if (initialMessage) {
        // New conversation from dashboard
        sessionStorage.removeItem(`initial-message-${conversationId}`);
        
        // Check for attachments
        const attachmentInfo = sessionStorage.getItem(`initial-attachments-${conversationId}`);
        const attachments = (window as any)[`attachments-${conversationId}`] as File[] || [];
        
        // Clean up attachment storage
        sessionStorage.removeItem(`initial-attachments-${conversationId}`);
        delete (window as any)[`attachments-${conversationId}`];
        
        // Add user message
        const userMessage: ChatMessage = {
          role: "user",
          content: initialMessage,
          timestamp: new Date(),
        };
        
        // Add assistant placeholder
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
          citations: [],
          timestamp: new Date(),
        };
        
        setMessages([userMessage, assistantMessage]);
        
        // Start streaming immediately with attachments if any
        handleStreamingResponse(initialMessage, attachments.length > 0 ? attachments : undefined);
      } else {
        // Existing conversation - load from backend
        try {
          const response = await fetch(`/api/conversations/${conversationId}?include_messages=true`);
          if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
              const conversationMessages = data.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                citations: msg.metadata?.citations || [],
                timestamp: new Date(msg.created_at),
              }));
              setMessages(conversationMessages);
            }
          } else if (response.status === 404) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Failed to load conversation:', error);
          toast.error('Failed to load conversation');
        }
      }
    };

    initializeConversation();
  }, [conversationId]);


  // Extract streaming logic into a separate function
  const handleStreamingResponse = async (query: string, attachments?: File[]) => {
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();

      let response: Response;

      if (attachments && attachments.length > 0) {
        // Use streaming with attachments endpoint
        const formData = new FormData();
        formData.append("query", query);
        formData.append("conversation_id", conversationId);
        formData.append("process_attachments", "true"); // Process for permanent storage
        
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        response = await fetch("/api/chat/stream/with-attachments", {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });
      } else {
        // Use regular streaming endpoint
        response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            conversation_id: conversationId,
            conversation_history: null,
            limit: 15,
            focus_mode_id: null,
          }),
          signal: abortControllerRef.current.signal,
        });
      }

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.lastIndexOf("\n\n");
        if (boundary !== -1) {
          const complete = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);

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

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  const lastMessage = newMessages[lastIndex];

                  if (lastMessage && lastMessage.role === "assistant") {
                    if (parsed.type === "token" && parsed.content !== null && parsed.content !== undefined) {
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
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.error = error.message || "Failed to get response";
          }
          return newMessages;
        });
        toast.error(error.message || "Failed to get response");
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

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

  // Helper function to flatten files from dropped folders (same as dashboard)
  const flattenDroppedItems = async (items: DataTransferItemList): Promise<File[]> => {
    const files: File[] = [];

    const scanEntry = async (entry: any): Promise<void> => {
      try {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve, reject) => {
            entry.file(resolve, reject);
          });
          files.push(file);
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const entries = await new Promise<any[]>((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });

          for (const childEntry of entries) {
            await scanEntry(childEntry);
          }
        }
      } catch (error) {
        console.error(`Error scanning entry ${entry.name}:`, error);
      }
    };

    // Process all dropped items
    const entries = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry();
      if (entry) {
        entries.push(entry);
      }
    }

    // Scan all entries
    for (const entry of entries) {
      await scanEntry(entry);
    }

    return files;
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsProcessingDrop(true);
      try {
        const droppedFiles = await flattenDroppedItems(e.dataTransfer.items);
        if (droppedFiles.length > 0) {
          setAttachedFiles(prev => [...prev, ...droppedFiles]);
          toast.success(`Attached ${droppedFiles.length} file(s)`);
        }
      } catch (error) {
        console.error("Error processing dropped files:", error);
        toast.error("Failed to process dropped files");
      } finally {
        setIsProcessingDrop(false);
      }
    }
  };

  // File input handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast.success(`Attached ${files.length} file(s)`);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Function to get file type icon based on filename extension
  const getFileTypeIcon = (filename: string): string => {
    const extension = filename.toLowerCase().split(".").pop() || "";

    const iconMap: Record<string, string> = {
      // Documents
      pdf: "/icons/filetypes/pdf.png",
      doc: "/icons/filetypes/word.png",
      docx: "/icons/filetypes/word.png",
      rtf: "/icons/filetypes/file.png",
      txt: "/icons/filetypes/file.png",
      md: "/icons/filetypes/file.png",
      // Spreadsheets
      xls: "/icons/filetypes/excel.png",
      xlsx: "/icons/filetypes/excel.png",
      csv: "/icons/filetypes/excel.png",
      // Presentations
      ppt: "/icons/filetypes/ppt.png",
      pptx: "/icons/filetypes/ppt.png",
      // Images
      jpg: "/icons/filetypes/file.png",
      jpeg: "/icons/filetypes/file.png",
      png: "/icons/filetypes/file.png",
      // Media
      mp3: "/icons/filetypes/file.png",
      mp4: "/icons/filetypes/file.png",
      avi: "/icons/filetypes/file.png",
      // Code/Web
      css: "/icons/filetypes/file.png",
      js: "/icons/filetypes/file.png",
      xml: "/icons/filetypes/file.png",
      // Other
      dwg: "/icons/filetypes/file.png",
      iso: "/icons/filetypes/file.png",
      fla: "/icons/filetypes/file.png",
    };

    return iconMap[extension] || "/icons/filetypes/file.png";
  };

  // Function to deduplicate citations by document and collect citation numbers
  const getUniqueCitations = (citations: Citation[]) => {
    const uniqueMap = new Map();

    citations.forEach((citation) => {
      const filename =
        citation.metadata?.original_filename ||
        citation.metadata?.filename ||
        `Source ${citation.index}`;
      const key = filename;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          ...citation,
          citationNumbers: [citation.index],
        });
      } else {
        uniqueMap.get(key).citationNumbers.push(citation.index);
      }
    });

    return Array.from(uniqueMap.values());
  };

  // Simple function to render content with clean interactive citations
  const renderContentWithCitations = (content: string, citations: Citation[]) => {
    if (!citations || citations.length === 0) {
      return (
        <Markdown
          options={{
            overrides: {
              h1: {
                component: "h1",
                props: {
                  className: "text-lg font-serif font-semibold mb-2 text-gray-900",
                },
              },
              h2: {
                component: "h2",
                props: {
                  className: "text-base font-serif font-semibold mb-2 mt-3 text-gray-900",
                },
              },
              h3: {
                component: "h3",
                props: {
                  className: "text-sm font-semibold mb-1 mt-2 text-gray-900",
                },
              },
              p: {
                component: "p",
                props: {
                  className: "mb-2 leading-relaxed text-gray-800 last:mb-0 text-sm",
                },
              },
              ul: {
                component: "ul",
                props: {
                  className: "list-disc pl-4 mb-2 space-y-1 text-sm",
                },
              },
              ol: {
                component: "ol",
                props: {
                  className: "list-decimal pl-4 mb-2 space-y-1 text-sm",
                },
              },
              li: {
                component: "li",
                props: {
                  className: "text-gray-800 leading-relaxed text-sm",
                },
              },
              strong: {
                component: "strong",
                props: {
                  className: "font-semibold text-gray-900",
                },
              },
              em: {
                component: "em",
                props: {
                  className: "italic text-gray-800",
                },
              },
              code: {
                component: "code",
                props: {
                  className: "bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800",
                },
              },
              pre: {
                component: "pre",
                props: {
                  className: "bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 overflow-x-auto text-xs",
                },
              },
              blockquote: {
                component: "blockquote",
                props: {
                  className: "border-l-4 border-[#A3BC02] pl-3 italic text-gray-700 my-2 text-sm",
                },
              },
              a: {
                component: "a",
                props: {
                  className: "text-[#A3BC02] hover:text-[#8BA000] underline transition-colors text-sm",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
              table: {
                component: "table",
                props: {
                  className: "w-full border-collapse border border-gray-200 mb-2 text-xs",
                },
              },
              thead: {
                component: "thead",
                props: {
                  className: "bg-gray-50",
                },
              },
              th: {
                component: "th",
                props: {
                  className: "border border-gray-200 px-2 py-1 text-left font-semibold text-gray-900 text-xs",
                },
              },
              td: {
                component: "td",
                props: {
                  className: "border border-gray-200 px-2 py-1 text-gray-800 text-xs",
                },
              },
              hr: {
                component: "hr",
                props: {
                  className: "border-gray-200 my-3",
                },
              },
            },
          }}
        >
          {content}
        </Markdown>
      );
    }

    // Process content to make citations clickable while keeping them minimal
    const processedContent = content.replace(/\[(\d+)\]/g, (match, number) => {
      const citationIndex = parseInt(number);
      const citation = citations.find(c => c.index === citationIndex);
      if (citation) {
        return `<span class="citation-ref" data-citation="${citationIndex}">${match}</span>`;
      }
      return match;
    });

    return (
      <div>
        <style>{`
          .citation-ref {
            color: #A3BC02;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
          }
          .citation-ref:hover {
            color: #8BA000;
            text-decoration: underline;
          }
        `}</style>
        <Markdown
          options={{
            overrides: {
              span: {
                component: ({ className, children, ...props }: any) => {
                  if (className === "citation-ref") {
                    const citationNumber = parseInt(props["data-citation"]);
                    return (
                      <span
                        className="citation-ref"
                        onMouseEnter={() => setHoveredCitation(citationNumber)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        onClick={() => {
                          const citationElement = document.getElementById(`citation-${citationNumber}`);
                          if (citationElement) {
                            citationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }}
                      >
                        {children}
                      </span>
                    );
                  }
                  return <span className={className} {...props}>{children}</span>;
                },
              },
              h1: {
                component: "h1",
                props: {
                  className: "text-lg font-serif font-semibold mb-2 text-gray-900",
                },
              },
              h2: {
                component: "h2",
                props: {
                  className: "text-base font-serif font-semibold mb-2 mt-3 text-gray-900",
                },
              },
              h3: {
                component: "h3",
                props: {
                  className: "text-sm font-semibold mb-1 mt-2 text-gray-900",
                },
              },
              p: {
                component: "p",
                props: {
                  className: "mb-2 leading-relaxed text-gray-800 last:mb-0 text-sm",
                },
              },
              ul: {
                component: "ul",
                props: {
                  className: "list-disc pl-4 mb-2 space-y-1 text-sm",
                },
              },
              ol: {
                component: "ol",
                props: {
                  className: "list-decimal pl-4 mb-2 space-y-1 text-sm",
                },
              },
              li: {
                component: "li",
                props: {
                  className: "text-gray-800 leading-relaxed text-sm",
                },
              },
              strong: {
                component: "strong",
                props: {
                  className: "font-semibold text-gray-900",
                },
              },
              em: {
                component: "em",
                props: {
                  className: "italic text-gray-800",
                },
              },
              code: {
                component: "code",
                props: {
                  className: "bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800",
                },
              },
              pre: {
                component: "pre",
                props: {
                  className: "bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 overflow-x-auto text-xs",
                },
              },
              blockquote: {
                component: "blockquote",
                props: {
                  className: "border-l-4 border-[#A3BC02] pl-3 italic text-gray-700 my-2 text-sm",
                },
              },
              a: {
                component: "a",
                props: {
                  className: "text-[#A3BC02] hover:text-[#8BA000] underline transition-colors text-sm",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
              table: {
                component: "table",
                props: {
                  className: "w-full border-collapse border border-gray-200 mb-2 text-xs",
                },
              },
              thead: {
                component: "thead",
                props: {
                  className: "bg-gray-50",
                },
              },
              th: {
                component: "th",
                props: {
                  className: "border border-gray-200 px-2 py-1 text-left font-semibold text-gray-900 text-xs",
                },
              },
              td: {
                component: "td",
                props: {
                  className: "border border-gray-200 px-2 py-1 text-gray-800 text-xs",
                },
              },
              hr: {
                component: "hr",
                props: {
                  className: "border-gray-200 my-3",
                },
              },
            },
          }}
        >
          {processedContent}
        </Markdown>
      </div>
    );
  };

  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || isStreaming) return;

    // Store current attachments
    const currentAttachments = [...attachedFiles];

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Clear attachments after using them
    setAttachedFiles([]);

    // Add assistant message placeholder
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      citations: [],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Use the same streaming function with attachments
    await handleStreamingResponse(query, currentAttachments.length > 0 ? currentAttachments : undefined);
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

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };


  return (
    <div 
      className="min-h-0 flex-1 flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <CloudUpload className="w-16 h-16 text-[#A3BC02] mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Drop files or folders here
            </h3>
            <p className="text-sm text-gray-500">
              Files will be attached to your next message
            </p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessingDrop && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#A3BC02] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Processing files...
            </h3>
            <p className="text-sm text-gray-500">
              Flattening folders and preparing attachments
            </p>
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 md:px-8 lg:px-12">
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
                          ? "bg-[#97A43C] text-white"
                          : "bg-[#F3F5E5]"
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
                            {renderContentWithCitations(
                              message.content,
                              message.citations || []
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap mb-0 leading-relaxed text-white text-sm">
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
                      {message.citations && message.citations.length > 0 && (() => {
                        const uniqueCitations = getUniqueCitations(message.citations);
                        return (
                          <div className="mt-3 space-y-2">
                            {uniqueCitations.map((citation, idx) => {
                              const filename =
                                citation.metadata?.original_filename ||
                                citation.metadata?.filename ||
                                `Source ${citation.index}`;
                              const isHighlighted = citation.citationNumbers?.some(num => hoveredCitation === num);
                              
                              return (
                                <div
                                  key={idx}
                                  id={citation.citationNumbers?.[0] ? `citation-${citation.citationNumbers[0]}` : undefined}
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                                    isHighlighted 
                                      ? 'bg-[#A3BC02]/5 border border-[#A3BC02]/20' 
                                      : 'bg-white hover:bg-gray-50 border border-transparent'
                                  }`}
                                >
                                  <Image
                                    src={getFileTypeIcon(filename)}
                                    alt="File type"
                                    width={16}
                                    height={16}
                                    className="flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-600 truncate flex-1">
                                    {filename}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                </div>
                              );
                            })}
                            {/* Horizontal line below citations */}
                            <div className="border-t border-gray-200 mt-3"></div>
                          </div>
                        );
                      })()}

                      {/* Actions for assistant messages */}
                      {message.role === "assistant" && message.content && !message.error && (
                        <div className="mt-0 py-1">
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
      </ScrollArea>

      {/* Bottom floating input */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="w-full max-w-2xl mx-auto">
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-3">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 bg-[#A3BC02]/10 border border-[#A3BC02]/20 rounded-full px-3 py-1 text-sm"
                  >
                    <span className="text-gray-700 max-w-32 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="text-gray-500 hover:text-gray-700 rounded-full p-0.5 hover:bg-white/50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 drop-shadow-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-custom-dark-green" />
              <Input
                type="text"
                placeholder="Ask or Find"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`text-custom-dark-green pl-12 py-4 text-lg rounded-3xl bg-[#F0F0F0] focus:bg-white border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_15px_rgba(163,188,1,0.2),0_4px_4px_0_rgba(163,188,1,1)] transition-shadow duration-200 ${
                  input.trim() ? "pr-12" : "pr-4"
                }`}
                disabled={isStreaming}
              />

              {input.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSubmit}
                  className="absolute right-3 top-2 w-6 h-6  hover:bg-[#A3BC02] hover:text-white border border-[#A3BC02] shadow-[inset_0_0_15px_rgba(163,188,1,0.2)] text-custom-dark-green rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  {isStreaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>

            <Button
              size="default"
              variant="outline"
              className="rounded-full w-10 h-10 bg-[#F0F0F0] hover:border-[#A3BC02] hover:bg-[#A3BC02]/10 drop-shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5 text-gray-600" strokeWidth={2.2} />
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
    </div>
  );
}