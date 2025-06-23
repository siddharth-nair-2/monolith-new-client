"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  FileText,
  CalendarIcon,
  Download,
  Eye,
  MoreHorizontal,
  X,
  Grid3X3,
  List,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  TrendingUp,
  Bookmark,
  FileSpreadsheet,
  FileImage,
  File,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNowStrict } from "date-fns";
import type { DateRange } from "react-day-picker";

// Enhanced document interface
interface Document {
  id: string;
  name: string;
  source_type: string;
  processing_status: string;
  file_size_bytes: number;
  file_extension: string;
  mime_type: string;
  author?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  file_created_at: string;
  file_modified_at: string;
  keywords: string[];
  category_ids: string[];
  topic_ids: string[];
  has_chunks: boolean;
  has_errors: boolean;
  thumbnail_url?: string;
  is_suggested?: boolean;
  is_recent?: boolean;
  view_count?: number;
  last_accessed?: string;
}

// Enhanced mock data with more realistic content
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Q4 Budget Planning & Financial Projections.xlsx",
    source_type: "upload",
    processing_status: "COMPLETED",
    file_size_bytes: 2048576,
    file_extension: "xlsx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    author: "Sarah Chen",
    uploaded_by: "sarah.chen@company.com",
    created_at: "2024-06-15T10:30:00Z",
    updated_at: "2024-06-15T10:35:00Z",
    file_created_at: "2024-06-14T15:20:00Z",
    file_modified_at: "2024-06-14T16:45:00Z",
    keywords: ["budget", "planning", "finance", "Q4"],
    category_ids: ["cat-1"],
    topic_ids: ["topic-1"],
    has_chunks: true,
    has_errors: false,
    is_suggested: true,
    view_count: 24,
    last_accessed: "2024-06-20T09:15:00Z",
  },
  {
    id: "2",
    name: "Employee Handbook 2024 - Complete Guide.pdf",
    source_type: "sharepoint",
    processing_status: "COMPLETED",
    file_size_bytes: 5242880,
    file_extension: "pdf",
    mime_type: "application/pdf",
    author: "HR Department",
    uploaded_by: "hr@company.com",
    created_at: "2024-05-16T09:15:00Z",
    updated_at: "2024-05-16T09:20:00Z",
    file_created_at: "2024-05-10T11:00:00Z",
    file_modified_at: "2024-05-12T14:30:00Z",
    keywords: ["hr", "handbook", "policies", "employee"],
    category_ids: ["cat-2"],
    topic_ids: ["topic-2"],
    has_chunks: true,
    has_errors: false,
    is_recent: true,
    view_count: 156,
    last_accessed: "2024-06-19T14:22:00Z",
  },
  {
    id: "3",
    name: "Marketing Campaign Analysis - Q1 Results.docx",
    source_type: "googledrive",
    processing_status: "EMBEDDING",
    file_size_bytes: 1048576,
    file_extension: "docx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    author: "Marketing Team",
    uploaded_by: "marketing@company.com",
    created_at: "2024-04-17T14:22:00Z",
    updated_at: "2024-04-17T14:25:00Z",
    file_created_at: "2024-04-16T10:15:00Z",
    file_modified_at: "2024-04-16T16:20:00Z",
    keywords: ["marketing", "campaign", "analysis", "Q1"],
    category_ids: ["cat-3"],
    topic_ids: ["topic-3"],
    has_chunks: false,
    has_errors: false,
    view_count: 8,
    last_accessed: "2024-06-18T11:30:00Z",
  },
  {
    id: "4",
    name: "Product Launch Strategy - Innovation Series.pptx",
    source_type: "onedrive",
    processing_status: "COMPLETED",
    file_size_bytes: 8388608,
    file_extension: "pptx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    author: "Product Team",
    uploaded_by: "product@company.com",
    created_at: "2024-03-18T16:45:00Z",
    updated_at: "2024-03-18T16:50:00Z",
    file_created_at: "2024-03-17T13:20:00Z",
    file_modified_at: "2024-03-17T15:30:00Z",
    keywords: ["product", "launch", "strategy", "innovation"],
    category_ids: ["cat-4"],
    topic_ids: ["topic-4"],
    has_chunks: true,
    has_errors: false,
    is_suggested: true,
    view_count: 42,
    last_accessed: "2024-06-20T08:45:00Z",
  },
  {
    id: "5",
    name: "Technical Architecture Documentation.pdf",
    source_type: "confluence",
    processing_status: "FAILED_PARSING",
    file_size_bytes: 3145728,
    file_extension: "pdf",
    mime_type: "application/pdf",
    author: "Engineering Team",
    uploaded_by: "engineering@company.com",
    created_at: "2024-02-19T11:30:00Z",
    updated_at: "2024-02-19T11:35:00Z",
    file_created_at: "2024-02-18T09:15:00Z",
    file_modified_at: "2024-02-18T14:20:00Z",
    keywords: ["technical", "architecture", "documentation", "engineering"],
    category_ids: ["cat-5"],
    topic_ids: ["topic-5"],
    has_chunks: false,
    has_errors: true,
    view_count: 12,
    last_accessed: "2024-06-19T16:10:00Z",
  },
  // Add 5 more documents for better testing
  {
    id: "6",
    name: "Sales Report Q2 2024.xlsx",
    source_type: "upload",
    processing_status: "COMPLETED",
    file_size_bytes: 1572864,
    file_extension: "xlsx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    author: "Sales Team",
    uploaded_by: "sales@company.com",
    created_at: "2024-07-01T10:00:00Z",
    updated_at: "2024-07-01T10:05:00Z",
    file_created_at: "2024-06-30T14:00:00Z",
    file_modified_at: "2024-06-30T15:00:00Z",
    keywords: ["sales", "report", "Q2", "finance"],
    category_ids: ["cat-1"],
    topic_ids: ["topic-1", "topic-6"],
    has_chunks: true,
    has_errors: false,
    is_recent: true,
    view_count: 78,
    last_accessed: "2024-07-02T11:00:00Z",
  },
  {
    id: "7",
    name: "New Website Design Mockups.png",
    source_type: "googledrive",
    processing_status: "COMPLETED",
    file_size_bytes: 3145728,
    file_extension: "png",
    mime_type: "image/png",
    author: "Design Team",
    uploaded_by: "design@company.com",
    created_at: "2024-06-25T15:30:00Z",
    updated_at: "2024-06-25T15:35:00Z",
    file_created_at: "2024-06-24T10:00:00Z",
    file_modified_at: "2024-06-24T12:00:00Z",
    keywords: ["website", "design", "mockups", "ui", "ux"],
    category_ids: ["cat-3"],
    topic_ids: ["topic-7"],
    has_chunks: true,
    has_errors: false,
    is_suggested: true,
    view_count: 33,
    last_accessed: "2024-06-28T10:00:00Z",
  },
  {
    id: "8",
    name: "Client Onboarding Checklist.docx",
    source_type: "sharepoint",
    processing_status: "PENDING",
    file_size_bytes: 512000,
    file_extension: "docx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    author: "Customer Success",
    uploaded_by: "cs@company.com",
    created_at: "2024-06-10T12:00:00Z",
    updated_at: "2024-06-10T12:05:00Z",
    file_created_at: "2024-06-09T09:00:00Z",
    file_modified_at: "2024-06-09T10:00:00Z",
    keywords: ["client", "onboarding", "checklist", "customer success"],
    category_ids: ["cat-2"],
    topic_ids: ["topic-8"],
    has_chunks: false,
    has_errors: false,
    view_count: 5,
    last_accessed: "2024-06-12T14:00:00Z",
  },
  {
    id: "9",
    name: "Competitor Analysis Report.pdf",
    source_type: "upload",
    processing_status: "INDEXING",
    file_size_bytes: 2097152,
    file_extension: "pdf",
    mime_type: "application/pdf",
    author: "Strategy Team",
    uploaded_by: "strategy@company.com",
    created_at: "2024-05-20T14:00:00Z",
    updated_at: "2024-05-20T14:05:00Z",
    file_created_at: "2024-05-19T11:00:00Z",
    file_modified_at: "2024-05-19T13:00:00Z",
    keywords: [
      "competitor",
      "analysis",
      "report",
      "strategy",
      "market research",
    ],
    category_ids: ["cat-4"],
    topic_ids: ["topic-9"],
    has_chunks: true,
    has_errors: false,
    view_count: 21,
    last_accessed: "2024-06-01T16:00:00Z",
  },
  {
    id: "10",
    name: "Annual Company Retreat Itinerary.pptx",
    source_type: "onedrive",
    processing_status: "COMPLETED",
    file_size_bytes: 4194304,
    file_extension: "pptx",
    mime_type:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    author: "Events Team",
    uploaded_by: "events@company.com",
    created_at: "2024-04-01T09:00:00Z",
    updated_at: "2024-04-01T09:05:00Z",
    file_created_at: "2024-03-30T10:00:00Z",
    file_modified_at: "2024-03-30T12:00:00Z",
    keywords: ["company", "retreat", "itinerary", "events", "annual"],
    category_ids: ["cat-2"],
    topic_ids: ["topic-10"],
    has_chunks: true,
    has_errors: false,
    is_recent: true,
    view_count: 95,
    last_accessed: "2024-06-27T09:30:00Z",
  },
];

