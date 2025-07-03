"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Paperclip,
  Clock,
  ArrowRight,
  FileText,
  Filter,
} from "lucide-react";
import { clientApiRequestJson } from "@/lib/client-api";
import { useIntegrations } from "@/lib/integrations-context";
import Image from "next/image";

// Mock data
const mockRecentSearches = [
  "Q4 budget planning documents",
  "Employee handbook updates",
  "Client presentation templates",
  "Marketing campaign metrics",
];

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [instantResults, setInstantResults] = useState<
    Array<Record<string, any>>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    []
  );
  const { isGoogleDriveConnected } = useIntegrations();

  // Debounced instant search function
  const performInstantSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setInstantResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await clientApiRequestJson("/api/search/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          limit: 5,
          include_summary: false,
        }),
      });

      if (error) {
        console.error("Search failed:", error.message || "Unknown error");
        setInstantResults([]);
      } else {
        setInstantResults(data?.results || []);
      }
    } catch (error) {
      console.error("Instant search failed:", error);
      setInstantResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce the instant search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performInstantSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performInstantSearch]);

  const handleSubmit = () => {
    const query = searchQuery.trim();
    if (query) {
      // Handle search submission here
    }
  };

  const toggleIntegration = (integration: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integration)
        ? prev.filter((i) => i !== integration)
        : [...prev, integration]
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Monolith Branding */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#3E4128] font-semibold mb-4">
            Mono
            <span className="underline decoration-[#A3BC02] decoration-4 underline-offset-4">
              l
            </span>
            ith
          </h1>
        </div>

        {/* Search Bar and Attach Button */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-custom-dark-green" />
            <Input
              type="text"
              placeholder="Ask or Find"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSubmit();
                }
              }}
              className={`text-custom-dark-green pl-12 py-4 text-lg rounded-3xl bg-[#F0F0F0] focus:bg-white border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_15px_rgba(163,188,1,0.2),0_4px_4px_0_rgba(163,188,1,1)] transition-shadow duration-200 ${
                searchQuery.trim() ? "pr-12" : "pr-4"
              }`}
            />

            {/* Submit Button - only shows when there's text */}
            {searchQuery.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleSubmit}
                className="absolute right-3 top-2 w-6 h-6  hover:bg-[#A3BC02] hover:text-white border border-[#A3BC02] shadow-[inset_0_0_15px_rgba(163,188,1,0.2)] text-custom-dark-green rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 " />
              </motion.button>
            )}

            {/* Instant Search Suggestions */}
            {showSuggestions && searchQuery.length >= 3 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {isSearching
                      ? "Searching..."
                      : `Suggested searches (${instantResults.length} results)`}
                  </div>
                  {isSearching ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      <div className="animate-pulse">Searching...</div>
                    </div>
                  ) : instantResults.length > 0 ? (
                    instantResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                        onClick={() => {
                          setSearchQuery(
                            result.title ||
                              result.filename ||
                              result.content?.substring(0, 50) ||
                              "Document"
                          );
                          setShowSuggestions(false);
                        }}
                      >
                        <FileText className="w-3 h-3 text-gray-400" />
                        <div className="truncate">
                          {result.title ||
                            result.filename ||
                            result.content?.substring(0, 50) ||
                            "Document"}
                        </div>
                      </button>
                    ))
                  ) : searchQuery.length >= 3 && !isSearching ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No results found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
            {/* Recent Searches (fallback when no query) */}
            {showSuggestions && searchQuery.length < 3 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Recent Searches
                  </div>
                  {mockRecentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Clock className="w-3 h-3 text-gray-400" />
                      {search}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Separate Attach Button */}
          <Button
            size="default"
            variant="outline"
            className="rounded-full w-10 h-10 bg-[#F0F0F0] hover:border-[#A3BC02] hover:bg-[#A3BC02]/10"
          >
            <Paperclip className="w-5 h-5 text-gray-600" strokeWidth={2.2} />
          </Button>
        </motion.div>

        {/* Filter Section - Only show if connected to integrations */}
        {isGoogleDriveConnected && (
          <motion.div
            className="flex flex-col items-center gap-3 mt-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Google Drive Toggle */}
              <button
                onClick={() => toggleIntegration("google_drive")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  selectedIntegrations.includes("google_drive")
                    ? "bg-white border-[#FCCD48] text-gray-900 [box-shadow:inset_0_0_25px_0_rgba(252,205,72,0.3)]"
                    : "bg-white border-gray-100 text-gray-600 hover:border-[#FCCD48] [box-shadow:inset_0_0_10px_0_rgba(252,205,72,0.4)]"
                }`}
              >
                <Image
                  src="/icons/integrations/google_drive.svg"
                  alt="Google Drive"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium">Google Drive</span>
              </button>

              {/* Future integrations can be added here in the same pattern */}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  return <SearchSection />;
}