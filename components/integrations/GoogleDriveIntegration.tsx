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
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  Settings,
  Zap,
} from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { clientApiRequest } from "@/lib/client-api";
import { useIntegrations } from "@/lib/integrations-context";
import { toast } from "sonner";
import SyncPipelineSidebar from "./SyncPipelineSidebar";

// Remove these interfaces as they're now defined in the context

export default function GoogleDriveIntegration() {
  const {
    isGoogleDriveAvailable,
    googleDriveConnections,
    googleDriveSyncs,
    isLoading,
    refreshConnections,
    refreshSyncs,
  } = useIntegrations();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showSyncSidebar, setShowSyncSidebar] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(
    null
  );

  // Use data from context instead of local state
  const connections = googleDriveConnections;

  const initiateConnection = async () => {
    setIsConnecting(true);
    try {
      const response = await clientApiRequest(
        "/api/proxy/v1/oauth/authorize/google_drive"
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to initiate OAuth flow");
      }

      const data = await response.json();

      // Store state for verification
      sessionStorage.setItem("oauth_state", data.state);

      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("OAuth initiation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to connect to Google Drive"
      );
      setIsConnecting(false);
    }
  };

  const disconnectAccount = async (connectionId: string) => {
    try {
      const response = await clientApiRequest(
        `/api/proxy/v1/connections/${connectionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Google Drive disconnected successfully");
        refreshConnections();
        refreshSyncs();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to disconnect account");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect account");
    }
  };

  const handleSyncCreated = () => {
    refreshSyncs();
    toast.success(
      "Sync pipeline created successfully. Check the Sync Pipelines section below to monitor it."
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A3BC02] mx-auto mb-4" />
          <p className="text-gray-500">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (!isGoogleDriveAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Image
              src="/icons/integrations/google_drive.svg"
              alt="Google Drive"
              width={32}
              height={32}
            />
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Google Drive integration is not currently available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-medium text-gray-900 mb-2">
              Integration Unavailable
            </h3>
            <p className="text-gray-500 mb-6 font-sans">
              Google Drive integration is not configured or enabled on this
              instance.
            </p>
            <p className="text-sm text-gray-400 font-sans">
              Please contact your administrator for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <Card className="border-2 border-[#00AC47]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Image
              src="/icons/integrations/google_drive.svg"
              alt="Google Drive"
              width={32}
              height={32}
            />
            <span className="font-sans font-normal text-lg">Google Drive</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Image
                src="/icons/integrations/google_drive.svg"
                alt="Google Drive"
                width={48}
                height={48}
                className="mx-auto mb-4 opacity-50"
              />
              <h3 className="text-lg font-serif font-medium text-gray-900 mb-2">
                No Google Drive Connected
              </h3>
              <p className="text-gray-500 mb-6 font-sans">
                Connect your Google Drive account to start syncing and searching
                your documents.
              </p>
              <Button
                onClick={initiateConnection}
                disabled={isConnecting}
                className="bg-[#A3BC02] hover:bg-[#8BA000]"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Google Drive
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Accounts */}
              <div>
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#F6F6F6]"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          {connection.status === "active" ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#A3BC00] rounded-full"></div>
                              <p className="font-sans font-medium text-sm">
                                Connected: {connection.name}
                              </p>
                            </div>
                          ) : (
                            <p className="font-sans font-medium text-sm">
                              {connection.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-1">
                            <span>
                              Since{" "}
                              {new Date(
                                connection.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {(() => {
                          const connectionSyncs = googleDriveSyncs.filter(
                            (sync) => {
                              const connectionId = sync.source_connection?.id || sync.source_connection_id;
                              return connectionId === connection.id;
                            }
                          );
                          const hasExistingSyncs = connectionSyncs.length > 0;

                          return hasExistingSyncs ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Show sync management/details for existing syncs
                                      toast.info(
                                        "Use the Sync Pipelines section below to manage your syncs."
                                      );
                                    }}
                                    className="text-[#A3BC00] hover:text-[#8BA000] hover:bg-green-50 h-4 w-4 p-0"
                                  >
                                    <Zap className="w-2 h-2" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-sans">
                                    Active sync pipeline - manage in Sync Pipelines section below
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedConnection(connection.id);
                                      setShowSyncSidebar(true);
                                    }}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-4 w-4 p-0"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-sans">
                                    Create sync pipeline for this account
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })()}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => disconnectAccount(connection.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-4 w-4 p-0"
                              >
                                <Trash2 className="w-2 h-2" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-sans">
                                Disconnect this Google Drive account
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={initiateConnection}
                        variant="outline"
                        disabled={isConnecting}
                        className="font-sans rounded-full border-none bg-[#F6F6F6]"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Account
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">
                        Connect an additional Google Drive account
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Pipeline Sidebar */}
      {showSyncSidebar && selectedConnection && (
        <SyncPipelineSidebar
          isOpen={showSyncSidebar}
          connectionId={selectedConnection}
          onClose={() => {
            setShowSyncSidebar(false);
            setSelectedConnection(null);
          }}
          onSyncCreated={handleSyncCreated}
        />
      )}
    </div>
  );
}