const sourceTypeOptions = [
  {
    value: "upload",
    label: "Direct Upload",
    icon: Upload,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    value: "sharepoint",
    label: "SharePoint",
    icon: FileText,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    value: "googledrive",
    label: "Google Drive",
    icon: FileText,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    value: "onedrive",
    label: "OneDrive",
    icon: FileText,
    color: "bg-sky-50 text-sky-600 border-sky-200",
  }, // Changed color for variety
  {
    value: "slack",
    label: "Slack",
    icon: FileText,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    value: "confluence",
    label: "Confluence",
    icon: FileText,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

const processingStatusOptions = [
  {
    value: "COMPLETED",
    label: "Completed",
    color: "text-green-700", // Darker green for better contrast
    bgColor: "bg-green-100 border-green-300", // Adjusted for better visibility
    icon: CheckCircle,
  },
  {
    value: "EMBEDDING",
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-100 border-blue-300",
    icon: RefreshCw,
  },
  {
    value: "PENDING",
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100 border-yellow-300",
    icon: Clock,
  },
  {
    value: "FAILED_PARSING",
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
  {
    value: "INDEXING",
    label: "Indexing",
    color: "text-purple-700",
    bgColor: "bg-purple-100 border-purple-300",
    icon: Zap,
  },
];

const sortOptions = [
  { value: "created_at", label: "Date Created" },
  { value: "updated_at", label: "Date Updated" },
  { value: "name", label: "Name" },
  { value: "file_size_bytes", label: "File Size" },
  { value: "view_count", label: "Most Viewed" },
  { value: "last_accessed", label: "Recently Accessed" },
];

const quickFilters = [
  { label: "Recent", value: "recent", icon: Clock },
  { label: "Suggested", value: "suggested", icon: Sparkles },
  { label: "Popular", value: "popular", icon: TrendingUp }, // Changed from Most Viewed for brevity
  { label: "Bookmarked", value: "bookmarked", icon: Bookmark },
];

function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );

  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    if (activeQuickFilter) {
      switch (activeQuickFilter) {
        case "recent":
          filtered = filtered.filter((doc) => doc.is_recent);
          break;
        case "suggested":
          filtered = filtered.filter((doc) => doc.is_suggested);
          break;
        case "popular":
          filtered = filtered
            .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
            .slice(0, 10);
          break;
        case "bookmarked":
          filtered = filtered.filter(
            (doc) =>
              doc.keywords.includes("budget") ||
              doc.keywords.includes("strategy")
          );
          break;
      }
    }

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(lowerSearchQuery) ||
          doc.author?.toLowerCase().includes(lowerSearchQuery) ||
          doc.keywords.some((keyword) =>
            keyword.toLowerCase().includes(lowerSearchQuery)
          )
      );
    }

    if (selectedSourceTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedSourceTypes.includes(doc.source_type)
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedStatuses.includes(doc.processing_status)
      );
    }

    if (dateRange && (dateRange.from || dateRange.to)) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.created_at);
        if (dateRange.from && docDate < dateRange.from) return false;
        if (dateRange.to && docDate > dateRange.to) return false;
        return true;
      });
    }

    if (!activeQuickFilter || activeQuickFilter !== "popular") {
      filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Document];
        let bValue: any = b[sortBy as keyof Document];

        if (sortBy === "file_size_bytes" || sortBy === "view_count") {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (sortBy.includes("_at") || sortBy === "last_accessed") {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }
    return filtered;
  }, [
    documents,
    searchQuery,
    selectedSourceTypes,
    selectedStatuses,
    sortBy,
    sortOrder,
    dateRange,
    activeQuickFilter,
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const getFileIcon = (extension: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass =
      size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5 h-5";
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <File className={`${sizeClass} text-red-500`} />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className={`${sizeClass} text-green-600`} />;
      case "docx":
      case "doc":
        return <FileText className={`${sizeClass} text-blue-600`} />;
      case "pptx":
      case "ppt":
        return <FileText className={`${sizeClass} text-orange-600`} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className={`${sizeClass} text-purple-600`} />;
      default:
        return <FileText className={`${sizeClass} text-gray-500`} />;
    }
  };

  const getStatusIcon = (status: string) => {
    const statusOption = processingStatusOptions.find(
      (opt) => opt.value === status
    );
    if (!statusOption) return <Clock className="w-4 h-4 text-gray-500" />;
    const Icon = statusOption.icon;
    return <Icon className={`w-4 h-4 ${statusOption.color}`} />;
  };

  const getStatusBadge = (status: string) => {
    const statusOption = processingStatusOptions.find(
      (opt) => opt.value === status
    );
    if (!statusOption)
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
    return (
      <Badge
        className={`${statusOption.bgColor} ${statusOption.color} border text-xs font-medium`}
      >
        {statusOption.label}
      </Badge>
    );
  };

  const getSourceBadge = (sourceType: string) => {
    const sourceOption = sourceTypeOptions.find(
      (opt) => opt.value === sourceType
    );
    if (!sourceOption)
      return (
        <Badge variant="outline" className="text-xs">
          {sourceType}
        </Badge>
      );
    return (
      <Badge className={`${sourceOption.color} border text-xs font-medium`}>
        {sourceOption.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSourceTypes([]);
    setSelectedStatuses([]);
    setDateRange(undefined);
    setActiveQuickFilter(null);
  };

  const activeFiltersCount = useMemo(
    () =>
      (searchQuery ? 1 : 0) +
      selectedSourceTypes.length +
      selectedStatuses.length +
      (dateRange && (dateRange.from || dateRange.to) ? 1 : 0) +
      (activeQuickFilter ? 1 : 0),
    [
      searchQuery,
      selectedSourceTypes,
      selectedStatuses,
      dateRange,
      activeQuickFilter,
    ]
  );

  const suggestedDocuments = useMemo(
    () => documents.filter((doc) => doc.is_suggested).slice(0, 3),
    [documents]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] text-[#3E4128]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#A3BC02]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#E1F179]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#3E4128]">
                  Documents
                </h1>
                <p className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                  <span>
                    {filteredDocuments.length} of {documents.length} documents
                  </span>
                  {activeQuickFilter && (
                    <>
                      <Separator
                        orientation="vertical"
                        className="h-4 hidden sm:block"
                      />
                      <span className="text-[#A3BC02] font-medium">
                        {
                          quickFilters.find(
                            (f) => f.value === activeQuickFilter
                          )?.label
                        }{" "}
                        view
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="h-10 w-10 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
                >
                  {viewMode === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                  <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">
                    {viewMode === "grid" ? "List" : "Grid"}
                  </span>
                </Button>
                <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white shadow-lg shadow-[#A3BC02]/25 h-10">
                  <Upload className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </div>
            </div>

            <div className="mb-5">
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  {quickFilters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeQuickFilter === filter.value;
                    return (
                      <Button
                        key={filter.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setActiveQuickFilter(isActive ? null : filter.value)
                        }
                        className={`h-9 ${
                          isActive
                            ? "bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base bg-white"
                />
                <Paperclip className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-[#A3BC02]" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative h-10 sm:h-11 flex-1 lg:flex-none bg-white hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-[#A3BC02] text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 rounded-full">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-auto lg:w-44 h-10 sm:h-11 bg-white">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="h-10 w-10 sm:h-11 sm:w-11 bg-white hover:bg-gray-50"
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                    <span className="sr-only">Sort order</span>
                  </Button>
                </div>
              </div>
            </div>
            {/* Mobile Sort Options */}
            <div className="sm:hidden mt-3 flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 h-10 bg-white">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="h-10 w-10 bg-white hover:bg-gray-50"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
                <span className="sr-only">Sort order</span>
              </Button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-b border-gray-200/80 bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                      Source Type
                    </label>
                    <ScrollArea className="h-48 pr-3">
                      <div className="space-y-2.5">
                        {sourceTypeOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2.5"
                          >
                            <Checkbox
                              id={`source-${option.value}`}
                              checked={selectedSourceTypes.includes(
                                option.value
                              )}
                              onCheckedChange={(checked) => {
                                setSelectedSourceTypes((prev) =>
                                  checked
                                    ? [...prev, option.value]
                                    : prev.filter((t) => t !== option.value)
                                );
                              }}
                            />
                            <label
                              htmlFor={`source-${option.value}`}
                              className="text-sm text-gray-600 cursor-pointer flex items-center gap-2 flex-1 hover:text-[#A3BC02]"
                            >
                              <option.icon className="w-3.5 h-3.5" />
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                      Processing Status
                    </label>
                    <ScrollArea className="h-48 pr-3">
                      <div className="space-y-2.5">
                        {processingStatusOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2.5"
                          >
                            <Checkbox
                              id={`status-${option.value}`}
                              checked={selectedStatuses.includes(option.value)}
                              onCheckedChange={(checked) => {
                                setSelectedStatuses((prev) =>
                                  checked
                                    ? [...prev, option.value]
                                    : prev.filter((s) => s !== option.value)
                                );
                              }}
                            />
                            <label
                              htmlFor={`status-${option.value}`}
                              className="text-sm text-gray-600 cursor-pointer flex items-center gap-2 flex-1 hover:text-[#A3BC02]"
                            >
                              <option.icon
                                className={`w-3.5 h-3.5 ${option.color}`}
                              />
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2.5 block">
                      Date Range (Created)
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white hover:bg-gray-50"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange && dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          autoFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col justify-end mt-4 sm:mt-0">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      disabled={activeFiltersCount === 0}
                      className="w-full text-[#A3BC02] hover:bg-[#A3BC02]/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {!activeQuickFilter && suggestedDocuments.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#A3BC02]" />
                <h2 className="text-xl font-semibold text-[#3E4128]">
                  Suggested for You
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {suggestedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-[#A3BC02]/20 bg-white/50 group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getFileIcon(doc.file_extension, "md")}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#3E4128] text-sm line-clamp-2 mb-1.5 group-hover:text-[#A3BC02] transition-colors">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(doc.processing_status)}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>{formatFileSize(doc.file_size_bytes)}</span>
                              <span>{doc.view_count} views</span>
                            </div>
                            <div>
                              {format(new Date(doc.created_at), "MMM dd, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator className="mt-8 bg-gray-200/80" />
            </motion.section>
          )}

          {filteredDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm sm:text-base">
                {activeFiltersCount > 0
                  ? "Try adjusting your filters or search terms to find what you're looking for."
                  : "Upload your first document to get started with organizing your knowledge."}
              </p>
              {activeFiltersCount > 0 ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#A3BC02] hover:border-[#A3BC02]"
                >
                  <X className="w-4 h-4 mr-2" /> Clear All Filters
                </Button>
              ) : (
                <Button className="bg-[#A3BC02] hover:bg-[#8BA000] text-white shadow-md">
                  <Upload className="w-4 h-4 mr-2" /> Upload Documents
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                  : "space-y-3 sm:space-y-4"
              }
            >
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, ease: "easeOut" }}
                  layout
                >
                  {viewMode === "grid" ? (
                    <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group bg-white/70 border-gray-200/80">
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {getFileIcon(doc.file_extension, "lg")}
                            <div className="flex-1 min-w-0 mt-0.5">
                              <CardTitle className="text-base font-semibold text-[#3E4128] mb-1.5 line-clamp-2 group-hover:text-[#A3BC02] transition-colors">
                                {doc.name}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {getStatusBadge(doc.processing_status)}
                                {getSourceBadge(doc.source_type)}
                              </div>
                            </div>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity hover:bg-[#A3BC02]/10"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-1">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-sm h-9"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-sm h-9"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-sm h-9"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Bookmark
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2.5 text-xs text-gray-500">
                          <div className="flex justify-between items-center">
                            <span>Size:</span>
                            <span className="font-medium text-gray-700">
                              {formatFileSize(doc.file_size_bytes)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Author:</span>
                            <span className="font-medium text-gray-700 truncate ml-2">
                              {doc.author || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Views:</span>
                            <span className="font-medium text-gray-700">
                              {doc.view_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Created:</span>
                            <span className="font-medium text-gray-700">
                              {format(new Date(doc.created_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                          {doc.last_accessed && (
                            <div className="flex justify-between items-center">
                              <span>Accessed:</span>
                              <span className="font-medium text-gray-700">
                                {formatDistanceToNowStrict(
                                  new Date(doc.last_accessed),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="hover:shadow-lg transition-all duration-200 group bg-white/70 border-gray-200/80 hover:border-[#A3BC02]/40">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                              {getStatusIcon(doc.processing_status)}
                              {getFileIcon(doc.file_extension)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#3E4128] truncate group-hover:text-[#A3BC02] transition-colors text-sm sm:text-base">
                                {doc.name}
                              </h3>
                              <div className="hidden sm:flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                                <span className="font-medium">
                                  {formatFileSize(doc.file_size_bytes)}
                                </span>
                                <span className="truncate max-w-[120px]">
                                  {doc.author || "N/A"}
                                </span>
                                <span>
                                  {format(
                                    new Date(doc.created_at),
                                    "MMM dd, 'yy"
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {doc.view_count || 0}
                                </span>
                                {doc.last_accessed && (
                                  <span>
                                    Accessed:{" "}
                                    {formatDistanceToNowStrict(
                                      new Date(doc.last_accessed),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center flex-shrink-0">
                            <div className="hidden md:flex items-center gap-2">
                              {getStatusBadge(doc.processing_status)}
                              {getSourceBadge(doc.source_type)}
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-[#A3BC02]/10"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-1">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm h-9"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm h-9"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm h-9"
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Bookmark
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        {/* Mobile-specific metadata row */}
                        <div className="sm:hidden flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200/80">
                          <span className="font-medium">
                            {formatFileSize(doc.file_size_bytes)}
                          </span>
                          <span className="truncate max-w-[120px]">
                            {doc.author || "N/A"}
                          </span>
                          <span>
                            {format(new Date(doc.created_at), "MMM dd, 'yy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {doc.view_count || 0}
                          </span>
                          {getStatusBadge(doc.processing_status)}
                          {getSourceBadge(doc.source_type)}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DocumentsPage;
