// app/(auth)/focus/[id]/page.tsx

"use client";

import React, { useState, useEffect, useCallback, memo, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  Plus,
  FileText,
  MessageSquare,
  Download,
  Target,
  Archive,
  MoreHorizontal,
  Check,
  CircleAlert,
  Loader2,
  FolderOpen,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import DocumentSelectionModal from "@/components/focus/DocumentSelectionModal";
import { DocumentViewer } from "@/components/document/DocumentViewer";

// --- TYPE DEFINITIONS (from original file) ---
interface FocusMode {
  id: string;
  name: string;
  description?: string;
  icon: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  is_active: boolean;
  documents?: Document[];
}

interface Document {
  id: string;
  display_name: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  status: string;
  source_type: string;
  original_path?: string;
  extension?: string;
  processing_status: string;
}

interface AvailableDocument {
  id: string;
  name: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  status: string;
  source_type: string;
  file_extension: string;
  is_in_focus_mode: boolean;
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  focus_modes?: {
    id: string;
    name: string;
    icon: string;
  };
  category?: string;
}

// --- UTILITY FUNCTIONS ---
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Smart filename truncation that preserves file extensions
const truncateFileName = (fileName: string, maxLength: number = 25) => {
  if (fileName.length <= maxLength) return fileName;

  const lastDotIndex = fileName.lastIndexOf('.');

  // If no extension or extension is very long, just truncate normally
  if (lastDotIndex === -1 || fileName.length - lastDotIndex > 10) {
    return fileName.substring(0, maxLength - 3) + '...';
  }

  const name = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex);

  // Calculate how much space we have for the name part
  const availableForName = maxLength - extension.length - 3; // 3 for "..."

  if (availableForName <= 0) {
    // Extension is too long, just truncate the whole thing
    return fileName.substring(0, maxLength - 3) + '...';
  }

  return name.substring(0, availableForName) + '...' + extension;
};

const getFileIcon = (mimeType?: string, fileName?: string): string => {
  // Handle by MIME type first (most accurate)
  const mimeToIcon: Record<string, string> = {
    // PDF
    "application/pdf": "/icons/filetypes/pdf.png",
    
    // Microsoft Office (legacy)
    "application/msword": "/icons/filetypes/word.png",
    "application/vnd.ms-excel": "/icons/filetypes/excel.png",
    "application/vnd.ms-powerpoint": "/icons/filetypes/ppt.png",
    
    // Microsoft Office (modern)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "/icons/filetypes/word.png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "/icons/filetypes/excel.png",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "/icons/filetypes/ppt.png",
    
    // Google Workspace
    "application/vnd.google-apps.document": "/icons/filetypes/word.png",
    "application/vnd.google-apps.spreadsheet": "/icons/filetypes/excel.png",
    "application/vnd.google-apps.presentation": "/icons/filetypes/ppt.png",
    
    // Text files
    "text/plain": "/icons/filetypes/file.png",
    "text/csv": "/icons/filetypes/excel.png",
    "text/rtf": "/icons/filetypes/file.png",
    "application/rtf": "/icons/filetypes/file.png",
    "text/xml": "/icons/filetypes/file.png",
    "application/xml": "/icons/filetypes/file.png",
    
    // Images
    "image/jpeg": "/icons/filetypes/file.png",
    "image/jpg": "/icons/filetypes/file.png",
    "image/png": "/icons/filetypes/file.png",
    "image/gif": "/icons/filetypes/file.png",
    
    // Audio/Video
    "audio/mpeg": "/icons/filetypes/file.png",
    "video/mp4": "/icons/filetypes/file.png",
    "video/avi": "/icons/filetypes/file.png",
  };
  
  // Check MIME type first
  if (mimeType && mimeToIcon[mimeType]) {
    return mimeToIcon[mimeType];
  }
  
  // Fallback to extension from filename
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const extToIcon: Record<string, string> = {
      // Microsoft Office
      doc: "/icons/filetypes/word.png",
      docx: "/icons/filetypes/word.png",
      xls: "/icons/filetypes/excel.png",
      xlsx: "/icons/filetypes/excel.png",
      ppt: "/icons/filetypes/ppt.png",
      pptx: "/icons/filetypes/ppt.png",
      
      // Adobe
      pdf: "/icons/filetypes/pdf.png",
      
      // Text files
      txt: "/icons/filetypes/file.png",
      csv: "/icons/filetypes/excel.png",
      rtf: "/icons/filetypes/file.png",
      xml: "/icons/filetypes/file.png",
      
      // Images
      jpg: "/icons/filetypes/file.png",
      jpeg: "/icons/filetypes/file.png",
      png: "/icons/filetypes/file.png",
      gif: "/icons/filetypes/file.png",
      
      // Audio/Video
      mp3: "/icons/filetypes/file.png",
      mp4: "/icons/filetypes/file.png",
      avi: "/icons/filetypes/file.png",
    };
    
    if (extension && extToIcon[extension]) {
      return extToIcon[extension];
    }
  }
  
  return "/icons/filetypes/file.png";
};

