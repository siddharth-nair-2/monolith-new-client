"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { 
  Folder, 
  FileText, 
  Search, 
  Loader2, 
  ChevronRight,
  Check,
  ArrowLeft
} from 'lucide-react';
import { clientApiRequestJson } from '@/lib/client-api';
import { toast } from 'sonner';

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
  drive_type: 'my_drive' | 'shared_drive';
  drive_id?: string;
  google_workspace_type?: 'docs' | 'sheets' | 'slides' | 'forms' | 'drawings';
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

interface GoogleDriveFileBrowserProps {
  connectionId: string;
  onClose: () => void;
  onSyncConfigured: () => void;
}

export default function GoogleDriveFileBrowser({ connectionId, onClose, onSyncConfigured }: GoogleDriveFileBrowserProps) {
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [syncEntireDrive, setSyncEntireDrive] = useState(false);

  useEffect(() => {
    loadFolderContents(currentFolder);
  }, [currentFolder]);

  const loadFolderContents = async (folderId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await clientApiRequestJson<BrowseResponse>(
        `/api/proxy/v1/google-drive/browse/${connectionId}?folder_id=${folderId}`
      );

      if (error) {
        toast.error('Failed to load folder contents');
        return;
      }

      setFolders(data?.folders || []);
      setFiles(data?.files || []);
    } catch (error) {
      console.error('Error loading folder contents:', error);
      toast.error('Failed to load folder contents');
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
      // Deselect all
      setSelectedFolders(new Set());
      setSelectAll(false);
    } else {
      // Select all folders in current view (files are not individually selectable)
      const visibleFolders = folders.filter(folder => 
        !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSelectedFolders(new Set(visibleFolders.map(f => f.id)));
      setSelectAll(true);
    }
  };

  const getFileIcon = (file: GoogleDriveFile) => {
    const workspaceIcons: Record<string, string> = {
      'application/vnd.google-apps.document': '📝',
      'application/vnd.google-apps.spreadsheet': '📊',
      'application/vnd.google-apps.presentation': '📊',
      'application/vnd.google-apps.form': '📋',
      'application/vnd.google-apps.drawing': '🎨'
    };

    return workspaceIcons[file.mime_type] || '📄';
  };

  const isGoogleWorkspaceFile = (mimeType: string) => {
    return mimeType.startsWith('application/vnd.google-apps.');
  };

  const getProcessingMethod = (file: GoogleDriveFile) => {
    const nativeTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation'
    ];
    return nativeTypes.includes(file.mime_type) ? 'native' : 'export';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const proceedToSyncConfig = () => {
    if (!syncEntireDrive && selectedFolders.size === 0) {
      toast.error('Please select at least one folder to sync or choose "Sync Entire Drive"');
      return;
    }
    
    // Store filter configuration matching backend expectations
    let filterConfig;
    if (syncEntireDrive) {
      // No filters = sync entire drive (backend default behavior)
      filterConfig = {};
    } else {
      filterConfig = {
        folders: Array.from(selectedFolders),
        include_subfolders: includeSubfolders
      };
    }
    
    localStorage.setItem('google_drive_filters', JSON.stringify(filterConfig));
    onSyncConfigured();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Browse Google Drive</DialogTitle>
          <DialogDescription>
            Select folders you want to sync. All files within selected folders will be synced. Click folders to select them, click "Open" to navigate inside.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={goBack} disabled={breadcrumbs.length <= 1}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        className="cursor-pointer hover:text-[#A3BC02]"
                        onClick={() => navigateToBreadcrumb(index)}
                      >
                        {item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Toggle entire drive sync
                  if (syncEntireDrive) {
                    setSyncEntireDrive(false);
                  } else {
                    setSyncEntireDrive(true);
                    setSelectedFolders(new Set()); // Clear folder selection
                    setSelectAll(false);
                  }
                }}
                className={`whitespace-nowrap ${
                  syncEntireDrive 
                    ? 'bg-[#A3BC02] text-white border-[#A3BC02]' 
                    : 'bg-[#A3BC02]/10 hover:bg-[#A3BC02]/20 text-[#A3BC02] border-[#A3BC02]'
                }`}
              >
                {syncEntireDrive ? '✓ Entire Drive' : 'Sync Entire Drive'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="whitespace-nowrap"
                disabled={syncEntireDrive}
              >
                {selectAll ? 'Deselect All' : 'Select All Visible'}
              </Button>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-subfolders"
                  checked={includeSubfolders}
                  onChange={(e) => setIncludeSubfolders(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="include-subfolders" className="text-sm font-medium">
                  Include subfolders
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02] mx-auto mb-4" />
                  <p className="text-gray-500">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Folders */}
                {folders
                  .filter(folder => 
                    !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((folder) => (
                    <div
                      key={folder.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        syncEntireDrive 
                          ? 'opacity-50 bg-gray-50' 
                          : 'hover:bg-gray-50'
                      } ${
                        selectedFolders.has(folder.id) ? 'border-[#A3BC02] bg-[#A3BC02]/5' : ''
                      }`}
                    >
                      <div 
                        className={`flex items-center gap-2 ${syncEntireDrive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !syncEntireDrive && toggleFolderSelection(folder.id)}
                      >
                        {selectedFolders.has(folder.id) && (
                          <div className="w-5 h-5 bg-[#A3BC02] rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <Folder className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div 
                        className={`flex-1 ${syncEntireDrive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !syncEntireDrive && toggleFolderSelection(folder.id)}
                      >
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-sm text-gray-500">
                          Modified {new Date(folder.modified_time).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {folder.drive_type === 'shared_drive' ? 'Shared' : 'My Drive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToFolder(folder)}
                          className="text-gray-600 hover:text-[#A3BC02]"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}

                {/* Files (Preview Only) */}
                {files
                  .filter(file => 
                    !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 10) // Show only first 10 for preview
                  .map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 opacity-75"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFileIcon(file)}</span>
                        {isGoogleWorkspaceFile(file.mime_type) && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              getProcessingMethod(file) === 'native' 
                                ? 'border-green-500 text-green-700' 
                                : 'border-orange-500 text-orange-700'
                            }`}
                          >
                            {getProcessingMethod(file) === 'native' ? '🚀 Enhanced' : '📤 Standard'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatFileSize(file.size_bytes)}</span>
                          <span>•</span>
                          <span>Modified {new Date(file.modified_time).toLocaleDateString()}</span>
                          {file.google_workspace_type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{file.google_workspace_type}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        Preview only
                      </Badge>
                    </div>
                  ))}

                {files.length > 10 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    ... and {files.length - 10} more files (will be included if parent folder is selected)
                  </div>
                )}


                {folders.length === 0 && files.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">This folder is empty</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {(syncEntireDrive || selectedFolders.size > 0) && (
                <div className="flex items-center gap-4">
                  {syncEntireDrive ? (
                    <span className="text-[#A3BC02] font-medium">🌟 Entire Drive will be synced</span>
                  ) : (
                    <>
                      <span>{selectedFolders.size} folder{selectedFolders.size !== 1 ? 's' : ''} selected</span>
                      {includeSubfolders && (
                        <span className="text-[#A3BC02]">• Subfolders included</span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={proceedToSyncConfig}
                disabled={!syncEntireDrive && selectedFolders.size === 0}
                className="bg-[#A3BC02] hover:bg-[#8BA000]"
              >
                Continue to Sync Setup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}