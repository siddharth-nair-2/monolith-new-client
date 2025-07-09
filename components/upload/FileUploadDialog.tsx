"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileUpload } from "./FileUpload";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (files: any[]) => void;
  title?: string;
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: Record<string, string[]>;
  folderId?: string;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  title = "Upload Documents",
  description = "Upload your documents to get started. We support PDF, Word, Excel, PowerPoint, and more.",
  ...uploadProps
}: FileUploadDialogProps) {
  const handleUploadComplete = (files: any[]) => {
    onUploadComplete?.(files);
    // Close dialog after successful upload
    setTimeout(() => onOpenChange(false), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FileUpload
          {...uploadProps}
          onUploadComplete={handleUploadComplete}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}