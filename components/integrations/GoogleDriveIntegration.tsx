"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Plus,
  Settings as SettingsIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  Eye,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { clientApiRequest, clientApiRequestJson } from '@/lib/client-api';
import { useIntegrations } from '@/lib/integrations-context';
import { toast } from 'sonner';
import GoogleDriveFileBrowser from './GoogleDriveFileBrowser';
import SyncConfigurationDialog from './SyncConfigurationDialog';
import SyncDashboard from './SyncDashboard';

// Remove these interfaces as they're now defined in the context

export default function GoogleDriveIntegration() {
  const { 
    isGoogleDriveAvailable,
    googleDriveConnections,
    googleDriveSyncs,
    isLoading,
    refreshConnections,
    refreshSyncs
  } = useIntegrations();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [showSyncConfig, setShowSyncConfig] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  // Use data from context instead of local state
  const connections = googleDriveConnections;
  const syncs = googleDriveSyncs;

  const initiateConnection = async () => {
    setIsConnecting(true);
    try {
      const response = await clientApiRequest('/api/proxy/v1/oauth/authorize/google_drive');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to initiate OAuth flow');
      }

      const data = await response.json();
      
      // Store state for verification
      sessionStorage.setItem('oauth_state', data.state);
      
      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('OAuth initiation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Google Drive');
      setIsConnecting(false);
    }
  };

  const disconnectAccount = async (connectionId: string) => {
    try {
      const response = await clientApiRequest(`/api/proxy/v1/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Google Drive disconnected successfully');
        refreshConnections();
        refreshSyncs();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to disconnect account');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const refreshConnection = async (connectionId: string) => {
    try {
      const response = await clientApiRequest(`/api/proxy/v1/connections/${connectionId}/refresh`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Connection refreshed successfully');
        refreshConnections();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to refresh connection');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh connection');
    }
  };

  const handleSyncCreated = () => {
    setShowSyncConfig(false);
    refreshSyncs();
    toast.success('Sync pipeline created successfully');
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
            <div className="p-2 bg-gray-50 rounded-lg">
              <Cloud className="w-6 h-6 text-gray-400" />
            </div>
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Google Drive integration is not currently available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-medium text-gray-900 mb-2">Integration Unavailable</h3>
            <p className="text-gray-500 mb-6 font-sans">
              Google Drive integration is not configured or enabled on this instance.
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-serif">Google Drive Integration</span>
          </CardTitle>
          <CardDescription className="font-sans">
            Connect your Google Drive to sync and search your documents. 
            Supports native processing for Google Docs, Sheets, and Slides with enhanced metadata extraction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-serif font-medium text-gray-900 mb-2">No Google Drive Connected</h3>
              <p className="text-gray-500 mb-6 font-sans">
                Connect your Google Drive account to start syncing and searching your documents.
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
                <h4 className="font-serif font-medium mb-3">Connected Accounts</h4>
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Cloud className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-serif font-medium">{connection.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge 
                              variant={connection.status === 'active' ? 'default' : 'destructive'}
                              className={connection.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {connection.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {connection.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                              {connection.status}
                            </Badge>
                            <span>Connected {new Date(connection.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => refreshConnection(connection.id)}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-sans">Refresh connection status</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {(() => {
                          const connectionSyncs = syncs.filter(sync => 
                            (sync.source_connection?.id || sync.source_connection_id) === connection.id
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
                                      toast.info('Sync management coming soon! Use the Sync Pipelines section below to manage your syncs.');
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-sans">View sync details (use Sync Pipelines section below)</p>
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
                                      setShowFileBrowser(true);
                                    }}
                                    className="bg-[#A3BC02] hover:bg-[#8BA000] text-white"
                                  >
                                    <Zap className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-sans">Create sync pipeline for this account</p>
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-sans">Disconnect this Google Drive account</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="flex gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={initiateConnection}
                        variant="outline"
                        disabled={isConnecting}
                        className="font-sans"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Account
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans">Connect an additional Google Drive account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Pipelines */}
      {syncs.length > 0 && (
        <SyncDashboard syncs={syncs} onRefresh={refreshSyncs} />
      )}

      {/* Google Workspace Features Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Google Workspace Support:</strong> This integration now includes native processing 
          for Google Docs, Sheets, and Slides with preserved formatting, comments, and enhanced metadata extraction. 
          Incremental sync dramatically improves performance for large drives.
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      {showFileBrowser && selectedConnection && (
        <GoogleDriveFileBrowser
          connectionId={selectedConnection}
          onClose={() => {
            setShowFileBrowser(false);
            setSelectedConnection(null);
          }}
          onSyncConfigured={() => {
            setShowFileBrowser(false);
            setShowSyncConfig(true);
          }}
        />
      )}

      {showSyncConfig && (
        <SyncConfigurationDialog
          connections={connections}
          onClose={() => setShowSyncConfig(false)}
          onSyncCreated={handleSyncCreated}
        />
      )}
    </div>
  );
}