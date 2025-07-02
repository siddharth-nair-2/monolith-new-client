"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { clientApiRequestJson } from "./client-api";

interface Connector {
  id: string;
  name: string;
  short_name: string;
  auth_type: string;
  description?: string;
  labels: string[];
  config_schema?: any;
  is_active: boolean;
}

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

interface SyncJob {
  id: string;
  status: "running" | "success" | "failed" | "pending";
  started_at?: string;
  completed_at?: string;
  documents_processed: number;
  documents_added: number;
  documents_updated: number;
  documents_failed: number;
  error_message?: string;
  metadata?: {
    trigger_type: "manual" | "scheduled";
    sync_strategy: "incremental" | "full";
    triggered_by?: string;
  };
}

interface SyncPipeline {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "running";
  source_connection_id?: string; // Keep for backward compatibility
  source_connection?: {
    id: string;
    name: string;
    connector_role: string;
  };
  sync_schedule: string;
  last_run_at?: string;
  next_scheduled_run?: string;
  latest_job?: {
    id: string;
    status: "running" | "success" | "failed";
    created_at: string;
  };
  stats?: {
    total_jobs: number;
    successful_jobs: number;
    success_rate: number;
  };
}

interface IntegrationsContextValue {
  // Available connectors
  availableConnectors: Connector[];
  isGoogleDriveAvailable: boolean;

  // Connections
  connections: Connection[];
  googleDriveConnections: Connection[];
  isGoogleDriveConnected: boolean;

  // Syncs
  syncs: SyncPipeline[];
  googleDriveSyncs: SyncPipeline[];
  hasActiveSync: boolean;

  // Loading states
  isLoading: boolean;

  // Actions
  refreshConnectors: () => Promise<void>;
  refreshConnections: () => Promise<void>;
  refreshSyncs: () => Promise<void>;
}

const IntegrationsContext = createContext<IntegrationsContextValue | undefined>(
  undefined
);

export function IntegrationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [availableConnectors, setAvailableConnectors] = useState<Connector[]>(
    []
  );
  const [connections, setConnections] = useState<Connection[]>([]);
  const [syncs, setSyncs] = useState<SyncPipeline[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshConnectors = useCallback(async () => {
    try {
      const { data, error, ok } = await clientApiRequestJson(
        "/api/proxy/v1/connectors"
      );

      if (!error && data) {
        // API returns array directly, not wrapped in { connectors: [...] }
        const connectors = Array.isArray(data) ? data : [];
        setAvailableConnectors(connectors);
      } else {
        console.error("Failed to fetch connectors:", error);
      }
    } catch (error) {
      console.error("Error refreshing connectors:", error);
    }
  }, []);

  const refreshConnections = useCallback(async () => {
    try {
      const { data, error } = await clientApiRequestJson(
        "/api/proxy/v1/connections"
      );

      if (!error && data) {
        // API returns array directly, not wrapped in { connections: [...] }
        setConnections(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error refreshing connections:", error);
    }
  }, []);

  const refreshSyncs = useCallback(async () => {
    try {
      const { data, error } = await clientApiRequestJson("/api/proxy/v1/syncs");

      if (!error && data) {
        // API returns array directly, not wrapped in { syncs: [...] }
        setSyncs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error refreshing syncs:", error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshConnectors();
      await refreshConnections();
      await refreshSyncs();
    } finally {
      setIsLoading(false);
    }
  }, [refreshConnectors, refreshConnections, refreshSyncs]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Derived state
  const isGoogleDriveAvailable = availableConnectors.some(
    (connector) =>
      connector.short_name === "google_drive" &&
      connector.is_active
  );

  const googleDriveConnections = connections.filter(
    (conn) => conn.connector_type === "google_drive"
  );

  const isGoogleDriveConnected = googleDriveConnections.some(
    (conn) => conn.status === "active"
  );

  const googleDriveSyncs = syncs.filter((sync) => {
    // Handle both source_connection (nested object) and source_connection_id (string)
    const connectionId =
      sync.source_connection?.id || sync.source_connection_id;
    return googleDriveConnections.some((conn) => conn.id === connectionId) && sync.status !== 'deleted';
  });

  const hasActiveSync = googleDriveSyncs.some(
    (sync) => sync.status === "running"
  );

  const value: IntegrationsContextValue = {
    availableConnectors,
    isGoogleDriveAvailable,
    connections,
    googleDriveConnections,
    isGoogleDriveConnected,
    syncs,
    googleDriveSyncs,
    hasActiveSync,
    isLoading,
    refreshConnectors,
    refreshConnections,
    refreshSyncs,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error(
      "useIntegrations must be used within an IntegrationsProvider"
    );
  }
  return context;
}

// Export types for use in other components
export type { SyncJob, SyncPipeline, Connection, Connector };
