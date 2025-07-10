"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MessageCirclePlus, Search, Eye, Folder, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { clientApiRequestJson } from "@/lib/client-api";
import Image from "next/image";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  filename: string;
  document_type: string;
  categories: string[];
  topics: string[];
  content: string;
  source_type: string;
  extension: string;
  folder_id: string | null;
  remote_folder_id: string | null;
  connection_id: string | null;
  scores: {
    text: number;
    semantic: number;
    sparse: number;
    combined: number;
  };
}

export function DashboardHeader() {
  const { state, isMobile, openMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showBorder = isMobile ? !openMobile : state === "collapsed";
  const isHistoryPage = pathname === "/history";
  const isLibraryPage = pathname.startsWith("/library") && !pathname.startsWith("/library/drive");

  // File icon mapping function
  const getFileIcon = (extension?: string | null): string => {
    const extToIcon: Record<string, string> = {
      // Microsoft Office
      doc: "/icons/filetypes/word.png",
      docx: "/icons/filetypes/word.png",
      xls: "/icons/filetypes/excel.png",
      xlsx: "/icons/filetypes/excel.png",
      ppt: "/icons/filetypes/ppt.png",
      pptx: "/icons/filetypes/ppt.png",
      // Adobe
      pdf: "/icons/filetypes/pdf.png",
      // Text files - using generic file icon
      txt: "/icons/filetypes/file.png",
      csv: "/icons/filetypes/excel.png",
      rtf: "/icons/filetypes/file.png",
      xml: "/icons/filetypes/file.png",
      // Other - using generic file icon
      md: "/icons/filetypes/file.png",
      json: "/icons/filetypes/file.png",
    };
    return extToIcon[extension?.toLowerCase() || ""] || "/icons/filetypes/file.png";
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300); // 300ms debounce
    },
    []
  );

  // Search function using the search/full endpoint
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);
    
    try {
      const { data, error } = await clientApiRequestJson<{
        results: SearchResult[];
        total_results: number;
        query_time_ms: number;
        search_type: string;
      }>("/api/search/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 10,
          include_summary: false,
          filters: {
            document_type: ["pdf", "docx", "txt", "md", "csv", "xlsx", "pptx"],
          },
          relevance_threshold: 0.1,
        }),
      });

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else if (data) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate to document based on source type
  const navigateToDocument = (result: SearchResult) => {
    if (result.source_type.toLowerCase() === "upload") {
      // Navigate to uploaded document folder
      if (result.folder_id) {
        router.push(`/library/f/${result.folder_id}`);
      } else {
        router.push("/library");
      }
    } else {
      // Navigate to integration document folder
      if (result.connection_id && result.remote_folder_id) {
        router.push(`/library/drive/${result.connection_id}/f/${result.remote_folder_id}`);
      } else if (result.connection_id) {
        router.push(`/library/drive/${result.connection_id}`);
      }
    }
    setShowDropdown(false);
  };

  // View document
  const viewDocument = (result: SearchResult) => {
    // Navigate to document viewer or open document
    router.push(`/library/document/${result.id}`);
    setShowDropdown(false);
  };

  // Initialize search from URL params
  useEffect(() => {
    if (isHistoryPage || isLibraryPage) {
      const query = searchParams.get("search") || "";
      setSearchQuery(query);
    }
  }, [isHistoryPage, isLibraryPage, searchParams]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (isHistoryPage) {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.replace(`/history?${params.toString()}`);
    } else if (isLibraryPage) {
      // For library page, use debounced search for dropdown
      debouncedSearch(value);
    }
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 flex items-center px-4 py-3 backdrop-blur-sm ${
        showBorder ? "border-l-8 border-l-[#8ECC3A]" : ""
      }`}
    >
      {/* Left Section: Sidebar + New Button */}
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <Link href="/dashboard">
          <Button
            className="
              text-gray-900
              border
              bg-white
              border-[#A3BC01]
              rounded-full
              px-4
              transition
              duration-200
              [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2)]
              hover:[box-shadow:inset_0_0_36px_0_rgba(163,188,1,0.36),0_2px_12px_0_rgba(163,188,1,0.08)]
              hover:bg-[#FAFFD8]
              hover:border-[#8fa002]
            "
          >
            <MessageCirclePlus className="w-4 h-4 mr-2" />
            New
          </Button>
        </Link>
      </div>

      {/* Center Section: Search Bar (history and library pages) */}
      {(isHistoryPage || isLibraryPage) && (
        <div className="flex-1 flex justify-center">
          <div className="relative max-w-md w-full" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3BC02] w-4 h-4" fill="#eff4d3"/>
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isHistoryPage ? "Search conversations by title..." : "Find documents..."}
              className="pl-10 bg-white border-gray-200 rounded-full font-sans text-sm focus:ring-[#A3BC02] focus:border-[#A3BC02] w-full shadow-lg"
            />
            
            {/* Search Dropdown for Library Page */}
            {isLibraryPage && showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-[#A3BC01] rounded-lg [box-shadow:inset_0_0_25px_0_rgba(163,188,1,0.2),0_2px_12px_0_rgba(163,188,1,0.08)] max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#A3BC02] mr-2" />
                    <span className="text-sm text-gray-600">Searching...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-sm text-gray-500">No documents found</span>
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                      >
                        <Image
                          src={getFileIcon(result.extension)}
                          alt={result.extension || "file"}
                          width={20}
                          height={20}
                          className="flex-shrink-0 mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {result.filename}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {result.document_type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewDocument(result);
                            }}
                            className="h-8 w-8 p-0 bg-[#A3BC02] hover:bg-[#8fa002] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToDocument(result);
                            }}
                            className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Folder className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Section: Empty space for balance */}
      <div className="flex-1" />
    </header>
  );
}