// --- REUSABLE COMPONENTS (Standardized) ---

const DocumentCard = memo(
  ({
    document,
    onRemove,
    onView,
  }: {
    document: Document;
    onRemove: (documentId: string) => void;
    onView: (document: Document) => void;
  }) => {
    return (
      <div 
        className="group cursor-pointer relative bg-white border-none rounded-xl p-4 py-[14px] hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col justify-between"
        onClick={() => onView(document)}
      >
        <div className="pb-2">
          <p 
            className="text-sm font-medium text-gray-900 font-sans leading-tight"
            title={document.display_name}
          >
            {truncateFileName(document.display_name)}
          </p>
        </div>
        <div className="flex justify-center mt-auto items-center">
          <div className="flex items-center">
            <Image
              src={getFileIcon(document.mime_type, document.display_name)}
              alt={document.mime_type || "file"}
              width={16}
              height={16}
            />
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-black/50 font-sans">
              {formatDate(document.created_at)}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(document);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/api/documents/${document.id}/download`,
                      "_blank"
                    );
                    toast.success(`Downloading ${document.display_name}`);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(document.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove from Focus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1">
          {document.status === "COMPLETED" ? (
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white border-none [box-shadow:inset_0_0_16px_0_rgba(163,188,1,0.4)]">
              <Check className="w-3 h-3 text-custom-dark-green" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-50 border-none ">
              <CircleAlert className="w-3 h-3 text-red-800" />
            </div>
          )}
        </div>
      </div>
    );
  }
);
DocumentCard.displayName = "DocumentCard";

const ConversationCard = memo(
  ({
    conversation,
    onDelete,
    onArchive,
  }: {
    conversation: Conversation;
    onDelete: (id: string) => void;
    onArchive: (id: string, isArchived: boolean) => void;
  }) => {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden border-0 bg-white">
        <CardContent className="p-4">
          <div className="space-y-2">
            {conversation.focus_modes && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-xs">{conversation.focus_modes.icon}</span>
                <span className="font-medium">
                  {conversation.focus_modes.name}
                </span>
              </div>
            )}
            {conversation.category && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4 text-[#A3BC02]" />
                <span className="font-medium">{conversation.category}</span>
              </div>
            )}
            <h3 className="font-medium text-black text-lg leading-tight line-clamp-3 font-sans mb-2 h-[4.25rem]">
              {conversation.title || "Untitled Conversation"}
            </h3>
            <hr className="border-black/10" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/40 font-sans">
                Created: {formatDate(conversation.created_at)}
              </span>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                    >
                      <Trash2 className="w-4 h-4 text-black/40" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the conversation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(conversation.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                    >
                      <Archive
                        className={`w-4 h-4 ${
                          conversation.is_archived
                            ? "text-[#A3BC02]"
                            : "text-black/40"
                        }`}
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {conversation.is_archived ? "Unarchive" : "Archive"}{" "}
                        Conversation?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {conversation.is_archived
                          ? "This will move the conversation back to your active list."
                          : "This will hide the conversation from your main list."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          onArchive(conversation.id, conversation.is_archived)
                        }
                        className="bg-[#A3BC02] hover:bg-[#8BA000]"
                      >
                        {conversation.is_archived ? "Unarchive" : "Archive"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link href={`/c/${conversation.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                  >
                    <ExternalLink className="w-4 h-4 text-[#A3BC02]" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
ConversationCard.displayName = "ConversationCard";

// --- MAIN PAGE COMPONENT ---
export default function FocusModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // State management
  const [focusMode, setFocusMode] = useState<FocusMode | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDocumentsDialogOpen, setAddDocumentsDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  // Data loading functions
  const loadFocusModeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [focusModeRes, documentsRes, conversationsRes] = await Promise.all([
        fetch(`/api/focus-modes/${id}`),
        fetch(`/api/focus-modes/${id}/documents?page_size=100`),
        fetch(`/api/conversations?focus_mode_id=${id}&page_size=100`),
      ]);

      if (!focusModeRes.ok) throw new Error("Failed to load focus mode");
      const focusModeData = await focusModeRes.json();
      setFocusMode(focusModeData);

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setDocuments(documentsData.documents || []);
      }

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load focus mode data:", error);
      toast.error("Failed to load focus mode data.");
      router.push("/focus");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadFocusModeData();
  }, [loadFocusModeData]);

  // Action handlers

  const removeDocumentFromFocusMode = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/focus-modes/${id}/documents/${documentId}`,
        { method: "DELETE" }
      );
      
      // 204 No Content is success for DELETE operations
      if (response.ok || response.status === 204) {
        // Refetch the data to ensure UI is in sync
        await loadFocusModeData();
        toast.success("Document removed from focus mode.");
      } else {
        console.error("Failed to remove document. Status:", response.status);
        toast.error("Failed to remove document.");
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Failed to remove document.");
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        toast.success("Conversation deleted.");
      } else {
        toast.error("Failed to delete conversation.");
      }
    } catch (error) {
      toast.error("Failed to delete conversation.");
    }
  };

  const toggleArchiveConversation = async (
    conversationId: string,
    isArchived: boolean
  ) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: !isArchived }),
      });
      if (response.ok) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, is_archived: !isArchived }
              : conv
          )
        );
        toast.success(
          isArchived ? "Conversation unarchived." : "Conversation archived."
        );
      } else {
        toast.error("Failed to update conversation.");
      }
    } catch (error) {
      toast.error("Failed to update conversation.");
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
      </div>
    );
  }

  if (!focusMode) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Focus mode not found
          </h3>
          <Link href="/focus">
            <Button>Back to Focus Modes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{focusMode.icon}</span>
            <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
              {focusMode.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/focus")}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Focus Modes
            </Button>
            <Button
              onClick={() => setAddDocumentsDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              <Plus className="w-4 h-4" />
              Add Files To Focus
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            {focusMode.description ||
              `Manage documents and conversations in the ${focusMode.name} focus mode.`}
          </p>
        </div>

        {/* Documents Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium text-gray-900 font-serif mb-6">
            Documents ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Documents in this Focus Mode
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Add documents to start asking questions about them.
              </p>
              <Button
                onClick={() => setAddDocumentsDialogOpen(true)}
                className="rounded-full text-custom-dark-green border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onRemove={removeDocumentFromFocusMode}
                  onView={(document) => {
                    setViewingDocument(document);
                    setIsViewerOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Conversations Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900 font-serif">
              Conversations ({conversations.length})
            </h2>
            <Link href={`/c/new?focus_mode_id=${id}`}>
              <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Start Conversation
              </Button>
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Conversations Yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Start a conversation to see it appear here.
              </p>
              <Link href={`/c/new?focus_mode_id=${id}`}>
                <Button className="rounded-full text-custom-dark-green border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Conversation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {conversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  onDelete={deleteConversation}
                  onArchive={toggleArchiveConversation}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Selection Modal */}
      <DocumentSelectionModal
        isOpen={addDocumentsDialogOpen}
        onClose={() => setAddDocumentsDialogOpen(false)}
        focusModeId={id}
        focusModeName={focusMode.name}
        onDocumentsAdded={loadFocusModeData}
      />

      {/* Document Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {viewingDocument
              ? `Viewing ${viewingDocument.display_name}`
              : "Document Viewer"}
          </DialogTitle>
          {viewingDocument && (
            <DocumentViewer
              documentId={viewingDocument.id}
              documentName={viewingDocument.display_name}
              fileType={viewingDocument.extension || undefined}
              className="h-full"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
