"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Clock,
  Filter,
  Zap,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import { clientApiRequestJson } from '@/lib/client-api';
import { toast } from 'sonner';

interface Connection {
  id: string;
  name: string;
  connector_type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
  last_sync_at?: string;
}

interface SyncConfigurationDialogProps {
  connections: Connection[];
  onClose: () => void;
  onSyncCreated: () => void;
}

interface SyncConfig {
  name: string;
  description: string;
  source_connection_id: string;
  sync_schedule: string;
  filters: {
    folder_ids: string[];
    mime_types: string[];
    exclude_patterns: string[];
    modified_after?: string;
  };
  sync_config: {
    incremental_sync: boolean;
    google_workspace_native: boolean;
    processing_strategy: 'hybrid' | 'native_only' | 'export_only';
  };
}

// Helper function to convert GMT hour to local time display
const convertGMTToLocalTime = (gmtHour: number): string => {
  // Create a date in GMT with the specified hour
  const gmtDate = new Date();
  gmtDate.setUTCHours(gmtHour, 0, 0, 0);
  
  // Get local hour
  const localHour = gmtDate.getHours();
  const period = localHour >= 12 ? 'PM' : 'AM';
  const displayHour = localHour === 0 ? 12 : localHour > 12 ? localHour - 12 : localHour;
  
  return `${displayHour} ${period}`;
};

// Convert the 2 AM GMT time to user's local time
const localTime = convertGMTToLocalTime(2);

const scheduleOptions = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 2 * * *', label: `Daily at ${localTime}` },
  { value: '0 2 * * 1', label: `Weekly on Monday at ${localTime}` },
  { value: '0 2 1 * *', label: `Monthly on the 1st at ${localTime}` }
];

const defaultMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'text/plain',
  'text/markdown'
];

const mimeTypeLabels: Record<string, string> = {
  'application/pdf': 'PDF Documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Documents',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheets',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentations',
  'application/vnd.google-apps.document': 'Google Docs',
  'application/vnd.google-apps.spreadsheet': 'Google Sheets',
  'application/vnd.google-apps.presentation': 'Google Slides',
  'text/plain': 'Text Files',
  'text/markdown': 'Markdown Files'
};

const mimeTypeIcons: Record<string, string> = {
  'application/pdf': '/icons/filetypes/pdf.svg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '/icons/filetypes/doc.svg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '/icons/filetypes/xls.svg',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '/icons/filetypes/ppt.svg',
  'application/vnd.google-apps.document': '/icons/filetypes/doc.svg',
  'application/vnd.google-apps.spreadsheet': '/icons/filetypes/xls.svg',
  'application/vnd.google-apps.presentation': '/icons/filetypes/ppt.svg',
  'text/plain': '/icons/filetypes/txt.svg',
  'text/markdown': '/icons/filetypes/file.svg'
};

