"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApiRequestJson } from "@/lib/client-api";
import { toast } from "sonner";
import {
  Search,
  ChevronRight,
  MoreHorizontal,
  Download,
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Check,
  CloudUpload,
  AlertTriangle,
  X,
  Cloud,
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
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { format } from "date-fns";
import { useIntegrations } from "@/lib/integrations-context";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types - matching backend response
interface GoogleDriveFolder {
  id: string;
  name: string;
  mime_type: string;
  parent_id?: string;
  created_time?: string;
  modified_time?: string;
  has_children: boolean;
  drive_type: string;
  drive_id?: string;
  has_synced_content?: boolean;
  synced_file_count?: number;
}

interface GoogleDriveDocument {
  id: string;
  name: string;
  mime_type: string;
  size_bytes?: number;
  parent_id?: string;
  created_time?: string;
  modified_time?: string;
  web_view_link?: string;
  starred: boolean;
  drive_type: string;
  drive_id?: string;

  // Sync status fields
  is_synced?: boolean;
  sync_status?: string; // 'synced', 'syncing', 'sync_failed', 'not_synced'
  last_synced_at?: string;
  local_document_id?: string;
  sync_error?: string;
  thumbnail_url?: string | null;
}

interface GoogleDriveContentResponse {
  folders: GoogleDriveFolder[];
  files: GoogleDriveDocument[];
  next_page_token?: string;
  parent_folder?: GoogleDriveFolder;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
  path: string;
}

interface GoogleDriveAuthError {
  error: 'authentication_expired' | 'authentication_failed';
  message: string;
  connection_id: string;
  action_required: 'reconnect';
  reconnect_url: string;
}


export default function GoogleDriveConnectionPage() {
  const router = useRouter();
  const params = useParams();
  const { googleDriveConnections, isLoading: integrationsLoading, refreshConnections } = useIntegrations();

  // Extract connection ID and folder ID from URL params
  const getConnectionId = (): string | undefined => {
    return Array.isArray(params.connectionId) ? params.connectionId[0] : params.connectionId;
  };

  const getCurrentFolderId = (): string | null => {
    if (!params.path || !Array.isArray(params.path)) return null;
    if (params.path.length >= 2 && params.path[0] === "f") {
      return params.path[1];
    }
    return null;
  };

  const connectionId = getConnectionId();
  const currentFolderId = getCurrentFolderId();

  const [currentFolder, setCurrentFolder] = useState<GoogleDriveFolder | null>(null);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [documents, setDocuments] = useState<GoogleDriveDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Dialog states
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<GoogleDriveDocument | null>(null);
  
  // Auth error states
  const [authError, setAuthError] = useState<GoogleDriveAuthError | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Verify connection exists
  const selectedConnection = googleDriveConnections.find(conn => conn.id === connectionId);

  // Fetch Google Drive content
  const fetchContent = useCallback(async () => {
    if (!connectionId) return;

    setIsLoading(true);
    try {
      let url = `/api/proxy/v1/google-drive/browse/${connectionId}?include_sync_status=true`;
      if (currentFolderId) {
        url += `&folder_id=${currentFolderId}`;
      }

      const { data, error } = await clientApiRequestJson<GoogleDriveContentResponse>(url);

      if (error) {
        console.error("Error fetching Google Drive content:", error);
        
        // Check if it's a Google Drive authentication error
        // The error structure is: { error: { code: 'UNAUTHORIZED', message: "{'error': 'authentication_failed', ...}" } }
        let googleDriveError = null;
        
        if (error.error?.code === 'UNAUTHORIZED' && error.error?.message) {
          try {
            // Convert Python dictionary format to JSON by replacing single quotes with double quotes
            const jsonString = error.error.message.replace(/'/g, '"');
            const parsedError = JSON.parse(jsonString);
            
            if (parsedError.error === 'authentication_expired' || parsedError.error === 'authentication_failed') {
              // Fix the reconnect URL to use Next.js proxy routing
              if (parsedError.reconnect_url && parsedError.reconnect_url.startsWith('/api/v1/')) {
                parsedError.reconnect_url = parsedError.reconnect_url.replace('/api/v1/', '/api/proxy/v1/');
              }
              googleDriveError = parsedError;
            }
          } catch (e) {
            console.error("Failed to parse Google Drive error:", e);
            
            // Fallback: check for authentication keywords in the message
            const message = error.error.message;
            if (message.includes('authentication_failed') || message.includes('authentication_expired')) {
              // Create a fallback error object
              const connectionIdMatch = message.match(/connection_id['"]: ['"]([^'"]+)['"]/);
              const connectionId = connectionIdMatch ? connectionIdMatch[1] : '';
              
              googleDriveError = {
                error: 'authentication_failed',
                message: 'Google Drive authentication has expired. Please reconnect your account.',
                connection_id: connectionId,
                action_required: 'reconnect',
                reconnect_url: `/api/proxy/v1/oauth/authorize/google_drive?connection_id=${connectionId}`
              };
            }
          }
        }
        
        if (googleDriveError) {
          setAuthError(googleDriveError as GoogleDriveAuthError);
          // Clear existing data
          setFolders([]);
          setDocuments([]);
          return;
        }
        
        toast.error(`Failed to load Google Drive content: ${error.message || error}`);
        setFolders([]);
        setDocuments([]);
        return;
      }

      if (data) {
        setFolders(data.folders || []);
        setDocuments(data.files || []);

        // Set current folder info
        if (data.parent_folder) {
          setCurrentFolder(data.parent_folder);
        } else if (currentFolderId) {
          // We requested a specific folder but no parent_folder returned
          setCurrentFolder({
            id: currentFolderId,
            name: 'Unknown Folder',
            mime_type: 'application/vnd.google-apps.folder',
            has_children: false,
            drive_type: 'my_drive'
          });
        } else {
          // We're at root level
          setCurrentFolder(null);
        }

        // Build breadcrumbs
        const crumbs: BreadcrumbItem[] = [
          { id: null, name: "Google Drive", path: `/library/drive/${connectionId}` },
        ];

        if (data.parent_folder && currentFolderId) {
          crumbs.push({
            id: data.parent_folder.id,
            name: data.parent_folder.name,
            path: `/library/drive/${connectionId}/f/${data.parent_folder.id}`,
          });
        }

        setBreadcrumbs(crumbs);
      }
    } catch (error) {
      console.error("Failed to load Google Drive content:", error);
      toast.error("Failed to load Google Drive content");
      setFolders([]);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId, currentFolderId]);

  useEffect(() => {
    if (connectionId && selectedConnection) {
      fetchContent();
    }
  }, [connectionId, currentFolderId, selectedConnection, fetchContent]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType?: string, fileName?: string) => {
    // Get extension from filename
    const extension = fileName?.split('.').pop()?.toLowerCase();

    // Handle Google Workspace files by mime type
    if (mimeType?.includes('document')) {
      return "/icons/filetypes/word.png";
    }
    if (mimeType?.includes('spreadsheet')) {
      return "/icons/filetypes/excel.png";
    }
    if (mimeType?.includes('presentation')) {
      return "/icons/filetypes/ppt.png";
    }

    // Handle regular files by extension
    switch (extension) {
      case "pdf":
        return "/icons/filetypes/pdf.png";
      case "doc":
      case "docx":
        return "/icons/filetypes/word.png";
      case "xls":
      case "xlsx":
        return "/icons/filetypes/excel.png";
      case "ppt":
      case "pptx":
        return "/icons/filetypes/ppt.png";
      default:
        return "/icons/filetypes/file.png";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
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

  const getSyncStatusBadge = (syncStatus?: string) => {
    // Base circle styling - matching library page
    const baseCircle = "w-4 h-4 rounded-full flex items-center justify-center bg-white border-none";
    
    switch (syncStatus) {
      case 'synced':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${baseCircle} [box-shadow:inset_0_0_16px_0_rgba(163,188,1,0.4)]`}>
                <Check className="w-3 h-3 text-custom-dark-green" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-50">
              <p>Synced to your library</p>
            </TooltipContent>
          </Tooltip>
        );
      case 'syncing':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${baseCircle} [box-shadow:inset_0_0_16px_0_rgba(234,179,8,0.4)]`}>
                <RefreshCw className="w-3 h-3 text-yellow-600 animate-spin" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-50">
              <p>Currently syncing...</p>
            </TooltipContent>
          </Tooltip>
        );
      case 'sync_failed':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${baseCircle} [box-shadow:inset_0_0_16px_0_rgba(239,68,68,0.4)]`}>
                <X className="w-3 h-3 text-red-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-50">
              <p>Sync failed</p>
            </TooltipContent>
          </Tooltip>
        );
      default:
        // Show cloud icon for any file without sync status
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${baseCircle} [box-shadow:inset_0_0_16px_0_rgba(59,130,246,0.4)]`}>
                <Cloud className="w-3 h-3 text-blue-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-50">
              <p>Available in Google Drive</p>
            </TooltipContent>
          </Tooltip>
        );
    }
  };

  // Navigation functions
  const navigateToFolder = (folderId: string) => {
    router.push(`/library/drive/${connectionId}/f/${folderId}`);
  };

  const navigateToBreadcrumb = (item: BreadcrumbItem) => {
    router.push(item.path);
  };

  const refreshContent = () => {
    fetchContent();
    toast.success("Content refreshed");
  };

  // Handle Google Drive reconnection
  const handleGoogleDriveReconnection = useCallback(async () => {
    if (!authError) return;
    
    setIsReconnecting(true);
    
    try {
      // First, call the OAuth authorization endpoint to get the authorization URL
      const { data, error } = await clientApiRequestJson<{
        authorization_url: string;
        state: string;
        connector_type: string;
      }>(authError.reconnect_url);
      
      if (error || !data?.authorization_url) {
        console.error('Failed to get authorization URL:', error);
        toast.error('Failed to start reconnection process');
        setIsReconnecting(false);
        return;
      }
      
      // Store state for OAuth callback validation
      sessionStorage.setItem("oauth_state", data.state);
      
      // Open Google OAuth in a popup
      const popup = window.open(
        data.authorization_url,
        'google-drive-reconnect',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        toast.error('Please allow popups for this site to reconnect Google Drive');
        setIsReconnecting(false);
        return;
      }
      
      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsReconnecting(false);
          
          // Wait a moment then refresh connections and try fetching content again
          setTimeout(async () => {
            await refreshConnections();
            setAuthError(null);
            await fetchContent();
          }, 1000);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error during reconnection:', error);
      toast.error('Failed to start reconnection process');
      setIsReconnecting(false);
    }
  }, [authError, refreshConnections, fetchContent]);

  const dismissAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Categorize documents like library page
  const categorizeDocuments = (docs: GoogleDriveDocument[]) => {
    const getExtension = (name: string) => name.split('.').pop()?.toLowerCase() || '';

    const documents = docs.filter((doc) => {
      const ext = getExtension(doc.name);
      return !["pdf", "jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) &&
             !doc.mime_type.includes('image/');
    });

    const pdfs = docs.filter((doc) => {
      const ext = getExtension(doc.name);
      return ext === "pdf" || doc.mime_type === "application/pdf";
    });

    const images = docs.filter((doc) => {
      const ext = getExtension(doc.name);
      return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) ||
             doc.mime_type.startsWith('image/');
    });

    return { documents, pdfs, images };
  };

  const {
    documents: regularDocuments,
    pdfs,
    images,
  } = categorizeDocuments(documents);

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

  if (!selectedConnection) {
    return (
      <div className="min-h-screen bg-none">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              Connection Not Found
            </h2>
            <p className="text-gray-500 mb-6 font-sans">
              The requested Google Drive connection could not be found. It may have been disconnected or removed.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Button
                onClick={() => router.push('/library')}
                className="rounded-full text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
              <Button
                onClick={() => router.push('/settings?tab=integrations')}
                className="rounded-full bg-[#00AC47] text-white hover:bg-[#00AC47]/90"
              >
                <CloudUpload className="w-4 h-4 mr-2" />
                Manage Connections
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-none">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-8xl font-medium text-custom-dark-green font-serif">
            Google Drive
          </h1>

          <div className="flex items-center gap-2">
            {/* Account Switcher */}
            {googleDriveConnections.length > 1 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#00AC47] text-white hover:bg-[#00AC47]/90"
                  >
                    <Image
                      src="/icons/integrations/drive.png"
                      alt="Google Drive"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                    {selectedConnection.name}
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {googleDriveConnections.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      onClick={() => {
                        if (currentFolderId) {
                          router.push(`/library/drive/${connection.id}/f/${currentFolderId}`);
                        } else {
                          router.push(`/library/drive/${connection.id}`);
                        }
                      }}
                      className={connectionId === connection.id ? "bg-gray-100" : ""}
                    >
                      <Image
                        src="/icons/integrations/drive.png"
                        alt="Google Drive"
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      {connection.name}
                      {connectionId === connection.id && <span className="ml-auto text-xs text-gray-500">Current</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              onClick={() => router.push('/library')}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans bg-[#eaeaea] text-custom-dark-green border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>

            <Button
              onClick={refreshContent}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 font-sans text-gray-900 border bg-white border-[#A3BC01] [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)] hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)] hover:bg-[#FAFFD8] hover:border-[#8fa002]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Authentication Error Banner */}
        {authError && (
          <div className="mb-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">
                Google Drive Connection Expired
              </AlertTitle>
              <AlertDescription className="text-orange-700 mt-2">
                <p className="mb-3">{authError.message}</p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleGoogleDriveReconnection}
                    disabled={isReconnecting}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isReconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      'Reconnect Google Drive'
                    )}
                  </Button>
                  <Button
                    onClick={dismissAuthError}
                    variant="outline"
                    className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm font-sans">
            Browse your Google Drive content. Files marked with sync status can be downloaded from your local library.
          </p>
        </div>

        {/* Breadcrumbs and Search */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-custom-dark-green">
            {breadcrumbs.map((item, index) => (
              <div key={item.path} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
                <button
                  onClick={() => navigateToBreadcrumb(item)}
                  className="hover:text-[#A3BC02] transition-colors font-sans"
                >
                  {item.name}
                </button>
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search Google Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 h-10 rounded-full border-[#F6F6F6] bg-[#F6F6F6] font-sans"
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="min-h-[600px] relative">
          {authError ? (
            <div className="text-center py-16">
              <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 bg-orange-50/30">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <h3 className="text-lg font-medium text-orange-800 mb-2">
                  Google Drive Connection Required
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  Your Google Drive connection has expired. Please reconnect to continue browsing your files.
                </p>
                <Button
                  onClick={handleGoogleDriveReconnection}
                  disabled={isReconnecting}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isReconnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    'Reconnect Google Drive'
                  )}
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02]" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Folders Section */}
              {folders.length > 0 && (
                <div>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 mb-8">
                    {folders.map((folder) => (
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
                            {/* Sync status indicator for folders */}
                            {folder.has_synced_content && (
                              <div className="absolute -top-1 -right-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white border-none [box-shadow:inset_0_0_16px_0_rgba(163,188,1,0.4)]">
                                      <Check className="w-3 h-3 text-custom-dark-green" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="z-50">
                                    <p>Contains synced files</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                          <div className="text-center w-[76px]">
                            <p className="text-sm font-medium text-gray-900 font-sans break-words leading-tight line-clamp-3">
                              {folder.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {folders.length > 0 && regularDocuments.length > 0 && (
                <hr className="h-px bg-black/20 border-0" />
              )}

              {/* Documents Section */}
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
                        {/* Sync Status Indicator - Top Right */}
                        <div className="absolute top-2 right-2">
                          {getSyncStatusBadge(doc.sync_status)}
                        </div>

                        {/* File Name */}
                        <div className="pb-2">
                          <p className="text-sm font-medium text-gray-900 font-sans leading-tight" title={doc.name}>
                            {truncateFileName(doc.name)}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-center mt-auto items-center">
                          {/* File Icon */}
                          <div className="flex items-center">
                            <Image
                              src={getFileIcon(doc.mime_type, doc.name)}
                              alt="file icon"
                              width={16}
                              height={16}
                              className="w-[16px] h-[16px]"
                            />
                          </div>

                          {/* Date/Time */}
                          <div className="flex-1 text-center">
                            <p className="text-xs text-black/50 font-sans">
                              {doc.created_time ? formatDate(doc.created_time) : ""}
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
                                    if (doc.web_view_link) {
                                      window.open(doc.web_view_link, "_blank");
                                    }
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in Google Drive
                                </DropdownMenuItem>
                                {doc.is_synced && doc.local_document_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/api/documents/${doc.local_document_id}/download`, "_blank");
                                        toast.success(`Downloading ${doc.name}`);
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download from Library
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                          {doc.is_synced && doc.local_document_id && doc.thumbnail_url ? (
                            <Image
                              src={`/api/documents/${doc.local_document_id}/thumbnail`}
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                              onError={(e) => {
                                console.error(`Failed to load thumbnail for ${doc.local_document_id}:`, e);
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

                          {/* Sync Status Indicator on Thumbnail */}
                          <div className="absolute bottom-1 right-1">
                            {getSyncStatusBadge(doc.sync_status)}
                          </div>
                        </div>

                        {/* File Name and Three Dots */}
                        <div className="pt-2 relative">
                          <p className="text-xs font-medium text-gray-900 font-sans text-center px-4" title={doc.name}>
                            {truncateFileName(doc.name, 20)}
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
                                    if (doc.web_view_link) {
                                      window.open(doc.web_view_link, "_blank");
                                    }
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in Google Drive
                                </DropdownMenuItem>
                                {doc.is_synced && doc.local_document_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/api/documents/${doc.local_document_id}/download`, "_blank");
                                        toast.success(`Downloading ${doc.name}`);
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download from Library
                                    </DropdownMenuItem>
                                  </>
                                )}
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
                          {doc.is_synced && doc.local_document_id && doc.thumbnail_url ? (
                            <Image
                              src={`/api/documents/${doc.local_document_id}/thumbnail`}
                              alt={doc.name}
                              fill
                              className="object-cover rounded-xl"
                              onError={(e) => {
                                console.error(`Failed to load thumbnail for ${doc.local_document_id}:`, e);
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

                          {/* Sync Status Indicator on Thumbnail */}
                          <div className="absolute bottom-1 right-1">
                            {getSyncStatusBadge(doc.sync_status)}
                          </div>
                        </div>

                        {/* File Name and Three Dots */}
                        <div className="pt-2 relative">
                          <p className="text-xs font-medium text-gray-900 font-sans text-center px-4" title={doc.name}>
                            {truncateFileName(doc.name, 20)}
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
                                    if (doc.web_view_link) {
                                      window.open(doc.web_view_link, "_blank");
                                    }
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in Google Drive
                                </DropdownMenuItem>
                                {doc.is_synced && doc.local_document_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/api/documents/${doc.local_document_id}/download`, "_blank");
                                        toast.success(`Downloading ${doc.name}`);
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download from Library
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No content found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      This folder appears to be empty.
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
              fileType={viewingDocument.name.split('.').pop()?.toLowerCase() || undefined}
              className="h-full"
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}