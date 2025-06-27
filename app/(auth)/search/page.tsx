"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Filter,
  SortAsc,
  FileText,
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileImage,
  File,
  Loader2,
  TrendingUp,
  Clock,
  Star,
  MoreVertical,
  Bookmark,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  filename: string;
  title?: string;
  content: string;
  document_type: string;
  categories?: string[];
  topics?: string[];
  scores?: {
    text: number;
    semantic: number;
    sparse: number;
    combined: number;
  };
  relevance_score?: number; // For backward compatibility
  created_at?: string;
  file_size?: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

interface SearchFilters {
  documentTypes: string[];
  categories: string[];
  topics: string[];
  sortBy: "relevance" | "date" | "name";
  sortOrder: "asc" | "desc";
}

const documentTypeOptions = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "docx", label: "Word", icon: FileText },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { value: "document", label: "Documents", icon: FileText },
  { value: "spreadsheet", label: "Spreadsheets", icon: FileSpreadsheet },
  { value: "image", label: "Images", icon: FileImage },
];

const categoryOptions = [
  { value: "financial", label: "Financial" },
  { value: "legal", label: "Legal" },
  { value: "hr", label: "HR & Personnel" },
  { value: "marketing", label: "Marketing" },
  { value: "technical", label: "Technical" },
  { value: "administrative", label: "Administrative" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    documentTypes: [],
    categories: [],
    topics: [],
    sortBy: "relevance",
    sortOrder: "desc",
  });
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Instant search and suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [instantResults, setInstantResults] = useState<SearchResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Debounced function for instant search and suggestions
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setInstantResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      
      try {
        // Get suggestions and instant results in parallel
        const [suggestionsResponse, instantResponse] = await Promise.all([
          fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}&limit=5`),
          fetch('/api/search/instant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit: 3 })
          })
        ]);

        if (suggestionsResponse.ok) {
          const suggestionsData = await suggestionsResponse.json();
          setSuggestions(suggestionsData.suggestions || []);
        }

        if (instantResponse.ok) {
          const instantData = await instantResponse.json();
          setInstantResults(instantData.results || []);
        }

        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        // Silently fail for suggestions, don't show error toast
        setSuggestions([]);
        setInstantResults([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  // Handle search input changes
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setInstantResults([]);
    }
  };

  // Helper function for debouncing
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const performSearch = async (query: string, pageNum: number = 1) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false); // Hide suggestions when performing full search
    saveRecentSearch(query);

    try {
      const response = await fetch("/api/search/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          page: pageNum,
          size: 20,
          include_summary: true,
          filters: {
            ...(filters.documentTypes.length > 0 && { document_type: filters.documentTypes }),
            ...(filters.categories.length > 0 && { categories: filters.categories }),
            ...(filters.topics.length > 0 && { topics: filters.topics }),
          },
          sort_by: filters.sortBy,
          sort_order: filters.sortOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setResults(data.results || []);
      } else {
        setResults((prev) => [...prev, ...(data.results || [])]);
      }
      
      setTotalResults(data.total || 0);
      setHasMore(data.has_more || false);
      setPage(pageNum);
    } catch (error: any) {
      console.error("Search error:", error);
      
      // More specific error handling
      if (error.message?.includes("404")) {
        toast.error("Search service not available. Please ensure documents are uploaded and indexed.");
      } else if (error.message?.includes("401") || error.message?.includes("403")) {
        toast.error("Authentication required. Please log in again.");
      } else {
        toast.error("Search failed. Please try again later.");
      }
      
      // Set empty results on error
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery, 1);
  };

  const handleLoadMore = () => {
    performSearch(searchQuery, page + 1);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Re-run search if we have a query
    if (searchQuery) {
      performSearch(searchQuery, 1);
    }
  };

  const getFileIcon = (type: string) => {
    const docType = type?.toLowerCase();
    switch (docType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "xlsx":
      case "xls":
      case "spreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case "image":
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImage className="w-4 h-4 text-purple-600" />;
      case "docx":
      case "doc":
      case "document":
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="flex h-full">
      {/* Filters Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r bg-gray-50/50 overflow-hidden"
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Document Types */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Document Type</Label>
                <div className="space-y-2">
                  {documentTypeOptions.map((type) => (
                    <div key={type.value} className="flex items-center">
                      <Checkbox
                        id={type.value}
                        checked={filters.documentTypes.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange({
                              documentTypes: [...filters.documentTypes, type.value],
                            });
                          } else {
                            handleFilterChange({
                              documentTypes: filters.documentTypes.filter(
                                (t) => t !== type.value
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={type.value}
                        className="ml-2 text-sm cursor-pointer flex items-center gap-2"
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Categories */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Category</Label>
                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <div key={category.value} className="flex items-center">
                      <Checkbox
                        id={category.value}
                        checked={filters.categories.includes(category.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange({
                              categories: [...filters.categories, category.value],
                            });
                          } else {
                            handleFilterChange({
                              categories: filters.categories.filter(
                                (c) => c !== category.value
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={category.value}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Topics */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Topics</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter topics (comma-separated)"
                    value={filters.topics.join(", ")}
                    onChange={(e) => {
                      const topics = e.target.value
                        .split(",")
                        .map(t => t.trim())
                        .filter(t => t.length > 0);
                      handleFilterChange({ topics });
                    }}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter topics like "budget, planning, strategy"
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Sort */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Sort By</Label>
                <RadioGroup
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    handleFilterChange({ sortBy: value as any })
                  }
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="relevance" id="relevance" />
                    <label htmlFor="relevance" className="text-sm cursor-pointer">
                      Relevance
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="date" id="date" />
                    <label htmlFor="date" className="text-sm cursor-pointer">
                      Date
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name" id="name" />
                    <label htmlFor="name" className="text-sm cursor-pointer">
                      Name
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Clear Filters */}
              {(filters.documentTypes.length > 0 ||
                filters.categories.length > 0 ||
                filters.topics.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-6"
                  onClick={() => {
                    setFilters({
                      documentTypes: [],
                      categories: [],
                      topics: [],
                      sortBy: "relevance",
                      sortOrder: "desc",
                    });
                    if (searchQuery) {
                      performSearch(searchQuery, 1);
                    }
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Header */}
        <div className="border-b bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              {!showFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search all documents..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pl-10 pr-4 h-12 text-lg"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || instantResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-96 overflow-y-auto">
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="p-2 border-b">
                        <p className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</p>
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              performSearch(suggestion, 1);
                            }}
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Instant Results */}
                    {instantResults.length > 0 && (
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-500 mb-2 px-2">Quick Results</p>
                        {instantResults.map((result, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded border-b last:border-b-0"
                            onClick={() => {
                              // Handle clicking on instant result - could open document
                              toast.info("Opening document...");
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {getFileIcon(result.document_type || result.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {result.title || result.filename}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {result.highlights?.[0] || "Document content available - click to view"}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round((result.scores?.combined || result.relevance_score || 0) * 100)}%
                              </Badge>
                            </div>
                          </button>
                        ))}
                        {instantResults.length > 0 && (
                          <button
                            className="w-full text-center py-2 text-sm text-[#A3BC02] hover:bg-gray-50 rounded"
                            onClick={() => {
                              handleSearch();
                            }}
                          >
                            View all results
                          </button>
                        )}
                      </div>
                    )}
                    
                    {isLoadingSuggestions && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="bg-[#A3BC02] hover:bg-[#8BA000]"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(search);
                        performSearch(search, 1);
                      }}
                      className="text-sm"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            {results.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found {totalResults} results for "{searchQuery}"
                </p>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split("-");
                    handleFilterChange({
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any,
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance-desc">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Most Relevant
                      </div>
                    </SelectItem>
                    <SelectItem value="date-desc">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="date-asc">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Oldest First
                      </div>
                    </SelectItem>
                    <SelectItem value="name-asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Name (A-Z)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {results.length === 0 && !isSearching && searchQuery && (
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {results.length === 0 && !searchQuery && (
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 bg-[#A3BC02]/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#A3BC02]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Start your search
                </h3>
                <p className="text-gray-500 mb-6">
                  Search across all your documents with advanced filters
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Popular Searches</h4>
                      <p className="text-sm text-gray-500">
                        Budget reports, HR policies, Marketing plans
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Recent Documents</h4>
                      <p className="text-sm text-gray-500">
                        Files added in the last 7 days
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">By Type</h4>
                      <p className="text-sm text-gray-500">
                        PDFs, Spreadsheets, Presentations
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="mb-4 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getFileIcon(result.document_type)}
                            <h3 className="font-semibold text-lg">
                              {result.title || result.filename}
                            </h3>
                            {(result.scores?.combined || result.relevance_score || 0) > 0.8 && (
                              <Badge variant="secondary" className="bg-green-100">
                                High relevance
                              </Badge>
                            )}
                            {result.scores?.combined && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(result.scores.combined * 100)}%
                              </Badge>
                            )}
                          </div>

                          {/* Topics and Categories */}
                          {(result.topics?.length || result.categories?.length) && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.topics?.slice(0, 3).map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                  {topic}
                                </Badge>
                              ))}
                              {result.categories?.slice(0, 2).map((category, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Content preview with highlights - Show only document summary, not chunk content */}
                          {result.highlights && result.highlights.length > 0 ? (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {result.highlights[0]}
                            </p>
                          ) : (
                            <p className="text-gray-600 mb-3 italic">
                              Document content available - click to view
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{result.document_type}</span>
                            {result.created_at && (
                              <>
                                <span>•</span>
                                <span>{format(new Date(result.created_at), "MMM d, yyyy")}</span>
                              </>
                            )}
                            {result.file_size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(result.file_size)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/documents/${result.id}`;
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement bookmark
                              toast.info("Bookmark feature coming soon");
                            }}
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && !isSearching && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isSearching}
                >
                  Load More Results
                </Button>
              </div>
            )}

            {isSearching && results.length > 0 && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}