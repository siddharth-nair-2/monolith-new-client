"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApiRequestJson } from "@/lib/client-api";
import { toast } from "sonner";
import {
  Folder,
  File,
  Search,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  FolderOpen,
  FileText,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Download,
  CloudUpload,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useIntegrations } from "@/lib/integrations-context";

// Types for Google Drive content
interface SyncedFolder {
  id: string;
  name: string;
  document_count: number;
  folder_count: number;
  last_modified?: string;
  drive_type: string;
}

interface SyncedDocument {
  id: string;
  name: string;
  source_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  file_size_bytes?: number;
  extension?: string;
  processing_status: string;
  uploaded_by?: string;
  chunk_count?: number;
  has_permission: boolean;
  mime_type?: string;
  view_url?: string;
  download_url?: string;
  thumbnail_url?: string;
  connection_id?: string;
  remote_object_id?: string;
  remote_parent_id?: string;
  file_author?: string;
  file_created_at?: string;
  file_modified_at?: string;
  error_details?: string;
}

interface SyncedFolderInfo {
  id: string;
  name: string;
  path: string;
  is_root: boolean;
  drive_type: string;
}

interface SyncedContentResponse {
  current_folder: SyncedFolderInfo;
  folders: SyncedFolder[];
  documents: SyncedDocument[];
}

