"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { MessageCirclePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { state, isMobile, openMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const showBorder = isMobile ? !openMobile : state === "collapsed";
  const isHistoryPage = pathname === "/history";

  // Initialize search from URL params
  useEffect(() => {
    if (isHistoryPage) {
      const query = searchParams.get("search") || "";
      setSearchQuery(query);
    }
  }, [isHistoryPage, searchParams]);

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
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 flex items-center px-4 py-3 backdrop-blur-sm ${
        showBorder ? "border-l-8 border-l-[#8ECC3A]" : ""
      }`}
    >
      {/* Left Section: Sidebar + New Button */}
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <Link href="/chat">
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

      {/* Center Section: Search Bar (only on history page) */}
      {isHistoryPage && (
        <div className="flex-1 flex justify-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A3BC02] w-4 h-4" fill="#eff4d3"/>
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search conversations by title..."
              className="pl-10 bg-white border-gray-200 rounded-full font-sans text-sm focus:ring-[#A3BC02] focus:border-[#A3BC02] w-full shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Right Section: Empty space for balance */}
      <div className="flex-1" />
    </header>
  );
}