export default function SyncConfigurationDialog({ connections, onClose, onSyncCreated }: SyncConfigurationDialogProps) {
  const [config, setConfig] = useState<SyncConfig>({
    name: '',
    description: '',
    source_connection_id: connections[0]?.id || '',
    sync_schedule: '0 2 * * *',
    filters: {
      folders: [],
      include_subfolders: true,
      mime_types: defaultMimeTypes,
      exclude_patterns: ['*draft*', '*temp*', '~$*'],
      modified_after: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days ago
    },
    sync_config: {
      incremental_sync: true,
      google_workspace_native: true,
      processing_strategy: 'hybrid'
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Load Google Drive filter configuration from file browser
    const googleDriveFilters = localStorage.getItem('google_drive_filters');
    if (googleDriveFilters) {
      try {
        const filterConfig = JSON.parse(googleDriveFilters);
        setConfig(prev => ({
          ...prev,
          filters: filterConfig // Use the exact structure expected by backend
        }));
        localStorage.removeItem('google_drive_filters');
      } catch (error) {
        console.error('Error parsing Google Drive filters:', error);
      }
    }
  }, []);

  const handleMimeTypeToggle = (mimeType: string) => {
    setConfig(prev => {
      const currentMimeTypes = prev.filters.mime_types || [];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          mime_types: currentMimeTypes.includes(mimeType)
            ? currentMimeTypes.filter(type => type !== mimeType)
            : [...currentMimeTypes, mimeType]
        }
      };
    });
  };

  const createSync = async () => {
    if (!config.name.trim()) {
      toast.error('Please enter a sync name');
      return;
    }

    if (!config.source_connection_id) {
      toast.error('Please select a connection');
      return;
    }

    if (config.filters.folders && config.filters.folders.length === 0 && Object.keys(config.filters).length > 0) {
      toast.error('Please select at least one folder to sync or choose "Sync Entire Drive"');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await clientApiRequestJson('/api/proxy/v1/syncs', {
        method: 'POST',
        body: JSON.stringify(config)
      });

      if (error) {
        toast.error(error.detail || 'Failed to create sync pipeline');
        return;
      }

      onSyncCreated();
    } catch (error) {
      console.error('Error creating sync:', error);
      toast.error('Failed to create sync pipeline');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sync Name *</Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Daily Google Drive Sync"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this sync includes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection">Google Drive Account</Label>
            <Select 
              value={config.source_connection_id} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, source_connection_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div className="flex items-center gap-2">
                      <span>{connection.name}</span>
                      <Badge variant={connection.status === 'active' ? 'default' : 'destructive'}>
                        {connection.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Sync Schedule</Label>
            <Select 
              value={config.sync_schedule} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, sync_schedule: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Selected Folders</h3>
        {config.filters.folders && config.filters.folders.length > 0 ? (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {config.filters.folders.length} folder{config.filters.folders.length !== 1 ? 's' : ''} selected for sync
              {config.filters.include_subfolders && (
                <span className="text-[#A3BC02] ml-2">• Subfolders included</span>
              )}
            </p>
          </div>
        ) : Object.keys(config.filters).length === 0 ? (
          <div className="p-3 bg-[#A3BC02]/10 border border-[#A3BC02]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <p className="text-sm text-[#A3BC02] font-medium">
                Entire Google Drive will be synced
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-orange-800">
                No folders selected. Please use the file browser to select folders first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">File Type Filters</h3>
        <div className="grid grid-cols-1 gap-3">
          {defaultMimeTypes.map((mimeType) => (
            <div key={mimeType} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.filters.mime_types?.includes(mimeType) || false}
                  onChange={() => handleMimeTypeToggle(mimeType)}
                  className="w-4 h-4 text-[#A3BC02] rounded focus:ring-[#A3BC02]"
                />
                <Image 
                  src={mimeTypeIcons[mimeType] || '/icons/filetypes/file.svg'}
                  alt={mimeTypeLabels[mimeType]}
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <span className="text-sm font-medium">{mimeTypeLabels[mimeType]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Exclusion Patterns</h3>
        <div className="space-y-2">
          <Label>Exclude files matching these patterns:</Label>
          <div className="flex flex-wrap gap-2">
            {(config.filters.exclude_patterns || []).map((pattern, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer" 
                     onClick={() => {
                       setConfig(prev => ({
                         ...prev,
                         filters: {
                           ...prev.filters,
                           exclude_patterns: (prev.filters.exclude_patterns || []).filter((_, i) => i !== index)
                         }
                       }));
                     }}>
                {pattern} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add pattern (e.g., *temp*)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !(config.filters.exclude_patterns || []).includes(value)) {
                  setConfig(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      exclude_patterns: [...(prev.filters.exclude_patterns || []), value]
                    }
                  }));
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Date Filter</h3>
        <div className="space-y-2">
          <Label htmlFor="modifiedAfter">Only sync files modified after:</Label>
          <Input
            id="modifiedAfter"
            type="date"
            value={config.filters.modified_after}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              filters: { ...prev.filters, modified_after: e.target.value }
            }))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Performance Options
          </CardTitle>
          <CardDescription>
            Configure sync performance and processing options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Incremental Sync</Label>
              <p className="text-sm text-gray-500">
                Only processes files that have changed since last sync
              </p>
            </div>
            <Switch
              checked={config.sync_config.incremental_sync}
              onCheckedChange={(checked) => setConfig(prev => ({
                ...prev,
                sync_config: { ...prev.sync_config, incremental_sync: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Google Workspace Processing</Label>
              <p className="text-sm text-gray-500">
                Uses native APIs for better structure preservation
              </p>
            </div>
            <Switch
              checked={config.sync_config.google_workspace_native}
              onCheckedChange={(checked) => setConfig(prev => ({
                ...prev,
                sync_config: { ...prev.sync_config, google_workspace_native: checked }
              }))}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Processing Strategy</Label>
            <div className="space-y-2">
              {[
                { value: 'hybrid', label: 'Hybrid', desc: 'Uses native APIs when available, falls back to export' },
                { value: 'native_only', label: 'Native APIs Only', desc: 'Only processes files with native API support' },
                { value: 'export_only', label: 'Export-based Only', desc: 'Uses traditional export-based processing' }
              ].map((strategy) => (
                <div key={strategy.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="processing_strategy"
                    value={strategy.value}
                    checked={config.sync_config.processing_strategy === strategy.value}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      sync_config: { 
                        ...prev.sync_config, 
                        processing_strategy: e.target.value as 'hybrid' | 'native_only' | 'export_only'
                      }
                    }))}
                    className="w-4 h-4 text-[#A3BC02] focus:ring-[#A3BC02]"
                  />
                  <div>
                    <p className="text-sm font-medium">{strategy.label}</p>
                    <p className="text-xs text-gray-500">{strategy.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Folders to sync:</span>
            <span className="text-sm font-medium">{config.filters.folders?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">File types:</span>
            <span className="text-sm font-medium">{config.filters.mime_types?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Schedule:</span>
            <span className="text-sm font-medium">
              {scheduleOptions.find(opt => opt.value === config.sync_schedule)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Incremental sync:</span>
            <span className="text-sm font-medium">
              {config.sync_config.incremental_sync ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure Sync Pipeline
          </DialogTitle>
          <DialogDescription>
            Set up your Google Drive sync pipeline with custom filters and performance options.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step 
                      ? 'bg-[#A3BC02] text-white' 
                      : currentStep > step 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && <div className="w-8 h-px bg-gray-300" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Step {currentStep} of 3
          </div>
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#A3BC02] hover:bg-[#8BA000]"
                disabled={currentStep === 1 && (!config.name.trim() || (config.filters.folders && config.filters.folders.length === 0 && Object.keys(config.filters).length > 0))}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={createSync}
                disabled={isCreating || !config.name.trim() || (config.filters.folders && config.filters.folders.length === 0 && Object.keys(config.filters).length > 0)}
                className="bg-[#A3BC02] hover:bg-[#8BA000]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sync Pipeline'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}