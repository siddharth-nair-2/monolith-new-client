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
  Filter
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
  name: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  updated_at: string;
  status: string;
  source_type: string;
  file_extension: string;
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

export default function FocusModePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [focusMode, setFocusMode] = useState<FocusMode | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDocumentsDialogOpen, setAddDocumentsDialogOpen] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<AvailableDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFocusMode = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/focus-modes/${id}?include_documents=true`);
      
      if (response.ok) {
        const data = await response.json();
        setFocusMode(data);
        setDocuments(data.documents || []);
      } else {
        toast.error("Failed to load focus mode");
        router.push("/focus");
      }
    } catch (error) {
      console.error("Failed to load focus mode:", error);
      toast.error("Failed to load focus mode");
      router.push("/focus");
    } finally {
      setIsLoading(false);
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
        toast.success(`${selectedDocuments.size} document(s) added to focus mode`);
        setAddDocumentsDialogOpen(false);
        setSelectedDocuments(new Set());
        loadFocusMode(); // Reload to get updated document list
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
      const response = await fetch(`/api/focus-modes/${id}/documents/${documentId}`, {
        method: "DELETE",
      });

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

  const getFileIcon = (extension: string | undefined | null) => {
    if (!extension) return "/icons/filetypes/file.svg";
    
    const iconMap: { [key: string]: string } = {
      pdf: "/icons/filetypes/pdf.svg",
      doc: "/icons/filetypes/doc.svg",
      docx: "/icons/filetypes/doc.svg",
      xls: "/icons/filetypes/xls.svg",
      xlsx: "/icons/filetypes/xls.svg",
      ppt: "/icons/filetypes/ppt.svg",
      pptx: "/icons/filetypes/ppt.svg",
      txt: "/icons/filetypes/txt.svg",
      csv: "/icons/filetypes/csv.svg",
      jpg: "/icons/filetypes/jpg.svg",
      jpeg: "/icons/filetypes/jpg.svg",
      png: "/icons/filetypes/png.svg",
      mp3: "/icons/filetypes/mp3.svg",
      mp4: "/icons/filetypes/mp4.svg",
      avi: "/icons/filetypes/avi.svg",
      css: "/icons/filetypes/css.svg",
      js: "/icons/filetypes/javascript.svg",
      xml: "/icons/filetypes/xml.svg",
    };
    
    return iconMap[extension.toLowerCase()] || "/icons/filetypes/file.svg";
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
                src={getFileIcon(document.file_extension)}
                alt={document.file_extension}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-black text-sm leading-tight font-sans line-clamp-2">
                  {document.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {document.file_extension?.toUpperCase() || "FILE"}
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
                variant={document.status === "processed" ? "default" : "secondary"}
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
                        Remove "{document.name}" from this focus mode?
                        <br />
                        <span className="block mt-2 text-sm">
                          This will not delete the document, just remove it from this focus mode.
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

                <Link href={`/api/documents/${document.id}/download`} target="_blank">
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
            The focus mode you're looking for doesn't exist or you don't have access to it.
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/focus">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{focusMode.icon}</span>
            <div>
              <h1 className="text-6xl font-medium text-custom-dark-green font-serif">
                {focusMode.name}
              </h1>
              {focusMode.description && (
                <p className="text-gray-600 mt-2 text-lg">{focusMode.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{documents.length} documents</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>0 conversations</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(focusMode.created_at)}</span>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-gray-900 font-serif">
              Documents
            </h2>
            <Dialog open={addDocumentsDialogOpen} onOpenChange={setAddDocumentsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={loadAvailableDocuments}
                  className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-gray-200 rounded-2xl max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-custom-dark-green font-serif">
                    Add Documents to Focus Mode
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-sans">
                    Select documents to add to "{focusMode.name}" focus mode.
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
                              src={getFileIcon(document.file_extension)}
                              alt={document.file_extension}
                              className="w-6 h-6"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {document.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {document.file_extension?.toUpperCase() || "FILE"}
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
                    disabled={isAddingDocuments || selectedDocuments.size === 0}
                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
                  >
                    {isAddingDocuments
                      ? "Adding..."
                      : `Add ${selectedDocuments.size} Document${selectedDocuments.size !== 1 ? "s" : ""}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              <Dialog open={addDocumentsDialogOpen} onOpenChange={setAddDocumentsDialogOpen}>
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
              <Button
                className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Start Conversation
              </Button>
            </Link>
          </div>

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
        </div>
      </div>
    </div>
  );
}