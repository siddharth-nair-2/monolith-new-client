"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  ArrowRight,
  Folder,
  Check,
  Loader2,
  Search,
  ChevronRight,
  Zap,
  AlertCircle,
  Square,
} from "lucide-react";
import Image from "next/image";
import { useIntegrations } from "@/lib/integrations-context";
import { clientApiRequestJson } from "@/lib/client-api";
import { toast } from "sonner";

// Interfaces from the original components
interface GoogleDriveFile {
  id: string;
  name: string;
  mime_type: string;
  size_bytes?: number;
  parent_id: string;
  created_time: string;
  modified_time: string;
  web_view_link: string;
  starred: boolean;
  drive_type: "my_drive" | "shared_drive";
  drive_id?: string;
  google_workspace_type?: "docs" | "sheets" | "slides" | "forms" | "drawings";
  processing_metadata?: {
    native_processing_available: boolean;
    estimated_word_count?: number;
    has_images?: boolean;
    has_tables?: boolean;
    comments_count?: number;
    suggestions_count?: number;
  };
}

interface GoogleDriveFolder extends GoogleDriveFile {
  has_children: boolean;
}

interface BrowseResponse {
  folders: GoogleDriveFolder[];
  files: GoogleDriveFile[];
  next_page_token?: string;
  parent_folder?: GoogleDriveFolder;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface SelectedFolder {
  id: string;
  name: string;
}

interface SyncConfig {
  name: string;
  description: string;
  source_connection_id: string;
  sync_schedule: string;
  filters: {
    folder_ids?: string[];
    selected_folders?: SelectedFolder[];
    include_subfolders?: boolean;
    sync_entire_drive?: boolean;
    mime_types: string[];
    exclude_patterns: string[];
    modified_after?: string;
  };
  sync_config: {
    incremental_sync: boolean;
    google_workspace_native: boolean;
    processing_strategy: "hybrid" | "native_only" | "export_only";
  };
}

interface SyncPipelineSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  onSyncCreated?: () => void;
}

type SidebarStep =
  | "file-browser"
  | "basic-info"
  | "file-filters"
  | "performance";

// Constants from original components
const convertGMTToLocalTime = (gmtHour: number): string => {
  const gmtDate = new Date();
  gmtDate.setUTCHours(gmtHour, 0, 0, 0);
  const localHour = gmtDate.getHours();
  const period = localHour >= 12 ? "PM" : "AM";
  const displayHour =
    localHour === 0 ? 12 : localHour > 12 ? localHour - 12 : localHour;
  return `${displayHour} ${period}`;
};

const localTime = convertGMTToLocalTime(2);

const scheduleOptions = [
  { value: "0 * * * *", label: "Every hour" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 2 * * *", label: `Daily at ${localTime}` },
  { value: "0 2 * * 1", label: `Weekly on Monday at ${localTime}` },
  { value: "0 2 1 * *", label: `Monthly on the 1st at ${localTime}` },
];

const defaultMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
  "text/plain",
  "text/markdown",
];

const mimeTypeLabels: Record<string, string> = {
  "application/pdf": "PDF Documents",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Documents",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel Spreadsheets",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint Presentations",
  "application/vnd.google-apps.document": "Google Docs",
  "application/vnd.google-apps.spreadsheet": "Google Sheets",
  "application/vnd.google-apps.presentation": "Google Slides",
  "text/plain": "Text Files",
  "text/markdown": "Markdown Files",
};

const mimeTypeIcons: Record<string, string> = {
  "application/pdf": "/icons/filetypes/pdf.svg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "/icons/filetypes/doc.svg",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "/icons/filetypes/xls.svg",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "/icons/filetypes/ppt.svg",
  "application/vnd.google-apps.document": "/icons/filetypes/doc.svg",
  "application/vnd.google-apps.spreadsheet": "/icons/filetypes/xls.svg",
  "application/vnd.google-apps.presentation": "/icons/filetypes/ppt.svg",
  "text/plain": "/icons/filetypes/txt.svg",
  "text/markdown": "/icons/filetypes/file.svg",
};

