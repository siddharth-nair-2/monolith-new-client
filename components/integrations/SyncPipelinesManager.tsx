"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  MoreVertical,
  Trash2,
  Settings,
  Database,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { clientApiRequest } from "@/lib/client-api";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIntegrations } from "@/lib/integrations-context";

export default function SyncPipelinesManager() {
  const { syncs, connections, isLoading, refreshSyncs } = useIntegrations();
  const [runningSync, setRunningSync] = useState<string | null>(null);

  const runSync = async (syncId: string) => {
    setRunningSync(syncId);
    try {
      const response = await clientApiRequest(
        `/api/proxy/v1/syncs/${syncId}/run`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Sync started successfully");
        refreshSyncs();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to start sync");
      }
    } catch (error) {
      toast.error("Failed to start sync");
    } finally {
      setRunningSync(null);
    }
  };

  const deleteSync = async (syncId: string) => {
    try {
      const response = await clientApiRequest(`/api/proxy/v1/syncs/${syncId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Sync pipeline deleted successfully");
        refreshSyncs();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to delete sync pipeline");
      }
    } catch (error) {
      toast.error("Failed to delete sync pipeline");
    }
  };

  const getConnectionDetails = (sync: any) => {
    // The sync response includes source_connection with connection details
    if (sync.source_connection) {
      return {
        id: sync.source_connection.id,
        name: sync.source_connection.name,
        connector_type: "google_drive", // We know it's Google Drive from the API response
      };
    }
    // Fallback to looking up by source_connection_id if needed
    return connections.find((conn) => conn.id === sync.source_connection_id);
  };

  const getIntegrationIcon = (connectorType: string) => {
    const iconMap: Record<string, string> = {
      google_drive: "/icons/integrations/drive.png",
      slack: "/icons/integrations/slack.svg",
      outlook: "/icons/integrations/outlook.svg",
      teams: "/icons/integrations/teams.svg",
      // Add more integrations as they become available
    };

    return iconMap[connectorType] || "/icons/integrations/drive.png"; // fallback to google drive icon
  };

  const getIntegrationName = (connectorType: string) => {
    const nameMap: Record<string, string> = {
      google_drive: "Google Drive",
      slack: "Slack",
      outlook: "Outlook",
      teams: "Microsoft Teams",
    };

    return (
      nameMap[connectorType] ||
      connectorType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#A3BC02] mx-auto mb-4" />
          <p className="text-gray-500 font-sans">Loading sync pipelines...</p>
        </div>
      </div>
    );
  }

  // Filter out deleted syncs
  const activeSyncs = syncs.filter((sync) => sync.status !== "deleted");

  if (activeSyncs.length === 0) {
    return (
      <Card className="border-none rounded-xl">
        <CardContent>
          <div className="flex flex-col items-center py-10 space-y-4 text-center">
            <div className="w-12 h-12 bg-[#A3BC02]/20 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-[#A3BC02]" />
            </div>
            <h3 className="text-lg font-bold text-black">No Sync Pipelines</h3>
            <p className="text-black/70 text-sm max-w-xs">
              Connect an integration above to create your first pipeline.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none rounded-xl">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {activeSyncs.map((sync) => {
            const connection = getConnectionDetails(sync);
            return (
              <div
                key={sync.id}
                className="flex items-center justify-between p-3 px-4 rounded-full bg-[#F6F6F6]"
              >
                {/* Left side - Status, Icon, and Name */}
                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#A3BC00] rounded-full"></div>
                    <span className="font-sans font-medium text-sm">
                      {sync.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Integration Icon */}
                  {connection && (
                    <Image
                      src={getIntegrationIcon(connection.connector_type)}
                      alt={getIntegrationName(connection.connector_type)}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  )}

                  {/* Pipeline Name */}
                  <span className="font-sans font-medium text-sm">
                    {sync.name}
                  </span>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                  {/* Run Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => runSync(sync.id)}
                          disabled={
                            runningSync === sync.id || sync.status === "running"
                          }
                          className="text-[#A3BC00] hover:text-[#8BA000] hover:bg-transparent h-4 w-4 p-0"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-sans">
                          {runningSync === sync.id
                            ? "Running..."
                            : "Run sync now"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* More Options */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-4 w-4 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-48 p-1 bg-white border border-gray-200 shadow-lg"
                      align="end"
                    >
                      <div className="space-y-1">
                        <button
                          onClick={() => runSync(sync.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left"
                        >
                          <PlayCircle className="w-4 h-4 text-[#A3BC00]" />
                          <span className="text-sm font-medium text-gray-700">
                            Run Now
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            toast.info(
                              "Sync editing functionality coming soon! For now, you can delete and recreate the sync if needed."
                            );
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left"
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Edit Settings
                          </span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => deleteSync(sync.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 transition-colors text-left"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            Delete Pipeline
                          </span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
