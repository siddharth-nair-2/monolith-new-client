"use client";

import Link from "next/link";
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
  Bookmark,
  Clock,
  History,
  Settings,
  Circle,
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

export function AppSidebar() {
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
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/saved">
                    <Bookmark className="w-5 h-5" />
                    <span>Saved</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/recents">
                    <Clock className="w-5 h-5" />
                    <span>Recents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/history">
                    <History className="w-5 h-5" />
                    <span>Query History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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