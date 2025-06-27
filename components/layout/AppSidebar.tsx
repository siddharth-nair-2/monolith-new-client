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
  Settings,
  Circle,
  Users,
  Building2,
  User,
  LogOut,
  Cloud,
} from "lucide-react";
import { useIntegrations } from "@/lib/integrations-context";

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
  const { user, logout } = useAuth();
  const { isGoogleDriveConnected, hasActiveSync } = useIntegrations();
  const [isLoading, setIsLoading] = useState(true);

  const isActive = (path: string) => pathname === path;

  // Check if current user is admin or owner
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'owner';
  };

  // Logout function using auth context
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Set loading to false when user is available
  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <Sidebar className="!bg-[#f8f9f5] border-r border-gray-200 border-l-8 border-l-[#8ECC3A] shadow-[inset_0_0_35px_rgba(163,188,4,0.25)]">
      <SidebarHeader className="p-4">
        {/* Logo */}
        <div className="w-8 h-8 bg-[#A3BC02] rounded-lg flex items-center justify-center">
          <span className="text-white font-serif font-bold text-sm">M</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link href="/dashboard">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/documents")}>
                  <Link href="/documents">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/chat")}>
                  <Link href="/chat">
                    <MessageSquare className="w-5 h-5" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/search")}>
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
                <SidebarMenuButton asChild isActive={isActive("/saved")}>
                  <Link href="/saved">
                    <Bookmark className="w-5 h-5" />
                    <span>Saved</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/recents")}>
                  <Link href="/recents">
                    <Clock className="w-5 h-5" />
                    <span>Recent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/history")}>
                  <Link href="/history">
                    <History className="w-5 h-5" />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/team")}>
                  <Link href="/team">
                    <Users className="w-5 h-5" />
                    <span>Team</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin() && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/organization")}>
                    <Link href="/organization">
                      <Building2 className="w-5 h-5" />
                      <span>Organization</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile")}>
                  <Link href="/profile">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link href="/settings">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrations Section */}
        {isGoogleDriveConnected && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-600">Integrations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/settings?tab=integrations")}>
                    <Link href="/settings?tab=integrations">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        {hasActiveSync && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <span>Google Drive</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Focus Spaces */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="flex items-center gap-2 text-gray-600">
            <Circle className="w-4 h-4" />
            <span>Focus Spaces</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mockFocusSpaces.map((space) => (
                <SidebarMenuItem key={space.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/dashboard/spaces/${space.id}`}>
                      <span className="text-lg">{space.icon}</span>
                      <span>{space.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Logout Button */}
        <div className="mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        
        {/* Bottom Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#3E4128] rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-xl">M</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}