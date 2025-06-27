"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  documentId: string;
  documentName?: string;
  fileType?: string;
  className?: string;
}

export function DocumentViewer({
  documentId,
  documentName = "Document",
  fileType,
  className,
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  // Check if file type is previewable
  const isPreviewable = () => {
    if (!fileType) return true; // Try to preview if we don't know the type
    const previewableTypes = [
      // PDFs
      "pdf",
      // Images
      "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico",
      // Text files
      "txt", "text", "html", "htm", "xml", "json", "md", "markdown",
      "css", "js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "h",
      "yml", "yaml", "toml", "ini", "conf", "log"
    ];
    return previewableTypes.includes(fileType.toLowerCase());
  };
  
  // Check if file is an image
  const isImage = () => {
    if (!fileType) return false;
    const imageTypes = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"];
    return imageTypes.includes(fileType.toLowerCase());
  };

  useEffect(() => {
    // Create the view URL
    const url = `/api/documents/${documentId}/download?view=true`;
    setViewUrl(url);
    
    // For non-previewable files, don't show loading
    if (!isPreviewable()) {
      setLoading(false);
    }
  }, [documentId, fileType]);

  const handleDownload = () => {
    window.open(`/api/documents/${documentId}/download`, "_blank");
  };

  const handleOpenInNewTab = () => {
    window.open(`/api/documents/${documentId}/download?view=true`, "_blank");
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Failed to load document. The file type might not be supported for preview.");
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-lg truncate max-w-md">{documentName}</h3>
        </div>
        <div className="flex items-center gap-2 mr-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-50">
        {loading && isPreviewable() && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Preview not available</h4>
                    <p className="text-sm text-gray-600">{error}</p>
                  </div>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!error && isPreviewable() && viewUrl && (
          isImage() ? (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={viewUrl}
                alt={documentName}
                className="max-w-full max-h-full object-contain"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          ) : (
            <iframe
              src={viewUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Preview of ${documentName}`}
            />
          )
        )}

        {!error && !isPreviewable() && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Preview not supported</h4>
                    <p className="text-sm text-gray-600">
                      This file type ({fileType}) cannot be previewed in the browser.
                    </p>
                  </div>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}