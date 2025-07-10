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
  CloudUpload,
  X,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Helper function to flatten files from dropped folders
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

      // Store initial message and attachments in session storage for the conversation page to pick up
      sessionStorage.setItem(`initial-message-${conversationId}`, query);
      
      if (attachedFiles.length > 0) {
        // Store file data in session storage (we'll transfer these to the conversation page)
        sessionStorage.setItem(`initial-attachments-${conversationId}`, JSON.stringify(
          attachedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
          }))
        ));
        
        // Store the actual File objects in a temporary way
        // Note: We can't directly store File objects in sessionStorage, so we'll pass them via a different method
        (window as any)[`attachments-${conversationId}`] = attachedFiles;
      }

      // Clear attached files
      setAttachedFiles([]);

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
              Files will be attached to your chat
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

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap gap-2 justify-center">
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
            </motion.div>
          )}

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
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5 text-gray-600" strokeWidth={2.2} />
            </Button>
          </motion.div>
        </motion.div>
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