export default function GoogleDriveLibraryPage() {
  const { googleDriveConnections, isLoading: integrationsLoading } = useIntegrations();
  
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<SyncedFolderInfo | null>(null);
  const [folders, setFolders] = useState<SyncedFolder[]>([]);
  const [documents, setDocuments] = useState<SyncedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumb, setBreadcrumb] = useState<SyncedFolderInfo[]>([]);
  
  // Dialog states
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<SyncedDocument | null>(null);

  // Auto-select first connection if available
  useEffect(() => {
    if (googleDriveConnections.length > 0 && !selectedConnection) {
      setSelectedConnection(googleDriveConnections[0].id);
    }
  }, [googleDriveConnections, selectedConnection]);

  // Fetch Google Drive content
  const fetchContent = useCallback(async (folderId?: string) => {
    if (!selectedConnection) return;
    
    setIsLoading(true);
    try {
      let url = `/api/proxy/v1/google-drive/virtual-folders/${selectedConnection}`;
      if (folderId) {
        url += `?folder_id=${folderId}`;
      }

      const { data, error } = await clientApiRequestJson<SyncedContentResponse>(url);

      if (error) {
        console.error("Error fetching Google Drive content:", error);
        toast.error("Failed to load Google Drive content");
        return;
      }

      if (data) {
        setCurrentFolder(data.current_folder);
        setFolders(data.folders);
        setDocuments(data.documents);
        
        // Update breadcrumb
        if (data.current_folder.is_root) {
          setBreadcrumb([data.current_folder]);
        } else {
          // For simplicity, just add to breadcrumb (in production, you'd want proper path tracking)
          setBreadcrumb(prev => {
            const existing = prev.find(f => f.id === data.current_folder.id);
            if (existing) {
              // Navigate back to existing folder
              return prev.slice(0, prev.indexOf(existing) + 1);
            } else {
              // Add new folder to breadcrumb
              return [...prev, data.current_folder];
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to load Google Drive content:", error);
      toast.error("Failed to load Google Drive content");
    } finally {
      setIsLoading(false);
    }
  }, [selectedConnection]);

  useEffect(() => {
    if (selectedConnection) {
      fetchContent();
    }
  }, [selectedConnection, fetchContent]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (extension?: string, mimeType?: string) => {
    // Handle Google Workspace files by MIME type
    if (mimeType?.startsWith("application/vnd.google-apps.")) {
      if (mimeType.includes("document")) {
        return <FileText className="w-5 h-5 text-blue-500" />;
      } else if (mimeType.includes("spreadsheet")) {
        return <FileText className="w-5 h-5 text-green-500" />;
      } else if (mimeType.includes("presentation")) {
        return <FileText className="w-5 h-5 text-orange-500" />;
      }
    }

    // Handle by extension
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const navigateToFolder = (folderId: string) => {
    fetchContent(folderId);
  };

  const navigateToBreadcrumb = (folder: SyncedFolderInfo) => {
    if (folder.is_root) {
      fetchContent();
    } else {
      fetchContent(folder.id);
    }
  };

  const refreshContent = () => {
    if (currentFolder) {
      fetchContent(currentFolder.is_root ? undefined : currentFolder.id);
    } else {
      fetchContent();
    }
    toast.success("Content refreshed");
  };

  if (integrationsLoading) {
    return (
      <div className="min-h-screen bg-none">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
          </div>
        </div>
      </div>
    );
  }

  if (googleDriveConnections.length === 0) {
    return (
      <div className="min-h-screen bg-none">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <Image
              src="/icons/integrations/drive.png"
              alt="Google Drive"
              width={64}
              height={64}
              className="mx-auto mb-4 opacity-50"
            />
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              No Google Drive Connected
            </h2>
            <p className="text-gray-500 mb-6 font-sans">
              Connect your Google Drive account to browse and search your synced documents.
            </p>
            <Button
              onClick={() => window.location.href = '/auth/settings'}
              className="rounded-full text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              <CloudUpload className="w-4 h-4 mr-2" />
              Connect Google Drive
            </Button>
          </div>
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
            <Image
              src="/icons/integrations/drive.png"
              alt="Google Drive"
              width={48}
              height={48}
            />
            <div>
              <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
                Google Drive Library
              </h1>
              {selectedConnection && (
                <p className="text-gray-600 text-sm font-sans mt-2">
                  {googleDriveConnections.find(c => c.id === selectedConnection)?.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {googleDriveConnections.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full"
                  >
                    Switch Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {googleDriveConnections.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      onClick={() => setSelectedConnection(connection.id)}
                      className={selectedConnection === connection.id ? "bg-gray-100" : ""}
                    >
                      <Image
                        src="/icons/integrations/drive.png"
                        alt="Google Drive"
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      {connection.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              onClick={refreshContent}
              variant="outline"
              className="rounded-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            Browse your synced Google Drive content. Only folders and files that have been synced will appear here.
          </p>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-50 rounded-lg">
            {breadcrumb.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <button
                  onClick={() => navigateToBreadcrumb(folder)}
                  className="text-sm font-sans text-gray-700 hover:text-[#A3BC02] transition-colors"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar with Search */}
          <div className="w-80 bg-white rounded-xl p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
              />
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              {currentFolder && !currentFolder.is_root && (
                <button
                  onClick={() => fetchContent()}
                  className="flex items-center w-full px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-sans text-gray-700">Back to Root</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-custom-dark-green font-serif">
                {currentFolder?.name || "Loading..."}
              </h2>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-[#00AC47] text-[#00AC47] bg-green-50">
                  <Image
                    src="/icons/integrations/drive.png"
                    alt="Google Drive"
                    width={12}
                    height={12}
                    className="mr-1"
                  />
                  Google Drive
                </Badge>
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                  Read-only
                </Badge>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Folders */}
                {folders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 font-serif">Folders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => navigateToFolder(folder.id)}
                          className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-[#A3BC01] hover:bg-[#FAFFD8] transition-all duration-200"
                        >
                          <FolderOpen className="w-8 h-8 mr-3 text-[#A3BC02]" />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-gray-900 group-hover:text-[#A3BC02] transition-colors">
                              {folder.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {folder.document_count} documents • {folder.folder_count} folders
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#A3BC02] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 font-serif">Documents</h3>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="group flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.extension, doc.mime_type)}
                            <Image
                              src="/icons/integrations/drive.png"
                              alt="Google Drive"
                              width={16}
                              height={16}
                              className="opacity-60"
                            />
                          </div>

                          <div className="flex-1 ml-3">
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#A3BC02] transition-colors">
                              {doc.name}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              {doc.file_size_bytes && (
                                <span>{formatFileSize(doc.file_size_bytes)}</span>
                              )}
                              {doc.file_created_at && (
                                <span>{format(new Date(doc.file_created_at), "MMM d, yyyy")}</span>
                              )}
                              {doc.file_author && (
                                <span>by {doc.file_author}</span>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  doc.processing_status === "COMPLETED"
                                    ? "border-green-300 text-green-700"
                                    : "border-yellow-300 text-yellow-700"
                                }`}
                              >
                                {doc.processing_status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-[#FAFFD8]"
                              onClick={() => {
                                setViewingDocument(doc);
                                setIsViewerOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full hover:bg-[#FAFFD8]"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => window.open(doc.view_url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in Google Drive
                                </DropdownMenuItem>
                                {doc.download_url && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.open(doc.download_url, "_blank");
                                        toast.success(`Downloading ${doc.name}`);
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && folders.length === 0 && documents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                      <CloudUpload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No content found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        This folder appears to be empty or no content has been synced yet.
                      </p>
                      <Button
                        onClick={refreshContent}
                        variant="outline"
                        className="rounded-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {viewingDocument ? `Viewing ${viewingDocument.name}` : 'Document Viewer'}
          </DialogTitle>
          {viewingDocument && (
            <DocumentViewer
              documentId={viewingDocument.id}
              documentName={viewingDocument.name}
              fileType={viewingDocument.extension || undefined}
              className="h-full"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}