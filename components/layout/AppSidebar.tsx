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
  Target,
  Plus,
  Library,
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

interface FocusMode {
  id: string;
  name: string;
  icon: string;
  document_count: number;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [focusModes, setFocusModes] = useState<FocusMode[]>([]);

  const isActive = (path: string) => pathname === path;
  const isFocusActive = (focusId: string) => pathname === `/focus/${focusId}`;

  const loadFocusModes = async () => {
    try {
      const response = await fetch("/api/focus-modes");
      if (response.ok) {
        const data = await response.json();
        setFocusModes(data.focus_modes?.slice(0, 5) || []); // Show max 5 in sidebar
      }
    } catch (error) {
      console.error("Failed to load focus modes:", error);
    }
  };


  // Set loading to false when user is available and load focus modes
  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
      loadFocusModes();
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
                  isActive={isActive("/library")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                >
                  <Link href="/library">
                    <Library className="w-5 h-5" />
                    <span>Library</span>
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

        {/* Library Section
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
        </SidebarGroup> */}



        {/* Focus Spaces */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="flex items-center justify-between text-gray-600 pb-4 text-md">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Focus Spaces</span>
            </div>
            <Link href="/focus" className="hover:bg-[#A3BC02]/10 rounded p-1">
              <Plus className="w-3 h-3" />
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* View All Focus Modes Link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/focus")}
                  className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors text-sm text-gray-600"
                >
                  <Link href="/focus">
                    <Square className="w-4 h-4" />
                    <span>View All</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Recent Focus Modes */}
              {focusModes.map((focusMode, index) => (
                <div key={focusMode.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isFocusActive(focusMode.id)}
                      className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors"
                    >
                      <Link href={`/focus/${focusMode.id}`}>
                        <span className="text-lg text-custom-dark-green">{focusMode.icon}</span>
                        <span className="truncate">{focusMode.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {index < focusModes.length - 1 && (
                    <div className="mx-2 my-1">
                      <div className="border-b border-gray-300/70"></div>
                    </div>
                  )}
                </div>
              ))}

              {focusModes.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-[#A3BC02]/10 hover:text-[#3E4128] transition-colors text-sm text-gray-500"
                  >
                    <Link href="/focus">
                      <Plus className="w-4 h-4" />
                      <span>Create your first focus space</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
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