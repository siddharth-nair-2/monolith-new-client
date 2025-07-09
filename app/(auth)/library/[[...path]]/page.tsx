"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApiRequestJson } from "@/lib/client-api";
import { toast } from "sonner";
import {
  Folder,
  File,
  Upload,
  Search,
  FolderPlus,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit3,
  Download,
  Eye,
  FileText,
  Loader2,
  Star,
  Filter,
  CloudUpload,
  Home,
  Check,
  AlertTriangle,
  CircleAlert,
} from "lucide-react";
import Image from "next/image";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

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
  thumbnail_url?: string | null;
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

interface BreadcrumbItem {
  id: string | null;
  name: string;
  path: string;
}

export default function LibraryPage() {
  const router = useRouter();
  const params = useParams();

  // Extract current folder ID from URL params
  const getCurrentFolderId = (): string | null => {
    if (!params.path || !Array.isArray(params.path)) return null;
    if (params.path.length >= 2 && params.path[0] === "f") {
      return params.path[1];
    }
    return null;
  };

  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    getCurrentFolderId()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"folders" | "recent" | "starred">(
    "folders"
  );

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

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const dragCounter = useRef(0);

  // Update current folder ID when URL changes
  useEffect(() => {
    const folderId = getCurrentFolderId();
    setCurrentFolderId(folderId);
  }, [params]);

  // Navigation functions
  const navigateToFolder = (folderId: string | null) => {
    if (folderId === null) {
      router.push("/library");
    } else {
      router.push(`/library/f/${folderId}`);
    }
  };

  // Fetch current folder and build breadcrumbs
  const fetchCurrentFolder = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setCurrentFolder(null);
      setBreadcrumbs([{ id: null, name: "Library", path: "/library" }]);
      return;
    }

    try {
      const { data, error } = await clientApiRequestJson<FolderType>(
        `/api/folders/${folderId}`
      );

      if (error) {
        console.error("Error fetching folder:", error);
        // Navigate back to root if folder not found
        navigateToFolder(null);
        return;
      }

      if (data) {
        setCurrentFolder(data);
        // Build breadcrumbs by traversing up the hierarchy
        await buildBreadcrumbs(data);
      }
    } catch (error) {
      console.error("Failed to load folder:", error);
      navigateToFolder(null);
    }
  }, []);

  // Build breadcrumbs for current folder
  const buildBreadcrumbs = async (folder: FolderType) => {
    const crumbs: BreadcrumbItem[] = [
      { id: null, name: "Library", path: "/library" },
    ];

    // Build path by traversing parents
    const ancestors: FolderType[] = [];
    let current = folder;

    while (current.parent_id) {
      try {
        const { data } = await clientApiRequestJson<FolderType>(
          `/api/folders/${current.parent_id}`
        );
        if (data) {
          ancestors.unshift(data);
          current = data;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // Add ancestors to breadcrumbs
    ancestors.forEach((ancestor) => {
      crumbs.push({
        id: ancestor.id,
        name: ancestor.name,
        path: `/library/f/${ancestor.id}`,
      });
    });

    // Add current folder
    crumbs.push({
      id: folder.id,
      name: folder.name,
      path: `/library/f/${folder.id}`,
    });

    setBreadcrumbs(crumbs);
  };

  // Fetch documents in current folder
  const fetchDocuments = useCallback(async (folderId?: string | null) => {
    setIsLoadingDocuments(true);
    try {
      let url;
      if (folderId) {
        // Get documents in specific folder
        url = `/api/folders/${folderId}/documents?size=50`;
      } else {
        // Get only root-level documents (not in any folder)
        url = `/api/documents?size=50`;
      }

      const { data, error } = await clientApiRequestJson<DocumentsResponse>(
        url
      );

      if (error) {
        console.error("Error fetching documents:", error);
        setDocuments([]);
      } else if (data && data.items) {
        setDocuments(data.items);
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
    setIsLoading(true);
    fetchCurrentFolder(currentFolderId);
    if (viewMode === "folders") {
      fetchDocuments(currentFolderId);
    }
    setIsLoading(false);
  }, [fetchCurrentFolder, fetchDocuments, currentFolderId, viewMode]);

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
          parent_id: currentFolderId || undefined,
        }),
      });

      if (error) throw new Error(error.message);

      toast.success("Folder created successfully");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      setNewFolderDescription("");
      // Refresh both documents and folders
      fetchDocuments(currentFolderId);
      fetchChildFolders(currentFolderId);
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const { error } = await clientApiRequestJson(
        `/api/folders/${editingFolder.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: newFolderName,
            description: newFolderDescription || undefined,
          }),
        }
      );

      if (error) throw new Error(error.message);

      toast.success("Folder updated successfully");
      setIsEditFolderOpen(false);
      setEditingFolder(null);
      setNewFolderName("");
      setNewFolderDescription("");
      fetchCurrentFolder(currentFolderId);
      fetchDocuments(currentFolderId);
      fetchChildFolders(currentFolderId);
    } catch (error) {
      toast.error("Failed to update folder");
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    ) {
      return;
    }

    try {
      const { error } = await clientApiRequestJson(
        `/api/folders/${folderId}?force=true`,
        {
          method: "DELETE",
        }
      );

      if (error) throw new Error(error.message);

      toast.success("Folder deleted successfully");
      // Navigate to parent if we deleted the current folder
      if (currentFolderId === folderId) {
        const parentId = currentFolder?.parent_id || null;
        navigateToFolder(parentId);
      } else {
        fetchDocuments(currentFolderId);
        fetchChildFolders(currentFolderId);
      }
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
      fetchDocuments(currentFolderId);
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

  const getFileIcon = (extension?: string | null): string => {
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

      // Text files - using generic file icon
      txt: "/icons/filetypes/file.png",
      csv: "/icons/filetypes/excel.png",
      rtf: "/icons/filetypes/file.png",
      xml: "/icons/filetypes/file.png",

      // Web files - using generic file icon
      js: "/icons/filetypes/file.png",
      css: "/icons/filetypes/file.png",

      // Images - using generic file icon
      jpg: "/icons/filetypes/file.png",
      jpeg: "/icons/filetypes/file.png",
      png: "/icons/filetypes/file.png",

      // Audio/Video - using generic file icon
      mp3: "/icons/filetypes/file.png",
      mp4: "/icons/filetypes/file.png",
      avi: "/icons/filetypes/file.png",

      // Other - using generic file icon
      dwg: "/icons/filetypes/file.png",
      iso: "/icons/filetypes/file.png",
      dbf: "/icons/filetypes/file.png",
      fla: "/icons/filetypes/file.png",
    };

    return (
      extToIcon[extension?.toLowerCase() || ""] || "/icons/filetypes/file.png"
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = diffDays === 1;

    if (isToday) {
      return `Today ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (diffDays <= 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Process dropped items (files and folders)
  const processDroppedItems = async (items: DataTransferItemList) => {
    setIsProcessingDrop(true);

    const files: File[] = [];
    const folderStructure: { [path: string]: File[] } = {};

    // Helper function to scan entries recursively
    const scanEntry = async (entry: any, path = ""): Promise<void> => {
      try {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve, reject) => {
            entry.file(resolve, reject);
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
          const entries = await new Promise<any[]>((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
          });

          for (const childEntry of entries) {
            await scanEntry(childEntry, path + entry.name + "/");
          }
        }
      } catch (error) {
        console.error(`Error scanning entry ${entry.name}:`, error);
      }
    };

    // Process all dropped items
    // First, collect all entries (DataTransferItemList can become stale)
    const entries = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry();
      if (entry) {
        entries.push(entry);
      }
    }
    
    // Now process all entries
    for (let i = 0; i < entries.length; i++) {
      try {
        const entry = entries[i];
        await scanEntry(entry);
      } catch (error) {
        console.error(`Error processing entry ${i}:`, error);
      }
    }

    try {
      // If we have folder structure, create folders first
      if (Object.keys(folderStructure).length > 0) {
        await createFolderStructure(folderStructure);
      } else if (files.length > 0) {
        // Just files, upload them to current folder
        await uploadFiles(files, currentFolderId);
      }

      // Refresh documents and folders (in case folders were created)
      await fetchDocuments(currentFolderId);
      await fetchChildFolders(currentFolderId);

      const folderCount = Object.keys(folderStructure).length;
      if (folderCount > 0) {
        toast.success(
          `Successfully created ${folderCount} folder(s) and uploaded ${files.length} file(s)`
        );
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
  const createFolderStructure = async (folderStructure: {
    [path: string]: File[];
  }) => {
    const paths = Object.keys(folderStructure).sort();

    // If we're in a specific folder, create folders directly inside it
    if (currentFolderId) {
      // Create folders one by one in the current folder
      const folderMap = new Map<string, string>(); // path -> folder_id

      for (const path of paths) {
        const parts = path.split("/").filter((p) => p);
        let currentPath = "";
        let parentId = currentFolderId;

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
              // If folder creation fails, don't try to upload files to it
              // This prevents files from being uploaded to root when folder creation fails
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
          const targetFolderId = parentId || currentFolderId;
          await uploadFiles(filesToUpload, targetFolderId);
        }
      }
    } else {
      // At root level, use bulk creation
      const allFolderPaths = new Set<string>();
      paths.forEach((path) => {
        const parts = path.split("/").filter((p) => p);
        let currentPath = "";
        parts.forEach((part) => {
          currentPath += "/" + part;
          allFolderPaths.add(currentPath);
        });
      });

      if (allFolderPaths.size > 0) {
        // Prepare bulk folder creation request
        const foldersToCreate = Array.from(allFolderPaths).map((path) => ({
          path: path,
          name:
            path
              .split("/")
              .filter((p) => p)
              .pop() || "",
        }));


        // Create all folders in bulk
        const { data, error } = await clientApiRequestJson(
          "/api/folders/bulk",
          {
            method: "POST",
            body: JSON.stringify({
              folders: foldersToCreate,
              create_parents: true,
              skip_existing: true,
            }),
          }
        );

        if (error) {
          console.error("Failed to create folder structure:", error);
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
            // The folderStructure keys have trailing slashes (e.g., "MyFolder/")
            // but the pathToId mapping uses paths without trailing slashes (e.g., "/MyFolder")
            const normalizedPath = "/" + path.replace(/\/$/, "");
            let folderId = pathToId.get(normalizedPath);
            
            // If not found, try alternate path formats
            if (!folderId) {
              const alternatePaths = [
                path.replace(/\/$/, ""), // "MyFolder/"" -> "MyFolder"
                "/" + path.replace(/\/$/, ""), // "MyFolder/" -> "/MyFolder"
                path, // Original path "MyFolder/"
                normalizedPath.replace(/^\/+/, "/") // Clean up multiple leading slashes
              ];
              
              for (const altPath of alternatePaths) {
                folderId = pathToId.get(altPath);
                if (folderId) break;
              }
            }
            
            if (folderId) {
              await uploadFiles(files, folderId);
            } else {
              console.error(`Failed to find folder ID for path: "${path}". Files will be uploaded to root.`);
              await uploadFiles(files, null);
            }
          }
        }
      }
    }
  };

  // Upload files helper
  const uploadFiles = async (files: File[], folderId: string | null) => {
    const formData = new FormData();
    files.forEach((file) => {
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

  // Fetch folders in current directory for display
  const [childFolders, setChildFolders] = useState<FolderType[]>([]);

  const fetchChildFolders = useCallback(async (parentId: string | null) => {
    try {
      const { data, error } = await clientApiRequestJson<FolderResponse>(
        `/api/folders?parent_id=${parentId || ""}&size=100`
      );

      if (error) {
        console.error("Error fetching child folders:", error);
        setChildFolders([]);
      } else if (data && data.items) {
        setChildFolders(data.items);
      } else {
        setChildFolders([]);
      }
    } catch (error) {
      console.error("Failed to load child folders:", error);
      setChildFolders([]);
    }
  }, []);

  useEffect(() => {
    fetchChildFolders(currentFolderId);
  }, [fetchChildFolders, currentFolderId]);

  // Helper function to categorize documents
  const categorizeDocuments = (docs: Document[]) => {
    const documents = docs.filter(
      (doc) =>
        !["pdf"].includes(doc.extension?.toLowerCase() || "") &&
        !["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
          doc.extension?.toLowerCase() || ""
        )
    );
    const pdfs = docs.filter((doc) => doc.extension?.toLowerCase() === "pdf");
    const images = docs.filter((doc) =>
      ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
        doc.extension?.toLowerCase() || ""
      )
    );

    return { documents, pdfs, images };
  };

  const {
    documents: regularDocuments,
    pdfs,
    images,
  } = categorizeDocuments(documents);

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Document Library
          </h1>

          <div className="flex items-center gap-2">
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
            Organize and manage your documents with folders. Drag and drop files
            or entire folders from your desktop, or sync from cloud storage.
          </p>
        </div>

        {/* Breadcrumbs and Search/Filter */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-custom-dark-green">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 ml-0 mr-2 text-gray-400" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900">
                    {crumb.name}
                  </span>
                ) : (
                  <button
                    onClick={() => navigateToFolder(crumb.id)}
                    className="hover:text-[#A3BC02] transition-colors"
                  >
                    {crumb.name}
                  </button>
                )}
              </div>
            ))}
          </nav>

          <Button className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Main Content */}
        <div
          className="rounded-xl relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
              <div className="text-center">
                <CloudUpload className="w-16 h-16 text-[#A3BC02] mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Drop files or folders here
                </h3>
                <p className="text-sm text-gray-500">
                  {currentFolder
                    ? `Files will be uploaded to "${currentFolder.name}"`
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Processing dropped items...
                </h3>
                <p className="text-sm text-gray-500">
                  Creating folders and uploading files
                </p>
              </div>
            </div>
          )}

          {/* Folders and Documents Grid */}
          {isLoadingDocuments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folders Section */}
              {childFolders.length > 0 && (
                <div>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mb-8">
                    {childFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="group cursor-pointer relative"
                        onClick={() => navigateToFolder(folder.id)}
                      >
                        <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                          <div className="relative mb-2">
                            <Image
                              src="/icons/filetypes/folder-icon.png"
                              alt="Folder"
                              width={76}
                              height={67}
                              className="w-[76px] h-[67px]"
                            />
                          </div>
                          <div className="text-center w-[76px]">
                            <p className="text-sm font-medium text-gray-900 font-sans break-words leading-tight line-clamp-3">
                              {folder.name}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 rounded-full bg-white shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFolder(folder);
                                  setNewFolderName(folder.name);
                                  setNewFolderDescription(
                                    folder.description || ""
                                  );
                                  setIsEditFolderOpen(true);
                                }}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFolder(folder.id);
                                }}
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
                </div>
              )}
              {childFolders.length > 0 && (
                <hr className="h-px bg-black/20 border-0 " />
              )}
              {/* Documents Section - Non-PDF/Image files */}
              {regularDocuments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-custom-dark-green mb-4">
                    Documents
                  </h3>
                  <div className="grid grid-cols md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {regularDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="group cursor-pointer relative bg-white border-none rounded-xl p-4 py-[14px] hover:shadow-md transition-all duration-200 hover:border-gray-300 flex flex-col justify-between"
                        onClick={() => {
                          setViewingDocument(doc);
                          setIsViewerOpen(true);
                        }}
                      >
                        {/* File Name */}
                        <div className="pb-2">
                          <p className="text-sm font-medium text-gray-900 font-sans line-clamp-1 leading-tight">
                            {doc.name}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-center mt-auto items-center">
                          {/* File Icon */}
                          <div className="flex items-center">
                            <Image
                              src={getFileIcon(doc.extension)}
                              alt={doc.extension || "file"}
                              width={16}
                              height={16}
                              className="w-[16px] h-[16px]"
                            />
                          </div>

                          {/* Date/Time */}
                          <div className="flex-1 text-center">
                            <p className="text-xs text-black/50 font-sans">
                              {formatDate(doc.created_at)}
                            </p>
                          </div>

                          {/* Three Dots Menu */}
                          <div className="opacity-100 flex items-center">
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
                                    window.open(
                                      `/api/documents/${doc.id}/download`,
                                      "_blank"
                                    );
                                    toast.success(`Downloading ${doc.name}`);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Bookmark feature coming soon!");
                                  }}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Add to Starred
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDocument(doc);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute -bottom-1 -right-1">
                          {doc.processing_status === "COMPLETED" ? (
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
                    ))}
                  </div>
                </div>
              )}

              {/* PDFs Section */}
              {pdfs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-custom-dark-green mb-4">
                    PDFs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {pdfs.map((doc) => (
                      <div
                        key={doc.id}
                        className="group cursor-pointer relative hover:scale-110 transition-all duration-200"
                        onClick={() => {
                          setViewingDocument(doc);
                          setIsViewerOpen(true);
                        }}
                      >
                        {/* Thumbnail or Placeholder */}
                        <div className="w-full h-24 bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-xl">
                          {doc.thumbnail_url ? (
                            <Image
                              src={`/api/documents/${doc.id}/thumbnail`}
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                              onError={(e) => {
                                console.error(
                                  `Failed to load thumbnail for ${doc.id}:`,
                                  e
                                );
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<img src="/placeholder/thumbnail_placeholder.jpg" alt="${doc.name}" class="w-full h-full object-cover rounded-xl" />`;
                                }
                              }}
                            />
                          ) : (
                            <Image
                              src="/placeholder/thumbnail_placeholder.jpg"
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                            />
                          )}

                          {/* Status Indicator on Thumbnail */}
                          <div className="absolute bottom-1 right-1">
                            {doc.processing_status === "COMPLETED" ? (
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

                        {/* File Name and Three Dots */}
                        <div className="pt-2 relative">
                          <p className="text-xs font-medium text-gray-900 font-sans truncate text-center px-4">
                            {doc.name}
                          </p>
                          <div className="absolute top-2 right-0">
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 rounded-full hover:bg-gray-100 opacity-60 hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `/api/documents/${doc.id}/download`,
                                      "_blank"
                                    );
                                    toast.success(`Downloading ${doc.name}`);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Bookmark feature coming soon!");
                                  }}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Add to Starred
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDocument(doc);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-custom-dark-green mb-4">
                    Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {images.map((doc) => (
                      <div
                        key={doc.id}
                        className="group cursor-pointer relative hover:scale-110 transition-all duration-200"
                        onClick={() => {
                          setViewingDocument(doc);
                          setIsViewerOpen(true);
                        }}
                      >
                        {/* Thumbnail or Placeholder */}
                        <div className="w-full h-24 bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-xl">
                          {doc.thumbnail_url ? (
                            <Image
                              src={`/api/documents/${doc.id}/thumbnail`}
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                              onError={(e) => {
                                console.error(
                                  `Failed to load thumbnail for ${doc.id}:`,
                                  e
                                );
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<img src="/placeholder/thumbnail_placeholder.jpg" alt="${doc.name}" class="w-full h-full object-cover rounded-xl" />`;
                                }
                              }}
                            />
                          ) : (
                            <Image
                              src="/placeholder/thumbnail_placeholder.jpg"
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                            />
                          )}

                          {/* Status Indicator on Thumbnail */}
                          <div className="absolute bottom-1 right-1">
                            {doc.processing_status === "COMPLETED" ? (
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

                        {/* File Name and Three Dots */}
                        <div className="pt-2 relative">
                          <p className="text-xs font-medium text-gray-900 font-sans truncate text-center px-4">
                            {doc.name}
                          </p>
                          <div className="absolute top-2 right-0">
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 rounded-full hover:bg-gray-100 opacity-60 hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `/api/documents/${doc.id}/download`,
                                      "_blank"
                                    );
                                    toast.success(`Downloading ${doc.name}`);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.info("Bookmark feature coming soon!");
                                  }}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Add to Starred
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDocument(doc);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Empty State - Only show if no folders AND no documents */}
              {childFolders.length === 0 &&
                regularDocuments.length === 0 &&
                pdfs.length === 0 &&
                images.length === 0 && (
                  <div className="text-center py-16">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6">
                      <CloudUpload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No documents yet
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Drag and drop files or folders here, or click to upload
                      </p>
                      <Button
                        onClick={() => setIsUploadOpen(true)}
                        className="rounded-full text-custom-dark-green border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}
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
              <Label
                htmlFor="folderName"
                className="text-sm font-medium text-black font-sans"
              >
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
              <Label
                htmlFor="folderDescription"
                className="text-sm font-medium text-black font-sans"
              >
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
              <Label
                htmlFor="editFolderName"
                className="text-sm font-medium text-black font-sans"
              >
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
              <Label
                htmlFor="editFolderDescription"
                className="text-sm font-medium text-black font-sans"
              >
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
            {viewingDocument
              ? `Viewing ${viewingDocument.name}`
              : "Document Viewer"}
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
          fetchDocuments(currentFolderId);
        }}
        folderId={currentFolderId || undefined}
        title="Upload Documents"
        description="Upload your documents to the selected folder. We support PDF, Word, Excel, and more."
        maxFiles={10}
        maxSize={10 * 1024 * 1024}
      />
    </div>
  );
}
