"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Paperclip,
  Clock,
} from "lucide-react";

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
              className="text-custom-dark-green pl-12 pr-4 py-4 text-lg rounded-3xl bg-[#F0F0F0] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && (
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
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  return <SearchSection />;
}