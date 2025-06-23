"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

// Document interface based on API response
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
}

interface DocumentsResponse {
  items: Document[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}


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
    value: "PENDING",
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100 border-yellow-300",
    icon: Clock,
  },
  {
    value: "PARSING",
    label: "Parsing",
    color: "text-blue-700",
    bgColor: "bg-blue-100 border-blue-300",
    icon: RefreshCw,
  },
  {
    value: "CHUNKING",
    label: "Chunking",
    color: "text-blue-700",
    bgColor: "bg-blue-100 border-blue-300",
    icon: RefreshCw,
  },
  {
    value: "EMBEDDING",
    label: "Embedding",
    color: "text-blue-700",
    bgColor: "bg-blue-100 border-blue-300",
    icon: RefreshCw,
  },
  {
    value: "INDEXING",
    label: "Indexing",
    color: "text-purple-700",
    bgColor: "bg-purple-100 border-purple-300",
    icon: Zap,
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-100 border-green-300",
    icon: CheckCircle,
  },
  {
    value: "FAILED",
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
  {
    value: "FAILED_PARSING",
    label: "Failed (Parsing)",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
  {
    value: "FAILED_CHUNKING",
    label: "Failed (Chunking)",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
  {
    value: "FAILED_EMBEDDING",
    label: "Failed (Embedding)",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
  {
    value: "FAILED_INDEXING",
    label: "Failed (Indexing)",
    color: "text-red-700",
    bgColor: "bg-red-100 border-red-300",
    icon: AlertCircle,
  },
];

const sortOptions = [
  { value: "created_at", label: "Date Created" },
  { value: "updated_at", label: "Date Updated" },
  { value: "name", label: "Name" },
  { value: "file_size_bytes", label: "File Size" },
];

// Removed quick filters for now as they require additional API support

function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", pageSize.toString());
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);
      
      if (debouncedSearchQuery) {
        params.append("search", debouncedSearchQuery);
      }
      
      selectedSourceTypes.forEach((type) => {
        params.append("source_types", type);
      });
      
      selectedStatuses.forEach((status) => {
        params.append("processing_statuses", status);
      });
      
      if (dateRange?.from) {
        params.append("created_after", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("created_before", dateRange.to.toISOString());
      }
      
      const response = await fetch(`/api/documents?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const data: DocumentsResponse = await response.json();
      setDocuments(data.items);
      setTotalDocuments(data.total);
      setHasMore(data.has_more);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, debouncedSearchQuery, selectedSourceTypes, selectedStatuses, dateRange]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedSourceTypes, selectedStatuses, dateRange, sortBy, sortOrder]);


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const getFileIcon = (extension: string | null | undefined, size: "sm" | "md" | "lg" = "md") => {
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
  };

  const activeFiltersCount = useMemo(
    () =>
      (searchQuery ? 1 : 0) +
      selectedSourceTypes.length +
      selectedStatuses.length +
      (dateRange && (dateRange.from || dateRange.to) ? 1 : 0),
    [
      searchQuery,
      selectedSourceTypes,
      selectedStatuses,
      dateRange,
    ]
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
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? (
                    "Loading documents..."
                  ) : error ? (
                    <span className="text-red-500">{error}</span>
                  ) : (
                    <span>{totalDocuments} total documents</span>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#A3BC02] animate-spin" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                Failed to load documents
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm sm:text-base">
                {error}
              </p>
              <Button
                onClick={fetchDocuments}
                className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          ) : documents.length === 0 ? (
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
              {documents.map((doc, index) => (
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
                            {getFileIcon(doc.extension, "lg")}
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
                              {formatFileSize(doc.file_size_bytes || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Uploaded by:</span>
                            <span className="font-medium text-gray-700 truncate ml-2">
                              {doc.uploaded_by || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Chunks:</span>
                            <span className="font-medium text-gray-700">
                              {doc.chunk_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Created:</span>
                            <span className="font-medium text-gray-700">
                              {format(new Date(doc.created_at), "MMM dd, yyyy")}
                            </span>
                          </div>
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
                              {getFileIcon(doc.extension)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#3E4128] truncate group-hover:text-[#A3BC02] transition-colors text-sm sm:text-base">
                                {doc.name}
                              </h3>
                              <div className="hidden sm:flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                                <span className="font-medium">
                                  {formatFileSize(doc.file_size_bytes || 0)}
                                </span>
                                <span>
                                  {format(
                                    new Date(doc.created_at),
                                    "MMM dd, 'yy"
                                  )}
                                </span>
                                {doc.chunk_count !== null && doc.chunk_count !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {doc.chunk_count} chunks
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
                            {formatFileSize(doc.file_size_bytes || 0)}
                          </span>
                          <span>
                            {format(new Date(doc.created_at), "MMM dd, 'yy")}
                          </span>
                          {doc.chunk_count !== null && doc.chunk_count !== undefined && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {doc.chunk_count}
                            </span>
                          )}
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
          
          {/* Pagination */}
          {documents.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalDocuments)} of {totalDocuments} documents
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-3">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DocumentsPage;
