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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Search,
  Target,
  Archive,
  MoreHorizontal,
  Check,
  CircleAlert,
  Loader2,
  FolderOpen,
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

const getFileIcon = (extension?: string | null): string => {
  const extToIcon: Record<string, string> = {
    doc: "/icons/filetypes/word.png",
    docx: "/icons/filetypes/word.png",
    xls: "/icons/filetypes/excel.png",
    xlsx: "/icons/filetypes/excel.png",
    ppt: "/icons/filetypes/ppt.png",
    pptx: "/icons/filetypes/ppt.png",
    pdf: "/icons/filetypes/pdf.png",
    txt: "/icons/filetypes/file.png",
    csv: "/icons/filetypes/excel.png",
    jpg: "/icons/filetypes/file.png",
    jpeg: "/icons/filetypes/file.png",
    png: "/icons/filetypes/file.png",
  };
  return (
    extToIcon[extension?.toLowerCase() || ""] || "/icons/filetypes/file.png"
  );
};

// --- REUSABLE COMPONENTS (Standardized) ---

const DocumentCard = memo(
  ({
    document,
    onRemove,
  }: {
    document: Document;
    onRemove: (documentId: string) => void;
  }) => {
    return (
      <div className="group cursor-pointer relative bg-white border-none rounded-xl p-4 py-[14px] hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col justify-between">
        <div className="pb-2">
          <p className="text-sm font-medium text-gray-900 font-sans line-clamp-1 leading-tight">
            {document.display_name}
          </p>
        </div>
        <div className="flex justify-center mt-auto items-center">
          <div className="flex items-center">
            <Image
              src={getFileIcon(document.extension)}
              alt={document.extension || "file"}
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
                  onClick={() => {
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
                  onClick={() => onRemove(document.id)}
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
          {document.processing_status === "COMPLETED" ? (
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
  const [availableDocuments, setAvailableDocuments] = useState<
    AvailableDocument[]
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const loadAvailableDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await fetch(
        `/api/focus-modes/documents/available?exclude_focus_mode_id=${id}&page_size=100`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableDocuments(data.documents || []);
      } else {
        toast.error("Failed to load available documents");
      }
    } catch (error) {
      toast.error("Failed to load available documents");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadFocusModeData();
  }, [loadFocusModeData]);

  // Action handlers
  const addDocumentsToFocusMode = async () => {
    if (selectedDocuments.size === 0) return;
    setIsAddingDocuments(true);
    try {
      const response = await fetch(`/api/focus-modes/${id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_ids: Array.from(selectedDocuments) }),
      });
      if (response.ok) {
        toast.success(`${selectedDocuments.size} document(s) added.`);
        setAddDocumentsDialogOpen(false);
        setSelectedDocuments(new Set());
        loadFocusModeData();
      } else {
        toast.error("Failed to add documents.");
      }
    } catch (error) {
      toast.error("Failed to add documents.");
    } finally {
      setIsAddingDocuments(false);
    }
  };

  const removeDocumentFromFocusMode = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/focus-modes/${id}/documents/${documentId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        toast.success("Document removed from focus mode.");
      } else {
        toast.error("Failed to remove document.");
      }
    } catch (error) {
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

  const filteredAvailableDocuments = availableDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Dialog
              open={addDocumentsDialogOpen}
              onOpenChange={setAddDocumentsDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={loadAvailableDocuments}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                >
                  <Plus className="w-4 h-4" />
                  Add Files To Focus
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-gray-200 rounded-2xl max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-custom-dark-green font-serif">
                    Add Documents to "{focusMode.name}"
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-sans">
                    Select documents to add to this focus mode.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative my-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  {isLoadingDocuments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#A3BC02]" />
                    </div>
                  ) : filteredAvailableDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available documents found.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAvailableDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <Checkbox
                            checked={selectedDocuments.has(doc.id)}
                            onCheckedChange={(checked) =>
                              setSelectedDocuments((prev) => {
                                const newSet = new Set(prev);
                                if (checked) newSet.add(doc.id);
                                else newSet.delete(doc.id);
                                return newSet;
                              })
                            }
                          />
                          <Image
                            src={getFileIcon(doc.file_extension)}
                            alt={doc.file_extension}
                            width={24}
                            height={24}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {doc.file_extension?.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(doc.file_size_bytes)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddDocumentsDialogOpen(false)}
                    className="rounded-full font-sans"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addDocumentsToFocusMode}
                    disabled={isAddingDocuments || selectedDocuments.size === 0}
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
                  >
                    {isAddingDocuments ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Add ${selectedDocuments.size} Document(s)`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                onClick={() => {
                  setAddDocumentsDialogOpen(true);
                  loadAvailableDocuments();
                }}
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
    </div>
  );
}