export default function SyncPipelineSidebar({
  isOpen,
  onClose,
  connectionId,
  onSyncCreated,
}: SyncPipelineSidebarProps) {
  const [currentStep, setCurrentStep] = useState<SidebarStep>("file-browser");
  const { googleDriveConnections } = useIntegrations();

  // File browser state
  const [currentFolder, setCurrentFolder] = useState("root");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "My Drive" },
  ]);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [syncEntireDrive, setSyncEntireDrive] = useState(false);

  // Sync config state
  const [config, setConfig] = useState<SyncConfig>({
    name: "",
    description: "",
    source_connection_id: connectionId,
    sync_schedule: "0 2 * * *",
    filters: {
      folder_ids: [],
      selected_folders: [],
      include_subfolders: true,
      sync_entire_drive: false,
      mime_types: defaultMimeTypes,
      exclude_patterns: [],
      modified_after: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    sync_config: {
      incremental_sync: true,
      google_workspace_native: true,
      processing_strategy: "hybrid",
    },
  });

  const [isCreating, setIsCreating] = useState(false);

  const connection = googleDriveConnections.find(
    (conn) => conn.id === connectionId
  );

  // Load folder contents when folder changes
  useEffect(() => {
    if (currentStep === "file-browser") {
      loadFolderContents(currentFolder);
    }
  }, [currentFolder, currentStep]);

  // File browser functions
  const loadFolderContents = async (folderId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await clientApiRequestJson<BrowseResponse>(
        `/api/proxy/v1/google-drive/browse/${connectionId}?folder_id=${folderId}`
      );

      if (error) {
        toast.error("Failed to load folder contents");
        return;
      }

      setFolders(data?.folders || []);
      setFiles(data?.files || []);
    } catch (error) {
      console.error("Error loading folder contents:", error);
      toast.error("Failed to load folder contents");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToFolder = (folder: GoogleDriveFolder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    const newSelected = new Set(selectedFolders);
    if (newSelected.has(folderId)) {
      newSelected.delete(folderId);
    } else {
      newSelected.add(folderId);
    }
    setSelectedFolders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedFolders(new Set());
      setSelectAll(false);
    } else {
      const visibleFolders = folders.filter(
        (folder) =>
          !searchQuery ||
          folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSelectedFolders(new Set(visibleFolders.map((f) => f.id)));
      setSelectAll(true);
    }
  };

  const getFileIcon = (mimeType: string): string => {
    const mimeToIcon: Record<string, string> = {
      // Google Workspace files
      "application/vnd.google-apps.document": "/icons/filetypes/doc.svg",
      "application/vnd.google-apps.spreadsheet": "/icons/filetypes/xls.svg",
      "application/vnd.google-apps.presentation": "/icons/filetypes/ppt.svg",

      // Microsoft Office files
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "/icons/filetypes/doc.svg",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "/icons/filetypes/xls.svg",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "/icons/filetypes/ppt.svg",
      "application/msword": "/icons/filetypes/doc.svg",
      "application/vnd.ms-excel": "/icons/filetypes/xls.svg",
      "application/vnd.ms-powerpoint": "/icons/filetypes/ppt.svg",

      // PDFs and text
      "application/pdf": "/icons/filetypes/pdf.svg",
      "text/plain": "/icons/filetypes/txt.svg",
      "text/csv": "/icons/filetypes/csv.svg",
      "text/markdown": "/icons/filetypes/file.svg",

      // Images
      "image/jpeg": "/icons/filetypes/jpg.svg",
      "image/jpg": "/icons/filetypes/jpg.svg",
      "image/png": "/icons/filetypes/png.svg",
      "image/gif": "/icons/filetypes/file.svg",
      "image/bmp": "/icons/filetypes/file.svg",
      "image/webp": "/icons/filetypes/file.svg",
      "image/svg+xml": "/icons/filetypes/file.svg",
      "image/tiff": "/icons/filetypes/file.svg",
      "image/heic": "/icons/filetypes/file.svg",
      "image/heif": "/icons/filetypes/file.svg",

      // Videos
      "video/mp4": "/icons/filetypes/mp4.svg",
      "video/avi": "/icons/filetypes/mp4.svg",
      "video/mov": "/icons/filetypes/mp4.svg",
      "video/wmv": "/icons/filetypes/mp4.svg",
      "video/flv": "/icons/filetypes/mp4.svg",
      "video/webm": "/icons/filetypes/mp4.svg",
      "video/mkv": "/icons/filetypes/mp4.svg",
      "video/m4v": "/icons/filetypes/mp4.svg",

      // Audio
      "audio/mpeg": "/icons/filetypes/mp3.svg",
      "audio/mp3": "/icons/filetypes/mp3.svg",
      "audio/wav": "/icons/filetypes/mp3.svg",
      "audio/flac": "/icons/filetypes/mp3.svg",
      "audio/aac": "/icons/filetypes/mp3.svg",
      "audio/ogg": "/icons/filetypes/mp3.svg",
      "audio/m4a": "/icons/filetypes/mp3.svg",

      // Archives
      "application/zip": "/icons/filetypes/file.svg",
      "application/x-rar-compressed": "/icons/filetypes/file.svg",
      "application/x-7z-compressed": "/icons/filetypes/file.svg",
      "application/x-tar": "/icons/filetypes/file.svg",
      "application/gzip": "/icons/filetypes/file.svg",
    };
    return mimeToIcon[mimeType] || "/icons/filetypes/file.svg";
  };

  const trimFileName = (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName;

    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      // No extension, just trim the name
      return fileName.substring(0, maxLength) + "...";
    }

    const extension = fileName.substring(lastDotIndex);
    const nameWithoutExt = fileName.substring(0, lastDotIndex);

    // Reserve space for extension and ellipsis
    const availableLength = maxLength - extension.length - 3;

    if (availableLength <= 0) {
      // Extension is too long, just show extension
      return "..." + extension;
    }

    return nameWithoutExt.substring(0, availableLength) + "..." + extension;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  // Sync config functions
  const handleMimeTypeToggle = (mimeType: string) => {
    setConfig((prev) => {
      const currentMimeTypes = prev.filters.mime_types || [];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          mime_types: currentMimeTypes.includes(mimeType)
            ? currentMimeTypes.filter((type) => type !== mimeType)
            : [...currentMimeTypes, mimeType],
        },
      };
    });
  };

  const createSync = async () => {
    if (!config.name.trim()) {
      toast.error("Please enter a sync name");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await clientApiRequestJson(
        "/api/proxy/v1/syncs",
        {
          method: "POST",
          body: JSON.stringify(config),
        }
      );

      if (error) {
        toast.error(error.detail || "Failed to create sync pipeline");
        return;
      }

      onSyncCreated?.();
      onClose();
      toast.success("Sync pipeline created successfully!");
      resetState();
    } catch (error) {
      console.error("Error creating sync:", error);
      toast.error("Failed to create sync pipeline");
    } finally {
      setIsCreating(false);
    }
  };

  // Navigation functions
  const proceedToBasicInfo = () => {
    if (!syncEntireDrive && selectedFolders.size === 0) {
      toast.error(
        'Please select at least one folder to sync or choose "Sync Entire Drive"'
      );
      return;
    }

    // Store folder selection in config
    let filterConfig;
    if (syncEntireDrive) {
      filterConfig = {
        sync_entire_drive: true,
        folder_ids: [],
        selected_folders: [],
        include_subfolders: includeSubfolders,
      };
    } else {
      // Get folder names for the selected folder IDs
      const selectedFolderData = Array.from(selectedFolders).map((folderId) => {
        const folder = folders.find((f) => f.id === folderId);
        return {
          id: folderId,
          name: folder?.name || "Unknown Folder",
        };
      });

      filterConfig = {
        sync_entire_drive: false,
        folder_ids: Array.from(selectedFolders),
        selected_folders: selectedFolderData,
        include_subfolders: includeSubfolders,
      };
    }

    setConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filterConfig },
    }));
    setCurrentStep("basic-info");
  };

  const resetState = () => {
    setCurrentStep("file-browser");
    setCurrentFolder("root");
    setBreadcrumbs([{ id: "root", name: "My Drive" }]);
    setSelectedFolders(new Set());
    setSyncEntireDrive(false);
    setSelectAll(false);
    setSearchQuery("");
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        sync_entire_drive: false,
        folder_ids: [],
        selected_folders: [],
        include_subfolders: true,
      },
    }));
  };

  const getProgress = () => {
    switch (currentStep) {
      case "file-browser":
        return 25;
      case "basic-info":
        return 50;
      case "file-filters":
        return 75;
      case "performance":
        return 100;
      default:
        return 0;
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "file-browser":
        return 1;
      case "basic-info":
        return 2;
      case "file-filters":
        return 3;
      case "performance":
        return 4;
      default:
        return 1;
    }
  };

  // Step rendering functions
  const renderFileBrowser = () => (
    <div className="space-y-6">
      {/* Beautiful Header */}
      <div className="text-center space-y-2">
        <h2 className="font-serif text-2xl font-medium text-custom-dark-green">
          Choose Your Content
        </h2>
        <p className="text-sm text-gray-600 font-sans">
          Select folders from your Google Drive to sync
        </p>
      </div>

      {/* Elegant Navigation */}
      <div className="space-y-3">
        <div className="bg-gray-50/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={breadcrumbs.length <= 1}
              className="h-8 w-8 p-0 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-4 h-4 text-custom-dark-green" />
            </Button>

            <div className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className="text-custom-dark-green hover:text-[#A3BC02] font-medium transition-colors"
                  >
                    {item.name}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-gray-400 mx-1">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your drive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-[#A3BC02] focus:ring-[#A3BC02]/20 rounded-full"
          />
        </div>
      </div>

      {/* Modern Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (syncEntireDrive) {
                setSyncEntireDrive(false);
              } else {
                setSyncEntireDrive(true);
                setSelectedFolders(new Set());
                setSelectAll(false);
              }
            }}
            className={`rounded-full transition-all ${
              syncEntireDrive
                ? "bg-[#A3BC02] text-white border-[#A3BC02] shadow-md"
                : "bg-white hover:bg-[#A3BC02]/5 text-custom-dark-green border-[#A3BC02]/30 hover:border-[#A3BC02]"
            }`}
          >
            {syncEntireDrive ? (
              <>
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center mr-2">
                  <Check className="w-2.5 h-2.5 text-[#A3BC02]" />
                </div>
                Entire Drive
              </>
            ) : (
              "Sync Entire Drive"
            )}
          </Button>

          <Button
            variant="outline"
            onClick={toggleSelectAll}
            disabled={syncEntireDrive}
            className="rounded-full bg-white hover:bg-gray-50 text-custom-dark-green border-gray-200 hover:border-gray-300 disabled:opacity-50"
          >
            {selectAll ? "Deselect All" : "Select All Visible"}
          </Button>
        </div>

        <div className="flex items-center gap-3 bg-[#A3BC02]/5 rounded-full px-4 py-2">
          <button
            type="button"
            onClick={() => setIncludeSubfolders(!includeSubfolders)}
            className="flex items-center justify-center"
          >
            <Square
              className={`w-4 h-4 transition-colors ${
                includeSubfolders
                  ? "fill-[#A3BC02] text-[#A3BC02]"
                  : "text-[#A3BC02]"
              }`}
            />
          </button>
          <Label
            htmlFor="include-subfolders"
            className="text-sm font-medium text-custom-dark-green cursor-pointer"
            onClick={() => setIncludeSubfolders(!includeSubfolders)}
          >
            Include all subfolders
          </Label>
        </div>
      </div>

      {/* Beautiful Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin text-[#A3BC02]" />
              </div>
              <p className="text-gray-600 font-medium">Loading your drive...</p>
            </div>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {/* Folders */}
            {folders
              .filter(
                (folder) =>
                  !searchQuery ||
                  folder.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((folder, index) => (
                <div
                  key={folder.id}
                  className={`group flex items-center gap-4 p-4 hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    syncEntireDrive ? "opacity-50" : ""
                  } ${selectedFolders.has(folder.id) ? "bg-[#A3BC02]/5" : ""}`}
                >
                  {/* Selection Circle */}
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                      selectedFolders.has(folder.id)
                        ? "bg-[#A3BC02] border-[#A3BC02]"
                        : "border-gray-300 hover:border-[#A3BC02]"
                    } ${syncEntireDrive ? "cursor-not-allowed" : ""}`}
                    onClick={() =>
                      !syncEntireDrive && toggleFolderSelection(folder.id)
                    }
                  >
                    {selectedFolders.has(folder.id) && (
                      <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>

                  {/* Folder Icon */}
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Folder Info */}
                  <div
                    className={`flex-1 min-w-0 ${
                      syncEntireDrive ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() =>
                      !syncEntireDrive && toggleFolderSelection(folder.id)
                    }
                  >
                    <p className="font-medium text-custom-dark-green truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Modified{" "}
                      {new Date(folder.modified_time).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Drive Badge */}
                  <Badge
                    variant="outline"
                    className="text-xs bg-white border-gray-200 text-gray-600"
                  >
                    {folder.drive_type === "shared_drive"
                      ? "Shared"
                      : "My Drive"}
                  </Badge>

                  {/* Navigate Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(folder)}
                    className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:shadow-md"
                  >
                    <ChevronRight className="w-4 h-4 text-custom-dark-green" />
                  </Button>
                </div>
              ))}

            {/* Files Preview */}
            {files
              .filter(
                (file) =>
                  !searchQuery ||
                  file.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-gray-50/30 border-b border-gray-100 last:border-b-0"
                >
                  <Image
                    src={getFileIcon(file.mime_type)}
                    alt={file.name}
                    width={24}
                    height={24}
                    className="flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 truncate">
                      {trimFileName(file.name)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size_bytes)} •{" "}
                      {new Date(file.modified_time).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    Preview
                  </Badge>
                </div>
              ))}

            {folders.length === 0 && files.length === 0 && !isLoading && (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    This folder is empty
                  </p>
                  <p className="text-sm text-gray-500">
                    No folders or files to display
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Information */}
      {(syncEntireDrive || selectedFolders.size > 0) && (
        <div className="bg-[#A3BC02]/5 rounded-xl p-4 border border-[#A3BC02]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#A3BC02]/20 rounded-full flex items-center justify-center">
              {syncEntireDrive ? (
                <span className="text-lg">✨</span>
              ) : (
                <Check className="w-4 h-4 text-[#A3BC02]" />
              )}
            </div>
            <div>
              {syncEntireDrive ? (
                <p className="font-medium text-[#A3BC02]">
                  Entire Google Drive will be synchronized
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-custom-dark-green">
                    {selectedFolders.size} folder
                    {selectedFolders.size !== 1 ? "s" : ""} selected
                  </p>
                  {includeSubfolders && (
                    <p className="text-sm text-[#A3BC02]">
                      Including all subfolders
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left space-y-1 pt-4">
        <h2 className="font-sans text-xl font-bold text-black">
          Basic Information
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-sans text-black/50">
            Sync Name
          </Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Daily Google Drive Sync"
            className={`rounded-full border-2 font-sans ${
              !config.name.trim()
                ? "border-[#A3BC02] focus:border-[#A3BC02] focus:ring-[#A3BC02]/20"
                : "border-gray-200 focus:border-[#A3BC02] focus:ring-[#A3BC02]/20"
            }`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-sans text-black/50">
            Description
          </Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of what this sync includes..."
            rows={3}
            className="rounded-2xl border-gray-200 focus:border-[#A3BC02] focus:ring-[#A3BC02]/20 font-sans"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection" className="font-sans text-black/50">
            Account Status
          </Label>
          <div className="flex h-10 w-full items-center text-gray-900 border bg-white border-[#A3BC01] rounded-full px-3 py-2 transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] font-sans">
            <div className="flex items-center gap-2 justify-between w-full">
              <span className="text-gray-900 text-sm">
                {connection?.name || "Google Drive Connection"}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#A3BC02] rounded-full"></div>
                <span className="text-xs text-gray-600 capitalize">
                  {connection?.status || "connected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule" className="font-sans text-black/50">
            Sync Schedule
          </Label>
          <Select
            value={config.sync_schedule}
            onValueChange={(value) =>
              setConfig((prev) => ({ ...prev, sync_schedule: value }))
            }
          >
            <SelectTrigger className="rounded-full border-gray-200 focus:border-[#A3BC02] focus:ring-[#A3BC02]/20 font-sans">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200">
              {scheduleOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-lg font-sans"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h4 className="font-sans text-lg font-bold text-black">
          Folder Information
        </h4>
        {config.filters.folder_ids && config.filters.folder_ids.length > 0 ? (
          <div className="py-2 px-4 text-gray-900 border bg-white border-[#A3BC01] rounded-full transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]">
            <div className="flex items-center justify-between py-1">
              <p className="font-sans text-sm text-gray-900 font-medium">
                {config.filters.folder_ids.length} &nbsp; folder
                {config.filters.folder_ids.length !== 1 ? "s" : ""} selected for
                sync &nbsp;
                {config.filters.include_subfolders && (
                  <span className="font-sans text-xs text-gray-600">
                    (Including all subfolders)
                  </span>
                )}
              </p>
              <Image
                src="/icons/integrations/google_drive.svg"
                alt="Google Drive"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            </div>
          </div>
        ) : config.filters.sync_entire_drive ? (
          <div className="py-2 text-gray-900 border bg-white border-[#A3BC01] rounded-full px-4 transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]">
            <div className="flex items-center justify-between py-1">
              <p className="font-sans text-sm text-gray-900 font-medium">
                Entire Google Drive will be synced
              </p>
              <Image
                src="/icons/integrations/google_drive.svg"
                alt="Google Drive"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            </div>
          </div>
        ) : (
          <div className="py-2 px-4 text-gray-900 border bg-white border-[#A3BC01] rounded-full transition duration-200 [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]">
            <div className="flex items-center justify-between py-1">
              <p className="font-sans text-sm text-gray-900 font-medium">
                No folders selected. Please go back to select folders.
              </p>
              <Image
                src="/icons/integrations/google_drive.svg"
                alt="Google Drive"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFileFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-medium">File Type Filters</h3>
        <Badge variant="outline" className="font-sans">
          Step 3 of 4
        </Badge>
      </div>

      <div>
        <h4 className="font-medium mb-4">Select file types to sync</h4>
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-auto">
          {defaultMimeTypes.map((mimeType) => (
            <div
              key={mimeType}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    config.filters.mime_types?.includes(mimeType) || false
                  }
                  onChange={() => handleMimeTypeToggle(mimeType)}
                  className="w-4 h-4 text-[#A3BC02] rounded focus:ring-[#A3BC02]"
                />
                <Image
                  src={mimeTypeIcons[mimeType] || "/icons/filetypes/file.svg"}
                  alt={mimeTypeLabels[mimeType]}
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <span className="text-sm font-medium">
                  {mimeTypeLabels[mimeType]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-4">Exclusion Patterns</h4>
        <div className="space-y-2">
          <Label>Exclude files matching these patterns:</Label>
          <div className="flex flex-wrap gap-2">
            {(config.filters.exclude_patterns || []).map((pattern, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setConfig((prev) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      exclude_patterns: (
                        prev.filters.exclude_patterns || []
                      ).filter((_, i) => i !== index),
                    },
                  }));
                }}
              >
                {pattern} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add pattern (e.g., *temp*)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = e.currentTarget.value.trim();
                if (
                  value &&
                  !(config.filters.exclude_patterns || []).includes(value)
                ) {
                  setConfig((prev) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      exclude_patterns: [
                        ...(prev.filters.exclude_patterns || []),
                        value,
                      ],
                    },
                  }));
                  e.currentTarget.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-4">Date Filter</h4>
        <div className="space-y-2">
          <Label htmlFor="modifiedAfter">Only sync files modified after:</Label>
          <Input
            id="modifiedAfter"
            type="date"
            value={config.filters.modified_after}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                filters: { ...prev.filters, modified_after: e.target.value },
              }))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPerformanceOptions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-medium">Performance Options</h3>
        <Badge variant="outline" className="font-sans">
          Step 4 of 4
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Performance Settings
          </CardTitle>
          <CardDescription>
            Configure sync performance and processing options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Incremental Sync</Label>
              <p className="text-sm text-gray-500">
                Only processes files that have changed since last sync
              </p>
            </div>
            <Switch
              checked={config.sync_config.incremental_sync}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  sync_config: {
                    ...prev.sync_config,
                    incremental_sync: checked,
                  },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Google Workspace Processing</Label>
              <p className="text-sm text-gray-500">
                Uses native APIs for better structure preservation
              </p>
            </div>
            <Switch
              checked={config.sync_config.google_workspace_native}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  sync_config: {
                    ...prev.sync_config,
                    google_workspace_native: checked,
                  },
                }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Processing Strategy</Label>
            <div className="space-y-2">
              {[
                {
                  value: "hybrid",
                  label: "Hybrid",
                  desc: "Uses native APIs when available, falls back to export",
                },
                {
                  value: "native_only",
                  label: "Native APIs Only",
                  desc: "Only processes files with native API support",
                },
                {
                  value: "export_only",
                  label: "Export-based Only",
                  desc: "Uses traditional export-based processing",
                },
              ].map((strategy) => (
                <div
                  key={strategy.value}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    name="processing_strategy"
                    value={strategy.value}
                    checked={
                      config.sync_config.processing_strategy === strategy.value
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sync_config: {
                          ...prev.sync_config,
                          processing_strategy: e.target.value as
                            | "hybrid"
                            | "native_only"
                            | "export_only",
                        },
                      }))
                    }
                    className="w-4 h-4 text-[#A3BC02] focus:ring-[#A3BC02]"
                  />
                  <div>
                    <p className="text-sm font-medium">{strategy.label}</p>
                    <p className="text-xs text-gray-500">{strategy.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Folders to sync:</span>
            <span className="text-sm font-medium">
              {config.filters.sync_entire_drive
                ? "Entire Drive"
                : config.filters.folder_ids?.length || "0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">File types:</span>
            <span className="text-sm font-medium">
              {config.filters.mime_types?.length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Schedule:</span>
            <span className="text-sm font-medium">
              {
                scheduleOptions.find(
                  (opt) => opt.value === config.sync_schedule
                )?.label
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Incremental sync:</span>
            <span className="text-sm font-medium">
              {config.sync_config.incremental_sync ? "Enabled" : "Disabled"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto bg-white/40 backdrop-blur-md border-l-[#A3BC01] [box-shadow:inset_0_0_35px_0_rgba(163,188,1,0.25),-4px_0_4px_0_rgba(163,188,1,0.9)] flex flex-col">
        <SheetHeader className="space-y-4 relative pt-8">
          <div>
            <SheetTitle className="text-left font-serif text-4xl font-medium text-custom-dark-green pb-2">
              Configure New Sync
            </SheetTitle>
            <SheetDescription className="text-left font-sans text-xs">
              {connection?.name && `Account: ${connection.name}`}
            </SheetDescription>
          </div>

          {/* Step indicator pills */}
          <div className="flex items-center justify-center gap-2">
            {[
              { step: "file-browser", index: 0 },
              { step: "basic-info", index: 1 },
              { step: "file-filters", index: 2 },
              { step: "performance", index: 3 },
            ].map(({ step, index }) => {
              const currentIndex =
                currentStep === "file-browser"
                  ? 0
                  : currentStep === "basic-info"
                  ? 1
                  : currentStep === "file-filters"
                  ? 2
                  : 3;
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    isCompleted || isCurrent ? "bg-[#8ECC3A]" : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
        </SheetHeader>

        <div className="mt-6 flex-1">
          {currentStep === "file-browser" && renderFileBrowser()}
          {currentStep === "basic-info" && renderBasicInfo()}
          {currentStep === "file-filters" && renderFileFilters()}
          {currentStep === "performance" && renderPerformanceOptions()}
        </div>

        {/* Global Navigation */}
        <div className="flex justify-between items-center p-4">
          {/* Page Counter */}
          <div className="text-sm text-black/50 font-sans">
            {getStepNumber()}/4
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {/* Back Button - show for steps 2, 3, 4 */}
            {currentStep === "basic-info" && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep("file-browser")}
                className="rounded-full bg-white hover:bg-gray-50 text-custom-dark-green border-gray-200 flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-2 h-2 text-custom-dark-green" />
                </div>
                Back
              </Button>
            )}
            {currentStep === "file-filters" && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep("basic-info")}
                className="rounded-full bg-white hover:bg-gray-50 text-custom-dark-green border-gray-200 flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-2 h-2 text-custom-dark-green" />
                </div>
                Back
              </Button>
            )}
            {currentStep === "performance" && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep("file-filters")}
                className="rounded-full bg-white hover:bg-gray-50 text-custom-dark-green border-gray-200 flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-2 h-2 text-custom-dark-green" />
                </div>
                Back
              </Button>
            )}

            {/* Next Button */}
            {currentStep === "file-browser" && (
              <Button
                onClick={proceedToBasicInfo}
                disabled={!syncEntireDrive && selectedFolders.size === 0}
                className="rounded-full bg-[#CFE734] hover:bg-[#A3BC02] text-custom-dark-green flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-2 h-2 text-custom-dark-green" />
              </Button>
            )}
            {currentStep === "basic-info" && (
              <Button
                onClick={() => setCurrentStep("file-filters")}
                disabled={!config.name.trim()}
                className="rounded-full bg-[#CFE734] hover:bg-[#A3BC02] text-custom-dark-green flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-2 h-2 text-custom-dark-green" />
              </Button>
            )}
            {currentStep === "file-filters" && (
              <Button
                onClick={() => setCurrentStep("performance")}
                className="rounded-full bg-[#CFE734] hover:bg-[#A3BC02] text-custom-dark-green flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-2 h-2 text-custom-dark-green" />
              </Button>
            )}
            {currentStep === "performance" && (
              <Button
                onClick={createSync}
                disabled={isCreating || !config.name.trim()}
                className="rounded-full bg-[#CFE734] hover:bg-[#A3BC02] text-custom-dark-green flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    Create Sync Pipeline
                    <Loader2 className="w-2 h-2 text-custom-dark-green animate-spin" />
                  </>
                ) : (
                  <>
                    Create Sync Pipeline
                    <Check className="w-2 h-2 text-custom-dark-green" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
