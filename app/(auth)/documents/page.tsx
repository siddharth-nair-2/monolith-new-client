"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApiRequestJson } from "@/lib/client-api";
import { toast } from "sonner";
import {
  Folder,
  File,
  Plus,
  Upload,
  Search,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Edit3,
  Download,
  Eye,
  FolderOpen,
  FileText,
  Loader2,
  Star,
  Clock,
  Filter,
  CloudUpload,
  ExternalLink,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploadDialog } from "@/components/upload/FileUploadDialog";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIntegrations } from "@/lib/integrations-context";
import Image from "next/image";

// Types
interface FolderType {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  subdirectory_count: number;
  total_size_bytes: number;
  path: string;
  children?: FolderType[];
  isExpanded?: boolean;
}

interface Document {
  id: string;
  name: string;
  source_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  file_size_bytes?: number | null;
  extension?: string | null;
  processing_status: string;
  uploaded_by?: string | null;
  chunk_count?: number | null;
  has_permission?: boolean;
  view_url?: string | null;
  folder_id?: string | null;
}

interface FolderResponse {
  items: FolderType[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

interface DocumentsResponse {
  items: Document[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export default function DocumentsPage() {
  const { googleDriveConnections } = useIntegrations();
  
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"folders" | "recent" | "starred">("folders");

  // Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const dragCounter = useRef(0);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await clientApiRequestJson<FolderResponse>(
        "/api/folders?size=100"
      );

      if (error) {
        console.error("Error fetching folders:", error);
        // Don't throw error if no folders exist, just set empty array
        setFolders([]);
      } else if (data && data.items) {
        // Build folder tree
        const folderMap = new Map<string, FolderType>();
        const rootFolders: FolderType[] = [];

        data.items.forEach(folder => {
          folderMap.set(folder.id, { ...folder, children: [], isExpanded: true });
        });

        data.items.forEach(folder => {
          const folderNode = folderMap.get(folder.id)!;
          if (folder.parent_id) {
            const parent = folderMap.get(folder.parent_id);
            if (parent) {
              parent.children!.push(folderNode);
            }
          } else {
            rootFolders.push(folderNode);
          }
        });

        setFolders(rootFolders);
      } else {
        // No folders yet
        setFolders([]);
      }
    } catch (error) {
      console.error("Failed to load folders:", error);
      // Don't show error toast for empty folders
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch documents (exclude Google Drive files)
  const fetchDocuments = useCallback(async (folderId?: string | null) => {
    setIsLoadingDocuments(true);
    try {
      let url = "/api/documents?size=50&source_types=upload";
      if (folderId) {
        url = `/api/folders/${folderId}/documents?size=50&source_types=upload`;
      }

      const { data, error } = await clientApiRequestJson<DocumentsResponse>(url);

      if (error) {
        console.error("Error fetching documents:", error);
        // Don't show error toast for empty documents
        setDocuments([]);
      } else if (data && data.items) {
        // Additional filter to ensure we only show uploaded files
        const uploadedFiles = data.items.filter(doc => doc.source_type === 'upload');
        setDocuments(uploadedFiles);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
    if (viewMode === "folders") {
      fetchDocuments(selectedFolderId);
    }
  }, [fetchFolders, fetchDocuments, selectedFolderId, viewMode]);

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const { data, error } = await clientApiRequestJson("/api/folders", {
        method: "POST",
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription || undefined,
          parent_id: parentFolderId || undefined,
        }),
      });

      if (error) throw new Error(error.message);

      toast.success("Folder created successfully");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      setNewFolderDescription("");
      setParentFolderId(null);
      fetchFolders();
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const { error } = await clientApiRequestJson(`/api/folders/${editingFolder.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription || undefined,
        }),
      });

      if (error) throw new Error(error.message);

      toast.success("Folder updated successfully");
      setIsEditFolderOpen(false);
      setEditingFolder(null);
      setNewFolderName("");
      setNewFolderDescription("");
      fetchFolders();
    } catch (error) {
      toast.error("Failed to update folder");
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder and all its contents?")) {
      return;
    }

    try {
      const { error } = await clientApiRequestJson(`/api/folders/${folderId}?force=true`, {
        method: "DELETE",
      });

      if (error) throw new Error(error.message);

      toast.success("Folder deleted successfully");
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      fetchFolders();
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    try {
      const { error } = await clientApiRequestJson(`/api/documents/${doc.id}`, {
        method: "DELETE",
      });

      if (error) throw new Error(error.message);

      toast.success("Document deleted successfully");
      fetchDocuments(selectedFolderId);
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (extension?: string | null) => {
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Process dropped items (files and folders)
  const processDroppedItems = async (items: DataTransferItemList) => {
    setIsProcessingDrop(true);
    
    const files: File[] = [];
    const folderStructure: { [path: string]: File[] } = {};
    
    // Helper function to scan entries recursively
    const scanEntry = async (entry: any, path = ""): Promise<void> => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => {
          entry.file(resolve);
        });
        const fullPath = path + file.name;
        files.push(file);
        
        // Group files by their folder path
        if (path) {
          if (!folderStructure[path]) {
            folderStructure[path] = [];
          }
          folderStructure[path].push(file);
        }
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise<any[]>((resolve) => {
          dirReader.readEntries(resolve);
        });
        
        for (const childEntry of entries) {
          await scanEntry(childEntry, path + entry.name + "/");
        }
      }
    };
    
    // Process all dropped items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await scanEntry(entry);
      }
    }
    
    try {
      // If we have folder structure, create folders first
      if (Object.keys(folderStructure).length > 0) {
        await createFolderStructure(folderStructure);
      } else if (files.length > 0) {
        // Just files, upload them to current folder
        await uploadFiles(files, selectedFolderId);
      }
      
      // Refresh folders and documents
      await fetchFolders();
      await fetchDocuments(selectedFolderId);
      
      const folderCount = Object.keys(folderStructure).length;
      if (folderCount > 0) {
        toast.success(`Successfully created ${folderCount} folder(s) and uploaded ${files.length} file(s)`);
      } else {
        toast.success(`Successfully uploaded ${files.length} file(s)`);
      }
    } catch (error) {
      console.error("Error processing dropped items:", error);
      toast.error("Failed to process dropped items");
    } finally {
      setIsProcessingDrop(false);
    }
  };
  
  // Create folder structure from dropped folders
  const createFolderStructure = async (folderStructure: { [path: string]: File[] }) => {
    const paths = Object.keys(folderStructure).sort();
    
    // If we're in a selected folder, create folders directly inside it
    if (selectedFolderId) {
      // Create folders one by one in the selected folder
      const folderMap = new Map<string, string>(); // path -> folder_id
      
      for (const path of paths) {
        const parts = path.split("/").filter(p => p);
        let currentPath = "";
        let parentId = selectedFolderId;
        
        for (const part of parts) {
          currentPath += "/" + part;
          
          if (!folderMap.has(currentPath)) {
            // Create this folder
            const { data, error } = await clientApiRequestJson("/api/folders", {
              method: "POST",
              body: JSON.stringify({
                name: part,
                parent_id: parentId,
              }),
            });
            
            if (error) {
              console.error(`Failed to create folder ${part}:`, error);
              continue;
            }
            
            folderMap.set(currentPath, data.id);
            parentId = data.id;
          } else {
            parentId = folderMap.get(currentPath)!;
          }
        }
        
        // Upload files to this folder
        const filesToUpload = folderStructure[path];
        if (filesToUpload.length > 0) {
          await uploadFiles(filesToUpload, parentId || selectedFolderId);
        }
      }
    } else {
      // At root level, use bulk creation
      const allFolderPaths = new Set<string>();
      paths.forEach(path => {
        const parts = path.split("/").filter(p => p);
        let currentPath = "";
        parts.forEach(part => {
          currentPath += "/" + part;
          allFolderPaths.add(currentPath);
        });
      });
      
      if (allFolderPaths.size > 0) {
        // Prepare bulk folder creation request
        const foldersToCreate = Array.from(allFolderPaths).map(path => ({
          path: path,
          name: path.split("/").filter(p => p).pop() || "",
        }));
        
        // Create all folders in bulk
        const { data, error } = await clientApiRequestJson("/api/folders/bulk", {
          method: "POST",
          body: JSON.stringify({
            folders: foldersToCreate,
            create_parents: true,
            skip_existing: true,
          }),
        });
        
        if (error) {
          throw new Error("Failed to create folder structure");
        }
        
        // Build path to folder ID mapping
        const pathToId = new Map<string, string>();
        if (data && data.created_folders) {
          data.created_folders.forEach((folder: any) => {
            pathToId.set(folder.path, folder.id);
          });
        }
        if (data && data.existing_folders) {
          data.existing_folders.forEach((folder: any) => {
            pathToId.set(folder.path, folder.id);
          });
        }
        
        // Now upload files to their respective folders
        for (const [path, files] of Object.entries(folderStructure)) {
          if (files.length > 0) {
            const folderPath = "/" + path.replace(/\/$/, '');
            const folderId = pathToId.get(folderPath);
            await uploadFiles(files, folderId || null);
          }
        }
      }
    }
  };
  
  // Upload files helper
  const uploadFiles = async (files: File[], folderId: string | null) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });
    
    const url = folderId 
      ? `/api/upload/batch?folder_id=${folderId}`
      : "/api/upload/batch";
    
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }
    
    return response.json();
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
      await processDroppedItems(e.dataTransfer.items);
    }
  };

  const FolderTreeItem: React.FC<{ folder: FolderType; depth: number }> = ({ folder, depth }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedFolderId === folder.id;

    return (
      <div>
        <div
          className={`group flex items-center px-3 py-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            isSelected
              ? "text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]"
              : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => setSelectedFolderId(folder.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-100 rounded mr-1"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4 mr-2 text-[#A3BC02]" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-[#A3BC02]" />
          )}

          <span className="flex-1 text-sm font-sans">{folder.name}</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sans">
              {folder.document_count}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingFolder(folder);
                    setNewFolderName(folder.name);
                    setNewFolderDescription(folder.description || "");
                    setIsEditFolderOpen(true);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setParentFolderId(folder.id);
                    setIsCreateFolderOpen(true);
                  }}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteFolder(folder.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map((child) => (
              <FolderTreeItem key={child.id} folder={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Document Library
          </h1>

          <div className="flex items-center gap-2">
            {googleDriveConnections.length > 0 && (
              <Button
                onClick={() => window.location.href = '/auth/library/drive'}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#00AC47] text-white hover:bg-[#009639]"
              >
                <Image
                  src="/icons/integrations/drive.png"
                  alt="Google Drive"
                  width={16}
                  height={16}
                />
                Google Drive
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
            <Button
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </Button>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            Organize and manage your uploaded documents with folders. Drag and drop files or entire folders from your desktop.
            {googleDriveConnections.length > 0 && (
              <span className="ml-2 text-[#00AC47]">
                Your Google Drive files are available in the 
                <button 
                  onClick={() => window.location.href = '/auth/library/drive'}
                  className="underline ml-1 hover:text-[#009639]"
                >
                  Google Drive Library
                </button>.
              </span>
            )}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-xl p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
              />
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setViewMode("folders")}
                className={`flex-1 px-3 py-2 rounded-full text-sm font-sans transition ${
                  viewMode === "folders"
                    ? "bg-[#FAFFD8] text-custom-dark-green border border-[#A3BC01]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Folder className="w-4 h-4 inline mr-1" />
                Folders
              </button>
              <button
                onClick={() => setViewMode("recent")}
                className={`flex-1 px-3 py-2 rounded-full text-sm font-sans transition ${
                  viewMode === "recent"
                    ? "bg-[#FAFFD8] text-custom-dark-green border border-[#A3BC01]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Recent
              </button>
              <button
                onClick={() => setViewMode("starred")}
                className={`flex-1 px-3 py-2 rounded-full text-sm font-sans transition ${
                  viewMode === "starred"
                    ? "bg-[#FAFFD8] text-custom-dark-green border border-[#A3BC01]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Star className="w-4 h-4 inline mr-1" />
                Starred
              </button>
            </div>

            {/* Folder Tree */}
            {viewMode === "folders" && (
              <ScrollArea className="h-[calc(100vh-350px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#A3BC02]" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div
                      className={`group flex items-center px-3 py-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        selectedFolderId === null
                          ? "text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]"
                          : ""
                      }`}
                      onClick={() => setSelectedFolderId(null)}
                    >
                      <div className="w-4 h-4 mr-1" />
                      <Folder className="w-4 h-4 mr-2 text-[#A3BC02]" />
                      <span className="flex-1 text-sm font-sans">All Documents</span>
                    </div>

                    {folders.map((folder) => (
                      <FolderTreeItem key={folder.id} folder={folder} depth={0} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Document List */}
          <div 
            className="flex-1 bg-white rounded-xl p-6 relative"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-custom-dark-green font-serif">
                {selectedFolderId
                  ? folders.find(f => f.id === selectedFolderId)?.name || "Documents"
                  : "All Documents"}
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
                <div className="text-center">
                  <CloudUpload className="w-16 h-16 text-[#A3BC02] mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Drop files or folders here</h3>
                  <p className="text-sm text-gray-500">
                    {selectedFolderId 
                      ? `Files will be uploaded to "${folders.find(f => f.id === selectedFolderId)?.name}"`
                      : "Files will be uploaded to root directory"}
                  </p>
                </div>
              </div>
            )}
            
            {/* Processing overlay */}
            {isProcessingDrop && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-[#A3BC02] mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Processing dropped items...</h3>
                  <p className="text-sm text-gray-500">Creating folders and uploading files</p>
                </div>
              </div>
            )}
            
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6">
                  <CloudUpload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No documents yet</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Drag and drop files or folders here, or click to upload
                  </p>
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    className="rounded-full text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    {getFileIcon(doc.extension)}

                    <div className="flex-1 ml-3">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#A3BC02] transition-colors">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(doc.file_size_bytes || 0)}</span>
                        <span>{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-[#FAFFD8]"
                        onClick={() => {
                          window.open(`/api/documents/${doc.id}/download`, "_blank");
                          toast.success(`Downloading ${doc.name}`);
                        }}
                      >
                        <Download className="w-4 h-4" />
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
                          <DropdownMenuItem onClick={() => toast.info("Bookmark feature coming soon!")}>
                            <Star className="w-4 h-4 mr-2" />
                            Add to Starred
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteDocument(doc)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-custom-dark-green">
              Create New Folder
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-sans">
              Create a new folder to organize your documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName" className="text-sm font-medium text-black font-sans">
                Folder Name
              </Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folderDescription" className="text-sm font-medium text-black font-sans">
                Description (optional)
              </Label>
              <Textarea
                id="folderDescription"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Add a description"
                className="min-h-[80px] rounded-lg border-[#F6F6F6] bg-[#F6F6F6] font-sans resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateFolderOpen(false);
                setNewFolderName("");
                setNewFolderDescription("");
                setParentFolderId(null);
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={createFolder}
              className="rounded-full text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-custom-dark-green">
              Edit Folder
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-sans">
              Update folder details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName" className="text-sm font-medium text-black font-sans">
                Folder Name
              </Label>
              <Input
                id="editFolderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="h-12 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFolderDescription" className="text-sm font-medium text-black font-sans">
                Description (optional)
              </Label>
              <Textarea
                id="editFolderDescription"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Add a description"
                className="min-h-[80px] rounded-lg border-[#F6F6F6] bg-[#F6F6F6] font-sans resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditFolderOpen(false);
                setEditingFolder(null);
                setNewFolderName("");
                setNewFolderDescription("");
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={updateFolder}
              className="rounded-full text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Upload Dialog */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={(files) => {
          toast.success(`Successfully uploaded ${files.length} file(s)`);
          fetchDocuments(selectedFolderId);
        }}
        folderId={selectedFolderId || undefined}
        title="Upload Documents"
        description="Upload your documents to the selected folder. We support PDF, Word, Excel, and more."
        maxFiles={10}
        maxSize={10 * 1024 * 1024}
      />
    </div>
  );
}