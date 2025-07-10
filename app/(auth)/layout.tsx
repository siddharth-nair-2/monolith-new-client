"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConnectionsPopover } from "@/components/layout/ConnectionsPopover";
import { ProfilePopover } from "@/components/layout/ProfilePopover";
import { Settings } from "lucide-react";
import Link from "next/link";
import { IntegrationsProvider } from "@/lib/integrations-context";

function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col relative">
          <DashboardHeader />
          {children}

          {/* Bottom Right Status Menu */}
          <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
            {/* Connections Popover */}
            <ConnectionsPopover />

            {/* Profile Popover */}
            <ProfilePopover />

            {/* Settings Button */}
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntegrationsProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </IntegrationsProvider>
  );
}