"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  FileText,
  Check,
  Upload,
} from "lucide-react";
import Image from "next/image";

interface Document {
  id: string;
  display_name: string;
  mime_type: string;
  source_type: string;
  file_size_bytes: number;
  created_at: string;
  status: string;
  is_in_focus_mode: boolean;
}

interface DocumentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusModeId: string;
  focusModeName: string;
  onDocumentsAdded: () => void;
}

const getFileIcon = (mimeType: string): string => {
  const iconMap: Record<string, string> = {
    "application/pdf": "/icons/filetypes/pdf.png",
    "application/msword": "/icons/filetypes/word.png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "/icons/filetypes/word.png",
    "application/vnd.ms-excel": "/icons/filetypes/excel.png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "/icons/filetypes/excel.png",
    "application/vnd.ms-powerpoint": "/icons/filetypes/ppt.png",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "/icons/filetypes/ppt.png",
    "text/plain": "/icons/filetypes/file.png",
    "text/csv": "/icons/filetypes/excel.png",
    "image/jpeg": "/icons/filetypes/file.png",
    "image/png": "/icons/filetypes/file.png",
    "image/gif": "/icons/filetypes/file.png",
  };
  return iconMap[mimeType] || "/icons/filetypes/file.png";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function DocumentSelectionModal({
  isOpen,
  onClose,
  focusModeId,
  focusModeName,
  onDocumentsAdded,
}: DocumentSelectionModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "drive">("library");

  // Filter documents
  const allFilteredDocs = documents.filter(doc =>
    doc.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    doc.status === "COMPLETED"
  );

  const libraryDocs = allFilteredDocs.filter(doc => doc.source_type === "UPLOAD");
  const googleDriveDocs = allFilteredDocs.filter(doc => doc.source_type === "googledrive");
  
  const showGoogleDriveTab = googleDriveDocs.length > 0;
  const currentTabDocs = activeTab === "library" ? libraryDocs : googleDriveDocs;

  // Load available documents
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/focus-modes/documents/available?exclude_focus_mode_id=${focusModeId}&page_size=1000`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        toast.error("Failed to load available documents");
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast.error("Failed to load available documents");
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      setSelectedDocuments(new Set());
      setSearchQuery("");
      setActiveTab(libraryDocs.length > 0 ? "library" : "drive");
    }
  }, [isOpen, focusModeId]);

  // Update active tab if library becomes empty
  useEffect(() => {
    if (activeTab === "library" && libraryDocs.length === 0 && showGoogleDriveTab) {
      setActiveTab("drive");
    }
  }, [libraryDocs.length, showGoogleDriveTab, activeTab]);

  // Handle document selection
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Handle select all for current tab
  const handleSelectAll = () => {
    const availableDocs = currentTabDocs.filter(doc => !doc.is_in_focus_mode);
    const docIds = availableDocs.map(doc => doc.id);
    const allSelected = docIds.every(id => selectedDocuments.has(id));

    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all from current tab
        docIds.forEach(id => newSet.delete(id));
      } else {
        // Select all available from current tab
        docIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  // Add selected documents to focus mode
  const handleAddDocuments = async () => {
    if (selectedDocuments.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/focus-modes/${focusModeId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_ids: Array.from(selectedDocuments),
        }),
      });

      if (response.ok) {
        toast.success(`${selectedDocuments.size} document(s) added to focus mode`);
        onDocumentsAdded();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add documents");
      }
    } catch (error) {
      console.error("Failed to add documents:", error);
      toast.error("Failed to add documents");
    } finally {
      setIsAdding(false);
    }
  };

  const availableDocsInTab = currentTabDocs.filter(doc => !doc.is_in_focus_mode);
  const selectedInCurrentTab = availableDocsInTab.filter(doc => selectedDocuments.has(doc.id)).length;
  const allSelectedInTab = availableDocsInTab.length > 0 && selectedInCurrentTab === availableDocsInTab.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 rounded-2xl max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-custom-dark-green font-serif">
            Add Documents to "{focusModeName}"
          </DialogTitle>
          <DialogDescription className="text-gray-600 font-sans">
            Select documents to add to this focus mode. Documents can be in multiple focus modes.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-[#A3BC02] text-[#A3BC02]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload className="w-4 h-4" />
            Library ({libraryDocs.length})
          </button>
          {showGoogleDriveTab && (
            <button
              onClick={() => setActiveTab("drive")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "drive"
                  ? "border-[#A3BC02] text-[#A3BC02]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Image src="/icons/integrations/drive.png" alt="Google Drive" width={16} height={16} />
              Google Drive ({googleDriveDocs.length})
            </button>
          )}
        </div>

        {/* Select All */}
        {availableDocsInTab.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={allSelectedInTab}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-[#A3BC02] data-[state=checked]:border-[#A3BC02]"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All Available ({availableDocsInTab.length})
            </span>
            {selectedInCurrentTab > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedInCurrentTab} selected
              </Badge>
            )}
          </div>
        )}

        {/* Document List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#A3BC02]" />
            </div>
          ) : currentTabDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchQuery ? "No documents found" : "No documents available"}
              </h3>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : `No ${activeTab === "library" ? "uploaded" : "Google Drive"} documents found`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentTabDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    doc.is_in_focus_mode
                      ? "bg-gray-50 border-gray-200"
                      : selectedDocuments.has(doc.id)
                      ? "bg-[#A3BC02]/5 border-[#A3BC02]/20"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    checked={selectedDocuments.has(doc.id)}
                    onCheckedChange={() => toggleDocumentSelection(doc.id)}
                    disabled={doc.is_in_focus_mode}
                    className="data-[state=checked]:bg-[#A3BC02] data-[state=checked]:border-[#A3BC02]"
                  />
                  
                  <Image
                    src={getFileIcon(doc.mime_type)}
                    alt="File type"
                    width={24}
                    height={24}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      doc.is_in_focus_mode ? "text-gray-500" : "text-gray-900"
                    }`}>
                      {doc.display_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.source_type === "UPLOAD" 
                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {doc.source_type === "UPLOAD" ? "Library" : "Google Drive"}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(doc.file_size_bytes)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(doc.created_at)}
                      </span>
                      {doc.is_in_focus_mode && (
                        <Badge className="text-xs bg-gray-200 text-gray-600">
                          Already in this focus mode
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full font-sans"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddDocuments}
            disabled={isAdding || selectedDocuments.size === 0}
            className="bg-[#A3BC02] hover:bg-[#8BA000] text-white rounded-full font-sans"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              `Add ${selectedDocuments.size} Document${selectedDocuments.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}