"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  MessageSquare,
  ExternalLink,
  Copy,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Markdown from "markdown-to-jsx";

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
  error?: string;
  metadata?: {
    citations?: Citation[];
    [key: string]: any;
  };
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count?: number;
  category?: string;
  focus_mode_id?: string;
  messages?: Message[];
  focus_modes?: {
    id: string;
    name: string;
    icon: string;
  };
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export default function ChatSidebar({
  isOpen,
  onClose,
  conversationId,
}: ChatSidebarProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadConversation();
    }
  }, [isOpen, conversationId]);

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}?include_messages=true&include_focus_modes=true`
      );
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      } else {
        toast.error("Failed to load conversation");
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  // Function to get file type icon based on filename extension
  const getFileTypeIcon = (filename: string): string => {
    const extension = filename.toLowerCase().split(".").pop() || "";

    const iconMap: Record<string, string> = {
      // Documents
      pdf: "/icons/filetypes/pdf.svg",
      doc: "/icons/filetypes/doc.svg",
      docx: "/icons/filetypes/doc.svg",
      rtf: "/icons/filetypes/rtf.svg",
      txt: "/icons/filetypes/txt.svg",
      md: "/icons/filetypes/txt.svg",

      // Spreadsheets
      xls: "/icons/filetypes/xls.svg",
      xlsx: "/icons/filetypes/xls.svg",
      csv: "/icons/filetypes/csv.svg",

      // Presentations
      ppt: "/icons/filetypes/ppt.svg",
      pptx: "/icons/filetypes/ppt.svg",

      // Images
      jpg: "/icons/filetypes/jpg.svg",
      jpeg: "/icons/filetypes/jpg.svg",
      png: "/icons/filetypes/png.svg",

      // Media
      mp3: "/icons/filetypes/mp3.svg",
      mp4: "/icons/filetypes/mp4.svg",
      avi: "/icons/filetypes/avi.svg",

      // Code/Web
      css: "/icons/filetypes/css.svg",
      js: "/icons/filetypes/javascript.svg",
      xml: "/icons/filetypes/xml.svg",

      // Other
      dwg: "/icons/filetypes/dwg.svg",
      iso: "/icons/filetypes/iso.svg",
      fla: "/icons/filetypes/fla.svg",
    };

    return iconMap[extension] || "/icons/filetypes/file.svg";
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
  const renderContentWithCitations = (
    content: string,
    citations: Citation[]
  ) => {
    if (!citations || citations.length === 0) {
      return (
        <Markdown
          options={{
            overrides: {
              h1: {
                component: "h1",
                props: {
                  className:
                    "text-lg font-serif font-semibold mb-2 text-gray-900",
                },
              },
              h2: {
                component: "h2",
                props: {
                  className:
                    "text-base font-serif font-semibold mb-2 mt-3 text-gray-900",
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
                  className:
                    "mb-2 leading-relaxed text-gray-800 last:mb-0 text-sm",
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
                  className:
                    "bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800",
                },
              },
              pre: {
                component: "pre",
                props: {
                  className:
                    "bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 overflow-x-auto text-xs",
                },
              },
              blockquote: {
                component: "blockquote",
                props: {
                  className:
                    "border-l-4 border-[#A3BC02] pl-3 italic text-gray-700 my-2 text-sm",
                },
              },
              a: {
                component: "a",
                props: {
                  className:
                    "text-[#A3BC02] hover:text-[#8BA000] underline transition-colors text-sm",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
              table: {
                component: "table",
                props: {
                  className:
                    "w-full border-collapse border border-gray-200 mb-2 text-xs",
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
                  className:
                    "border border-gray-200 px-2 py-1 text-left font-semibold text-gray-900 text-xs",
                },
              },
              td: {
                component: "td",
                props: {
                  className:
                    "border border-gray-200 px-2 py-1 text-gray-800 text-xs",
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
      const citation = citations.find((c) => c.index === citationIndex);
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
                          const citationElement = document.getElementById(
                            `citation-${citationNumber}`
                          );
                          if (citationElement) {
                            citationElement.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                            });
                          }
                        }}
                      >
                        {children}
                      </span>
                    );
                  }
                  return (
                    <span className={className} {...props}>
                      {children}
                    </span>
                  );
                },
              },
              h1: {
                component: "h1",
                props: {
                  className:
                    "text-lg font-serif font-semibold mb-2 text-gray-900",
                },
              },
              h2: {
                component: "h2",
                props: {
                  className:
                    "text-base font-serif font-semibold mb-2 mt-3 text-gray-900",
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
                  className:
                    "mb-2 leading-relaxed text-gray-800 last:mb-0 text-sm",
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
                  className:
                    "bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800",
                },
              },
              pre: {
                component: "pre",
                props: {
                  className:
                    "bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 overflow-x-auto text-xs",
                },
              },
              blockquote: {
                component: "blockquote",
                props: {
                  className:
                    "border-l-4 border-[#A3BC02] pl-3 italic text-gray-700 my-2 text-sm",
                },
              },
              a: {
                component: "a",
                props: {
                  className:
                    "text-[#A3BC02] hover:text-[#8BA000] underline transition-colors text-sm",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
              table: {
                component: "table",
                props: {
                  className:
                    "w-full border-collapse border border-gray-200 mb-2 text-xs",
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
                  className:
                    "border border-gray-200 px-2 py-1 text-left font-semibold text-gray-900 text-xs",
                },
              },
              td: {
                component: "td",
                props: {
                  className:
                    "border border-gray-200 px-2 py-1 text-gray-800 text-xs",
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-white/80 backdrop-blur-md border-l-[#A3BC01] [box-shadow:inset_0_0_35px_0_rgba(163,188,1,0.25),-4px_0_4px_0_rgba(163,188,1,0.9)] flex flex-col p-0 z-40">
        <SheetHeader className="sr-only">
          <SheetTitle>Conversation Preview</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col h-full">
          {/* Header with Focus Mode or Open Chat Button */}
          <div className="px-8 pr-12 pt-4 pb-3">
            <div className="flex items-center justify-between">
              {conversation?.focus_modes ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {conversation.focus_modes.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {conversation.focus_modes.name}
                  </span>
                </div>
              ) : (
                <div></div>
              )}

              <Link href={`/c/${conversationId}`}>
                <Button
                  className="
                    text-gray-900
                    border
                    bg-white
                    border-[#A3BC01]
                    rounded-full
                    px-4
                    transition
                    duration-200
                    [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]
                    hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)]
                    hover:bg-[#FAFFD8]
                    hover:border-[#8fa002]
                    text-sm
                    flex items-center gap-2
                  "
                >
                  Open Chat
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 py-6 pt-12">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-6 h-6 animate-spin text-[#A3BC02]" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Loading conversation...
                  </p>
                </div>
              </div>
            ) : conversation &&
              conversation.messages &&
              conversation.messages.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {conversation.messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "mb-6 flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%]",
                          message.role === "user" ? "ml-auto mr-4" : "mr-auto ml-4"
                        )}
                      >
                        {/* Message Content */}
                        <div className="w-full">
                          <div
                            className={cn(
                              "px-4 py-3 shadow-sm z-50",
                              message.role === "user"
                                ? "bg-[#97A43C] text-white rounded-2xl rounded-br-none"
                                : "bg-[#F3F5E5] rounded-2xl rounded-bl-none"
                            )}
                          >
                            {/* Message Text */}
                            <div className="max-w-none">
                              {message.role === "assistant" ? (
                                <div className="markdown-content">
                                  {renderContentWithCitations(
                                    message.content,
                                    message.citations ||
                                      message.metadata?.citations ||
                                      []
                                  )}
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap mb-0 leading-relaxed text-white text-md">
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
                            {(message.citations ||
                              message.metadata?.citations) &&
                              (message.citations ||
                                message.metadata?.citations)!.length > 0 &&
                              (() => {
                                const citations =
                                  message.citations ||
                                  message.metadata?.citations;
                                const uniqueCitations = citations
                                  ? getUniqueCitations(citations)
                                  : [];

                                return (
                                  <div className="mt-3 space-y-2">
                                    {uniqueCitations.map((citation, idx) => {
                                      const filename =
                                        citation.metadata?.original_filename ||
                                        citation.metadata?.filename ||
                                        `Source ${citation.index}`;
                                      const isHighlighted =
                                        citation.citationNumbers?.some(
                                          (num: number) =>
                                            hoveredCitation === num
                                        );

                                      return (
                                        <div
                                          key={idx}
                                          id={
                                            citation.citationNumbers?.[0]
                                              ? `citation-${citation.citationNumbers[0]}`
                                              : undefined
                                          }
                                          className={`flex items-center gap-3 p-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                            isHighlighted
                                              ? "bg-[#A3BC02]/5 border border-[#A3BC02]/20"
                                              : "bg-white hover:bg-gray-50 border border-transparent"
                                          }`}
                                        >
                                          <span className="text-xs text-gray-600 truncate flex-1">
                                            {filename}
                                          </span>
                                          <Image
                                            src={getFileTypeIcon(filename)}
                                            alt="File type"
                                            width={16}
                                            height={16}
                                            className="flex-shrink-0"
                                          />
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
                            {message.role === "assistant" &&
                              message.content &&
                              !message.error && (
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
            ) : conversation ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">No messages yet</p>
                  <p className="text-sm text-gray-500">
                    This conversation doesn't have any messages
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Conversation not found
                  </p>
                  <p className="text-sm text-gray-500">
                    Unable to load the selected conversation
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
