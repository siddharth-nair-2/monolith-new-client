"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Paperclip,
  Bookmark,
  Clock,
  History,
  Settings,
  Trophy,
  Users,
  Circle,
  Menu,
} from "lucide-react";

// Mock data

const mockFocusSpaces = [
  {
    id: "1",
    name: "Acme Client",
    icon: "🏢",
  },
  {
    id: "2",
    name: "2025 HR Onboard",
    icon: "📄",
  },
  {
    id: "3",
    name: "Marketing for Croma",
    icon: "🏆",
  },
];

const mockRecentSearches = [
  "Q4 budget planning documents",
  "Employee handbook updates",
  "Client presentation templates",
  "Marketing campaign metrics",
];

function SimpleSidebar({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#f8f9f5] border-r border-gray-200 transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden shadow-[inset_0_0_35px_rgba(163,188,4,0.25)]`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-8 h-8 bg-[#A3BC02] rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-sm">M</span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2 mb-8">
            <Link
              href="/dashboard/saved"
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              <span>Saved</span>
            </Link>
            <Link
              href="/dashboard/recents"
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span>Recents</span>
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
              <span>Query History</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Focus Spaces */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <Circle className="w-4 h-4" />
              <span className="text-sm font-medium">Focus Spaces</span>
            </div>
            <div className="space-y-2">
              {mockFocusSpaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/dashboard/spaces/${space.id}`}
                  className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-lg">{space.icon}</span>
                  <span>{space.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Logo */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#3E4128] rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl">M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}

function DashboardHeader({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  return (
    <header
      className={`fixed top-0 z-50 transition-all duration-300 ${
        sidebarOpen ? "lg:left-64 left-0" : "left-0"
      } ${sidebarOpen ? "opacity-0 lg:opacity-100" : "opacity-100"}`}
    >
      <div className="px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
          <Menu className="w-4 h-4 text-[#3E4128]" />
        </Button>
      </div>
    </header>
  );
}

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen">
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

        {/* Search Bar */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-custom-dark-green" />
            <Input
              type="text"
              placeholder="Ask or Find"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="text-custom-dark-green pl-12 pr-12 py-4 text-lg rounded-3xl bg-[#F0F0F0] focus:border-[#A3BC02] focus:ring-[#A3BC02]"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </Button>

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
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] relative">
      <SimpleSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <SearchSection />

        {/* Bottom Right Status Menu */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#A3BC02] rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Connected
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg"
          >
            <Users className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
