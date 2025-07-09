"use client";

import { useState, useEffect, useCallback, memo, use } from "react";
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
  Calendar,
  Download,
  Search,
  Filter,
  Target,
  Archive,
} from "lucide-react";
import Link from "next/link";

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
  extracted_metadata?: {
    topics?: string[];
    sentiment?: string;
    categories?: string[];
    document_type?: string;
  };
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

export default function FocusModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [focusMode, setFocusMode] = useState<FocusMode | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
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

  const loadFocusMode = async () => {
    try {
      setIsLoading(true);
      
      // Load focus mode details (without documents)
      const focusModeResponse = await fetch(`/api/focus-modes/${id}`);
      if (!focusModeResponse.ok) {
        toast.error("Failed to load focus mode");
        router.push("/focus");
        return;
      }
      
      const focusModeData = await focusModeResponse.json();
      setFocusMode(focusModeData);
      
      // Load documents using dedicated endpoint
      loadDocuments();
      
      // Load conversations for this focus mode
      loadConversations();
    } catch (error) {
      console.error("Failed to load focus mode:", error);
      toast.error("Failed to load focus mode");
      router.push("/focus");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/focus-modes/${id}/documents?page_size=100`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error("Failed to load documents for focus mode");
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(
        `/api/conversations?focus_mode_id=${id}&page_size=50`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error("Failed to load conversations for focus mode");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadAvailableDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
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
      console.error("Failed to load available documents:", error);
      toast.error("Failed to load available documents");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const addDocumentsToFocusMode = async () => {
    if (selectedDocuments.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    try {
      setIsAddingDocuments(true);
      const response = await fetch(`/api/focus-modes/${id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_ids: Array.from(selectedDocuments),
        }),
      });

      if (response.ok) {
        toast.success(
          `${selectedDocuments.size} document(s) added to focus mode`
        );
        setAddDocumentsDialogOpen(false);
        setSelectedDocuments(new Set());
        loadDocuments(); // Reload to get updated document list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add documents");
      }
    } catch (error) {
      console.error("Failed to add documents:", error);
      toast.error("Failed to add documents");
    } finally {
      setIsAddingDocuments(false);
    }
  };

  const removeDocumentFromFocusMode = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/focus-modes/${id}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        toast.success("Document removed from focus mode");
      } else {
        toast.error("Failed to remove document");
      }
    } catch (error) {
      console.error("Failed to remove document:", error);
      toast.error("Failed to remove document");
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
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const toggleArchiveConversation = async (
    conversationId: string,
    isArchived: boolean
  ) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
          isArchived ? "Conversation unarchived" : "Conversation archived"
        );
      } else {
        toast.error("Failed to update conversation");
      }
    } catch (error) {
      console.error("Failed to update conversation:", error);
      toast.error("Failed to update conversation");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFileExtension = (document: Document | AvailableDocument) => {
    const displayName = 'display_name' in document ? document.display_name : document.name;
    
    if (displayName) {
      const parts = displayName.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1];
      }
    }
    
    // Fallback to mime type mapping
    const mimeToExt: { [key: string]: string } = {
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/vnd.ms-powerpoint": "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
      "text/plain": "txt",
      "text/csv": "csv",
      "image/jpeg": "jpg",
      "image/png": "png",
      "audio/mpeg": "mp3",
      "video/mp4": "mp4",
      "video/x-msvideo": "avi",
      "text/css": "css",
      "application/javascript": "js",
      "application/xml": "xml",
    };
    
    return mimeToExt[document.mime_type] || "file";
  };

  const getFileIcon = (document: Document | AvailableDocument) => {
    const extension = getFileExtension(document);
    
    const iconMap: { [key: string]: string } = {
      pdf: "/icons/filetypes/pdf.png",
      doc: "/icons/filetypes/word.png",
      docx: "/icons/filetypes/word.png",
      xls: "/icons/filetypes/excel.png",
      xlsx: "/icons/filetypes/excel.png",
      ppt: "/icons/filetypes/ppt.png",
      pptx: "/icons/filetypes/ppt.png",
      txt: "/icons/filetypes/file.png",
      csv: "/icons/filetypes/excel.png",
      jpg: "/icons/filetypes/file.png",
      jpeg: "/icons/filetypes/file.png",
      png: "/icons/filetypes/file.png",
      mp3: "/icons/filetypes/file.png",
      mp4: "/icons/filetypes/file.png",
      avi: "/icons/filetypes/file.png",
      css: "/icons/filetypes/file.png",
      js: "/icons/filetypes/file.png",
      xml: "/icons/filetypes/file.png",
    };
    
    return iconMap[extension.toLowerCase()] || "/icons/filetypes/file.png";
  };

  const filteredAvailableDocuments = availableDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadFocusMode();
  }, [id]);

  const DocumentCard = memo(({ document }: { document: Document }) => {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden border-0 bg-white">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={getFileIcon(document)}
                alt={getFileExtension(document)}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-black text-sm leading-tight font-sans line-clamp-2">
                  {document.display_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getFileExtension(document).toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(document.file_size_bytes)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Added: {formatDate(document.created_at)}</span>
            </div>

            <hr className="border-black/10" />

            <div className="flex items-center justify-between">
              <Badge
                variant={
                  document.status === "COMPLETED" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {document.status}
              </Badge>

              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 rounded-full hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-custom-dark-green font-serif">
                        Remove Document
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 font-sans">
                        Remove "{document.display_name}" from this focus mode?
                        <br />
                        <span className="block mt-2 text-sm">
                          This will not delete the document, just remove it from
                          this focus mode.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeDocumentFromFocusMode(document.id)}
                        className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Link
                  href={`/api/documents/${document.id}/download`}
                  target="_blank"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 rounded-full hover:bg-blue-50"
                  >
                    <Download className="w-3 h-3 text-blue-500" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3BC02] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading focus mode...</p>
        </div>
      </div>
    );
  }

  if (!focusMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Focus mode not found
          </h3>
          <p className="text-gray-500 mb-4">
            The focus mode you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link href="/focus">
            <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans">
              Back to Focus Modes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2">
            <span className="text-4xl">{focusMode.icon}</span>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-7xl font-medium text-custom-dark-green font-serif whitespace-nowrap">
                {focusMode.name}
              </h1>
              <div className="flex items-center gap-8">
                <span className="text-sm text-gray-500 font-sans">
                  {documents.length} Total Documents
                </span>
                <Dialog
                  open={addDocumentsDialogOpen}
                  onOpenChange={setAddDocumentsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={loadAvailableDocuments}
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
                    "
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Files To Focus
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-gray-200 rounded-2xl max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-custom-dark-green font-serif">
                        Add Documents to Focus Mode
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 font-sans">
                        Select documents to add to "{focusMode.name}" focus
                        mode.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 rounded-full"
                        />
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {isLoadingDocuments ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A3BC02]"></div>
                          </div>
                        ) : filteredAvailableDocuments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No available documents found
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredAvailableDocuments.map((document) => (
                              <div
                                key={document.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                              >
                                <Checkbox
                                  checked={selectedDocuments.has(document.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedDocuments((prev) => {
                                      const newSet = new Set(prev);
                                      if (checked) {
                                        newSet.add(document.id);
                                      } else {
                                        newSet.delete(document.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                />
                                <img
                                  src={getFileIcon(document)}
                                  alt={getFileExtension(document)}
                                  className="w-6 h-6"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {document.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {getFileExtension(document).toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatFileSize(document.file_size_bytes)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddDocumentsDialogOpen(false);
                          setSelectedDocuments(new Set());
                          setSearchQuery("");
                        }}
                        className="rounded-full font-sans"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addDocumentsToFocusMode}
                        disabled={
                          isAddingDocuments || selectedDocuments.size === 0
                        }
                        className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
                      >
                        {isAddingDocuments
                          ? "Adding..."
                          : `Add ${selectedDocuments.size} Document${
                              selectedDocuments.size !== 1 ? "s" : ""
                            }`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {focusMode.description && (
              <p className="text-gray-600 mt-2 text-base">
                {focusMode.description}
              </p>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900 font-serif">
              Documents
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add documents to this focus mode to get started.
              </p>
              <Dialog
                open={addDocumentsDialogOpen}
                onOpenChange={setAddDocumentsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={loadAvailableDocuments}
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Document
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          )}
        </div>

        {/* Conversations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900 font-serif">
              Conversations
            </h2>
            <Link href={`/chat?focus_mode_id=${id}`}>
              <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Start Conversation
              </Button>
            </Link>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start a conversation in this focus mode to see it here.
              </p>
              <Link href={`/chat?focus_mode_id=${id}`}>
                <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Conversation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {conversations.map((conversation: any) => (
                <Card
                  key={conversation.id}
                  className="group hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer border-0 bg-white"
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">

                      {conversation.category && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4 text-[#A3BC02]" />
                          <span className="font-medium">{conversation.category}</span>
                        </div>
                      )}

                      <h3 className="font-medium text-black text-md leading-tight line-clamp-3 font-sans mb-2 h-[4rem]">
                        {conversation.title || "Untitled Conversation"}
                      </h3>

                      <hr className="border-black/10" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-black/40 font-sans">
                          Created: {formatDate(conversation.created_at)}
                        </span>

                        <div className="flex items-center gap-3 opacity-100 transition-opacity justify-center">
                          {/* Delete Confirmation Dialog */}
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
                            <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-custom-dark-green font-serif">
                                  Delete Conversation
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 font-sans">
                                  Are you sure you want to{" "}
                                  <span className="font-semibold text-red-600">delete</span>{" "}
                                  this conversation?
                                  <br />
                                  <span className="block mt-2">
                                    <span className="font-semibold">
                                      {conversation.title || "Untitled Conversation"}
                                    </span>
                                  </span>
                                  <br />
                                  <span className="block mt-2">
                                    This action{" "}
                                    <span className="font-semibold">cannot be undone</span>.
                                    All messages in this conversation will be{" "}
                                    <span className="font-semibold">
                                      permanently removed
                                    </span>
                                    .
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteConversation(conversation.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full font-sans"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Archive Confirmation Dialog */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 rounded-full hover:bg-white/50"
                              >
                                <Archive className={`w-4 h-4 ${
                                  conversation.is_archived
                                    ? 'text-[#A3BC02]'
                                    : 'text-black/40'
                                }`} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-custom-dark-green font-serif">
                                  {conversation.is_archived ? "Unarchive" : "Archive"}{" "}
                                  Conversation
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 font-sans">
                                  Are you sure you want to{" "}
                                  <span className="font-semibold">
                                    {conversation.is_archived ? "unarchive" : "archive"}
                                  </span>{" "}
                                  this conversation?
                                  <br />
                                  <span className="block mt-2">
                                    <span className="font-semibold">
                                      {conversation.title || "Untitled Conversation"}
                                    </span>
                                  </span>
                                  <br />
                                  <span className="block mt-2">
                                    {conversation.is_archived ? (
                                      <>
                                        This conversation will be{" "}
                                        <span className="font-semibold">
                                          moved back to your active conversations
                                        </span>
                                        .
                                      </>
                                    ) : (
                                      <>
                                        This conversation will be{" "}
                                        <span className="font-semibold">
                                          hidden from your main conversation list
                                        </span>
                                        .
                                      </>
                                    )}
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-full font-sans">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    toggleArchiveConversation(
                                      conversation.id,
                                      conversation.is_archived
                                    )
                                  }
                                  className="bg-[#A3BC02] hover:bg-[#8BA000] text-white border-0 rounded-full font-sans"
                                >
                                  {conversation.is_archived ? "Unarchive" : "Archive"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Link href={`/chat?conversation=${conversation.id}`}>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
