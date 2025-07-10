"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  Clock,
  PlayCircle,
  StopCircle,
  RefreshCw,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Zap,
  Calendar,
  MoreVertical,
  Trash2,
  Settings
} from 'lucide-react';
import { clientApiRequest } from '@/lib/client-api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SyncJob {
  id: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  started_at?: string;
  completed_at?: string;
  documents_processed: number;
  documents_added: number;
  documents_updated: number;
  documents_failed: number;
  error_message?: string;
  metadata?: {
    trigger_type: 'manual' | 'scheduled';
    sync_strategy: 'incremental' | 'full';
    triggered_by?: string;
  };
}

interface SyncPipeline {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'running';
  source_connection_id: string;
  sync_schedule: string;
  last_run_at?: string;
  next_scheduled_run?: string;
  latest_job?: SyncJob;
  stats?: {
    total_jobs: number;
    successful_jobs: number;
    failed_jobs: number;
    success_rate: number;
    total_documents_processed: number;
    average_duration_seconds: number;
  };
}

interface SyncDashboardProps {
  syncs: SyncPipeline[];
  onRefresh: () => void;
}

export default function SyncDashboard({ syncs, onRefresh }: SyncDashboardProps) {
  const [runningSync, setRunningSync] = useState<string | null>(null);

  const runSync = async (syncId: string) => {
    setRunningSync(syncId);
    try {
      const response = await clientApiRequest(`/api/proxy/v1/syncs/${syncId}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Sync started successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to start sync');
      }
    } catch (error) {
      toast.error('Failed to start sync');
    } finally {
      setRunningSync(null);
    }
  };

  const deleteSync = async (syncId: string) => {
    try {
      const response = await clientApiRequest(`/api/proxy/v1/syncs/${syncId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Sync pipeline deleted successfully');
        onRefresh();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to delete sync pipeline');
      }
    } catch (error) {
      toast.error('Failed to delete sync pipeline');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatSchedule = (schedule: string) => {
    // Parse cron expressions and convert times to user's local timezone
    const parseHourFromCron = (cronExpr: string): number | null => {
      const parts = cronExpr.split(' ');
      if (parts.length >= 5) {
        const hour = parseInt(parts[1]);
        return isNaN(hour) ? null : hour;
      }
      return null;
    };

    const convertGMTToLocal = (gmtHour: number): string => {
      // Create a date in GMT with the specified hour
      const gmtDate = new Date();
      gmtDate.setUTCHours(gmtHour, 0, 0, 0);
      
      // Get local hour
      const localHour = gmtDate.getHours();
      const period = localHour >= 12 ? 'PM' : 'AM';
      const displayHour = localHour === 0 ? 12 : localHour > 12 ? localHour - 12 : localHour;
      
      return `${displayHour} ${period}`;
    };

    const scheduleMap: Record<string, string> = {
      '0 * * * *': 'Every hour',
      '0 */6 * * *': 'Every 6 hours',
      '0 2 1 * *': 'Monthly'
    };
    
    // Handle daily schedule with time conversion
    if (schedule === '0 2 * * *') {
      const localTime = convertGMTToLocal(2);
      return `Daily at ${localTime}`;
    }
    
    // Handle weekly schedule with time conversion
    if (schedule === '0 2 * * 1') {
      const localTime = convertGMTToLocal(2);
      return `Weekly on Monday at ${localTime}`;
    }
    
    // Check for other hourly patterns and convert if needed
    const hour = parseHourFromCron(schedule);
    if (hour !== null && schedule.endsWith('* * *')) {
      const localTime = convertGMTToLocal(hour);
      return `Daily at ${localTime}`;
    }
    
    return scheduleMap[schedule] || 'Custom schedule';
  };

  const getSyncEfficiencyBadge = (job?: SyncJob) => {
    if (!job?.metadata?.sync_strategy) return null;
    
    return job.metadata.sync_strategy === 'incremental' ? (
      <Badge variant="outline" className="border-green-500 text-green-700">
        <Zap className="w-3 h-3 mr-1" />
        Incremental
      </Badge>
    ) : (
      <Badge variant="outline" className="border-orange-500 text-orange-700">
        <FileText className="w-3 h-3 mr-1" />
        Full Scan
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="font-serif">Sync Pipelines</span>
          </CardTitle>
          <CardDescription className="font-sans">
            Monitor and manage your Google Drive sync pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncs.map((sync) => (
              <div key={sync.id} className="border rounded-lg p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif font-medium">{sync.name}</h3>
                      {getStatusBadge(sync.status)}
                      {getSyncEfficiencyBadge(sync.latest_job)}
                    </div>
                    {sync.description && (
                      <p className="text-sm text-gray-600 mb-2">{sync.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatSchedule(sync.sync_schedule)}
                      </div>
                      {sync.next_scheduled_run && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Next: {new Date(sync.next_scheduled_run).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runSync(sync.id)}
                      disabled={runningSync === sync.id || sync.status === 'running'}
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => runSync(sync.id)}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // TODO: Implement sync editing functionality
                          toast.info('Sync editing functionality coming soon! For now, you can delete and recreate the sync if needed.');
                        }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteSync(sync.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Pipeline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Latest Job Status */}
                {sync.latest_job && (
                  <div className="space-y-3">
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-serif font-medium">Latest Run</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {sync.latest_job.metadata?.trigger_type === 'manual' ? 'Manual' : 'Scheduled'}
                          {sync.latest_job.completed_at && (
                            <span>• {new Date(sync.latest_job.completed_at).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Status</p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(sync.latest_job.status)}
                            <span className="font-medium capitalize">{sync.latest_job.status}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Processed</p>
                          <p className="font-medium">{sync.latest_job?.documents_processed || 0} files</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Added</p>
                          <p className="font-medium text-green-600">{sync.latest_job?.documents_added || 0}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Updated</p>
                          <p className="font-medium text-blue-600">{sync.latest_job?.documents_updated || 0}</p>
                        </div>
                      </div>

                      {(sync.latest_job?.documents_failed || 0) > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-4 h-4" />
                            <span>{sync.latest_job?.documents_failed || 0} documents failed to process</span>
                          </div>
                          {sync.latest_job?.error_message && (
                            <p className="text-red-700 mt-1">{sync.latest_job.error_message}</p>
                          )}
                        </div>
                      )}

                      {sync.latest_job?.status === 'running' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Processing...</span>
                            <span className="text-sm text-gray-500">
                              {sync.latest_job?.documents_processed || 0} files processed
                            </span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Stats */}
                {sync.stats && (
                  <div className="space-y-3">
                    <Separator />
                    <div>
                      <h4 className="text-sm font-serif font-medium mb-2">Performance (Last 30 days)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{Math.round((sync.stats?.success_rate || 0) * 100)}%</p>
                            <TrendingUp className={`w-3 h-3 ${(sync.stats?.success_rate || 0) > 0.9 ? 'text-green-600' : 'text-orange-600'}`} />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Total Documents</p>
                          <p className="font-medium">{(sync.stats?.total_documents_processed || 0).toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Total Jobs</p>
                          <p className="font-medium">{sync.stats?.total_jobs || 0}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Avg Duration</p>
                          <p className="font-medium">{formatDuration(sync.stats?.average_duration_seconds)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}