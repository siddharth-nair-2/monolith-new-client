"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Users,
  Settings,
  Cloud,
  Activity,
} from "lucide-react";
import { IntegrationsProvider, useIntegrations } from "@/lib/integrations-context";

function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isGoogleDriveConnected, hasActiveSync } = useIntegrations();
  return (
    <SidebarProvider>
      <div className="h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col relative">
          <DashboardHeader />
          {children}

          {/* Bottom Right Status Menu */}
          <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
            {/* Google Drive Status */}
            {isGoogleDriveConnected && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <div className={`w-2 h-2 rounded-full ${hasActiveSync ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {hasActiveSync ? 'Syncing' : 'Google Drive'}
                  </span>
                </div>
              </div>
            )}

            {/* General Connected Status */}
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