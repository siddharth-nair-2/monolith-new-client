"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  taskId?: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void;
  onClose?: () => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: Record<string, string[]>;
  className?: string;
  compact?: boolean; // For inline use (like in search bars)
  folderId?: string; // Optional folder ID for organizing uploads
}

const defaultAcceptedTypes = {
  "application/pdf": [".pdf"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "text/html": [".html", ".htm"],
  "text/markdown": [".md", ".markdown"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
};

export function FileUpload({
  onUploadComplete,
  onClose,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = defaultAcceptedTypes,
  className,
  compact = false,
  folderId,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes("spreadsheet") || file.name.match(/\.(xlsx?|csv)$/i)) 
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type.includes("word") || file.name.match(/\.(docx?)$/i)) 
      return <FileText className="w-5 h-5 text-blue-600" />;
    if (type.includes("presentation") || file.name.match(/\.(pptx?)$/i)) 
      return <FileText className="w-5 h-5 text-orange-600" />;
    if (type.includes("image")) return <FileImage className="w-5 h-5 text-purple-600" />;
    if (type.includes("video")) return <FileVideo className="w-5 h-5 text-pink-600" />;
    if (type.includes("audio")) return <FileAudio className="w-5 h-5 text-indigo-600" />;
    if (type.includes("zip") || type.includes("archive")) 
      return <FileArchive className="w-5 h-5 text-gray-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      progress: 0,
      status: "pending" as const,
    }));

    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      // Limit to maxFiles
      return combined.slice(-maxFiles);
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple,
    maxSize,
    maxFiles,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        const errors = rejection.errors.map((e) => e.message).join(", ");
        toast.error(`${rejection.file.name}: ${errors}`);
      });
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast.error("No files to upload");
      return;
    }

    setIsUploading(true);

    try {
      if (pendingFiles.length === 1) {
        // Single file upload
        await uploadSingleFile(pendingFiles[0]);
      } else {
        // Batch upload
        await uploadBatchFiles(pendingFiles);
      }

      // Get successful uploads
      const successfulFiles = files.filter((f) => f.status === "success");
      if (successfulFiles.length > 0) {
        toast.success(`Successfully uploaded ${successfulFiles.length} file(s)`);
        onUploadComplete?.(successfulFiles);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadSingleFile = async (fileItem: UploadedFile) => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading" as const } : f
        )
      );

      const formData = new FormData();
      formData.append("file", fileItem.file);

      const url = folderId ? `/api/upload?folder_id=${folderId}` : "/api/upload";
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Update file status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "success" as const, progress: 100, taskId: data.task_id }
            : f
        )
      );

      // Start polling for task status if task_id is returned
      if (data.task_id) {
        pollTaskStatus(data.task_id, fileItem.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "error" as const, error: errorMessage }
            : f
        )
      );
    }
  };

  const uploadBatchFiles = async (filesToUpload: UploadedFile[]) => {
    try {
      // Update all files to uploading
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((u) => u.id === f.id)
            ? { ...f, status: "uploading" as const }
            : f
        )
      );

      const formData = new FormData();
      filesToUpload.forEach((fileItem, index) => {
        formData.append(`files`, fileItem.file);
      });

      const url = folderId ? `/api/upload/batch?folder_id=${folderId}` : "/api/upload/batch";
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Batch upload failed");
      }

      // Update file statuses based on response
      setFiles((prev) =>
        prev.map((f) => {
          const uploadedFile = filesToUpload.find((u) => u.id === f.id);
          if (uploadedFile) {
            // Check if this file failed
            const failedFile = data.failed_files?.find(
              (failed: any) => failed.filename === uploadedFile.file.name
            );
            
            if (failedFile) {
              return { ...f, status: "error" as const, error: failedFile.error };
            } else {
              return { ...f, status: "success" as const, progress: 100 };
            }
          }
          return f;
        })
      );

      // Start polling for task statuses if provided
      if (data.task_ids) {
        data.task_ids.forEach((taskId: string, index: number) => {
          if (index < filesToUpload.length) {
            pollTaskStatus(taskId, filesToUpload[index].id);
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Batch upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((u) => u.id === f.id)
            ? { ...f, status: "error" as const, error: errorMessage }
            : f
        )
      );
    }
  };

  const pollTaskStatus = async (taskId: string, fileId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for max 30 seconds
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/upload/task/${taskId}`);
        const data = await response.json();

        if (data.status === "completed") {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: 100 } : f
            )
          );
          return;
        } else if (data.status === "failed") {
          throw new Error(data.error || "Processing failed");
        } else if (data.progress) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: data.progress } : f
            )
          );
        }

        // Continue polling if not complete
        if (attempts < maxAttempts && data.status !== "completed") {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        }
      } catch (error) {
        console.error("Task status poll error:", error);
      }
    };

    poll();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (compact) {
    // Compact mode for inline use
    return (
      <div className={cn("relative", className)}>
        <input {...getInputProps()} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          className="h-8 w-8"
        >
          <Upload className="w-4 h-4" />
        </Button>
        {files.length > 0 && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1">
            <span className="bg-[#A3BC02] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {files.length}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-[#A3BC02] bg-[#A3BC02]/5"
            : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-sm text-gray-500">
          Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                Files ({files.length}/{maxFiles})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFiles([])}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 group"
                  >
                    {getFileIcon(fileItem.file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      {fileItem.status === "uploading" && (
                        <Progress
                          value={fileItem.progress}
                          className="h-1 mt-1"
                        />
                      )}
                      {fileItem.error && (
                        <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {fileItem.status === "pending" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFile(fileItem.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {fileItem.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-[#A3BC02]" />
                      )}
                      {fileItem.status === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {fileItem.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-end gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.filter(f => f.status === "pending").length === 0}
            className="bg-[#A3BC02] hover:bg-[#8BA000]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.filter(f => f.status === "pending").length} Files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}