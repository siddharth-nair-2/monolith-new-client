"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  MessageSquare,
  Search,
  Bookmark,
  Clock,
  History,
  Square,
} from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant: {
    id: string;
    name: string;
  };
}

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

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const isActive = (path: string) => pathname === path;


  // Set loading to false when user is available
  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <Sidebar className="!bg-[#f8f9f5] border-r border-gray-200 border-l-8 border-l-[#8ECC3A] shadow-[inset_0_0_35px_rgba(163,188,4,0.25)]">
      <SidebarHeader className="p-1">
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/dashboard">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/documents")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/documents">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/chat")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/chat">
                    <MessageSquare className="w-5 h-5" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/search")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/search">
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Library Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/saved")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/saved">
                    <Bookmark className="w-5 h-5" />
                    <span>Saved</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/recents")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/recents">
                    <Clock className="w-5 h-5" />
                    <span>Recent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/history")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/history">
                    <History className="w-5 h-5" />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>



        {/* Focus Spaces */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="flex items-center gap-2 text-gray-600 pb-4 text-md">
            <Square className="w-4 h-4" />
            <span>Focus Spaces</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mockFocusSpaces.map((space, index) => (
                <div key={space.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                    >
                      <Link href={`/dashboard/spaces/${space.id}`}>
                        <span className="text-lg text-custom-dark-green">{space.icon}</span>
                        <span>{space.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {index < mockFocusSpaces.length - 1 && (
                    <div className="mx-2 my-1">
                      <div className="border-b border-gray-300/70"></div>
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 px-6">
        {/* Bottom Logo */}
        <div className="flex justify-start">
          <span className="text-[#3E4128] font-serif font-bold text-4xl underline decoration-[#3E4128] decoration-2 underline-offset-4">
            M
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}