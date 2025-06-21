"use client";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  FileText,
  Upload,
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
}

const supportedFormats = [
  { ext: "PDF", desc: "Documents, reports, manuals" },
  { ext: "DOCX", desc: "Word documents" },
  { ext: "PPTX", desc: "PowerPoint presentations" },
  { ext: "TXT", desc: "Plain text files" },
  { ext: "MD", desc: "Markdown files" },
  { ext: "CSV", desc: "Spreadsheet data" },
];

const organizationTips = [
  "Use descriptive filenames that include keywords",
  "Group related documents in folders",
  "Include version numbers for evolving documents",
  "Add tags to help with future searches",
];

export default function FirstIntegrationPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Upload files to API
    newFiles.forEach((newFile, index) => {
      const originalFile = acceptedFiles[index];
      if (originalFile) {
        uploadFile(originalFile, newFile.id);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const uploadFile = async (file: File, fileId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Update to uploading status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Update to completed status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "completed",
                  progress: 100,
                }
              : f
          )
        );
      } else {
        // Update to error status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error",
                  error: result.message || "Upload failed",
                }
              : f
          )
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: "Network error",
              }
            : f
        )
      );
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-[#A3BC02]" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const completedFiles = uploadedFiles.filter(
    (f) => f.status === "completed"
  ).length;
  const hasFiles = uploadedFiles.length > 0;

  const handleContinue = async () => {
    // Mark first_integration step as completed if any files were uploaded
    if (completedFiles > 0) {
      try {
        await fetch('/api/onboarding/complete-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'first_integration',
            step_data: {
              files_uploaded: completedFiles,
            },
          }),
        });
      } catch (error) {
        console.warn('Failed to mark step as completed:', error);
      }
    }
    
    router.push("/onboarding");
  };

  const handleSkip = async () => {
    try {
      // Mark step as skipped
      await fetch('/api/onboarding/skip-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'first_integration',
        }),
      })
    } catch (error) {
      console.warn('Failed to mark step as skipped')
    }
    
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#A3BC02]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E1F179]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-gray-100 bg-white/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/onboarding" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Setup
                  </Link>
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <Link
                  href="/"
                  className="text-2xl font-serif text-[#3E4128] hover:text-[#A3BC02] transition-colors"
                >
                  Mono
                  <span className="underline decoration-[#A3BC02] decoration-2 underline-offset-2">
                    l
                  </span>
                  ith
                </Link>
              </div>
              <Badge variant="outline">First Integration</Badge>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-500/10">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#A3BC02]/10 rounded-full">
                    <FileText className="w-8 h-8 text-[#A3BC02]" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-serif text-[#3E4128]">
                  Connect Your First Data Source
                </CardTitle>
                <CardDescription className="text-lg">
                  Upload a document or connect to a data source to start building your knowledge base.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Upload Zone */}
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                    ${
                      isDragActive
                        ? "border-[#A3BC02] bg-[#A3BC02]/5"
                        : "border-gray-300 hover:border-[#A3BC02] hover:bg-[#A3BC02]/5"
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-lg text-[#A3BC02] font-medium">
                      Drop your files here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Drag & drop files here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Maximum file size: 50MB per file
                      </p>
                    </div>
                  )}
                </div>

                {/* Supported Formats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#3E4128] mb-3">
                      Supported Formats
                    </h4>
                    <div className="space-y-2">
                      {supportedFormats.map((format, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                        >
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {format.ext}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {format.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#3E4128] mb-3">
                      Organization Tips
                    </h4>
                    <ul className="space-y-2">
                      {organizationTips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <div className="w-1.5 h-1.5 bg-[#A3BC02] rounded-full mt-2 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Uploaded Files */}
                {hasFiles && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#3E4128]">
                        Uploaded Files ({completedFiles}/{uploadedFiles.length}{" "}
                        processed)
                      </h4>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <File className="w-5 h-5 text-gray-500 flex-shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              {getStatusIcon(file.status)}
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </span>

                              {file.status === "uploading" && (
                                <div className="flex-1 max-w-32">
                                  <Progress
                                    value={file.progress}
                                    className="h-1"
                                  />
                                </div>
                              )}

                              <Badge
                                variant={
                                  file.status === "completed"
                                    ? "default"
                                    : file.status === "error"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {file.status === "uploading"
                                  ? "Uploading..."
                                  : file.status === "processing"
                                  ? "Processing..."
                                  : file.status === "completed"
                                  ? "Ready"
                                  : "Error"}
                              </Badge>
                            </div>

                            {file.error && (
                              <p className="text-xs text-red-600 mt-1">
                                {file.error}
                              </p>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkip}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={hasFiles && completedFiles === 0}
                    className="flex-1 bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                  >
                    {completedFiles > 0
                      ? `Continue with ${completedFiles} files`
                      : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}