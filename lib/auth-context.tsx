"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tenant_id: string;
  role: string;
}

interface JWTPayload {
  exp: number;
  iat: number;
  sub?: string;
  [key: string]: any;
}

interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  
  // Token management
  getAccessToken: () => Promise<string | null>;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  
  // Utilities
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Singleton promise for token refresh to prevent concurrent refreshes
let refreshPromise: Promise<boolean> | null = null;

// Helper function to extract expiration from JWT
function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Timer for proactive refresh
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tokenExpiresAtRef = useRef<Date | null>(null);
  
  // Prevent multiple simultaneous auth checks
  const authCheckInProgressRef = useRef(false);
  const mountedRef = useRef(false);

  // Clear refresh timer
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // Set up proactive token refresh
  const setupRefreshTimer = (expiresAt: Date) => {
    clearRefreshTimer();
    
    const now = new Date();
    const expiresTime = expiresAt.getTime();
    const nowTime = now.getTime();
    
    // Refresh 5 minutes before expiration
    const refreshTime = expiresTime - (5 * 60 * 1000);
    const timeUntilRefresh = refreshTime - nowTime;
    
    if (timeUntilRefresh > 0) {
      refreshTimerRef.current = setTimeout(async () => {
        await refreshTokens();
      }, timeUntilRefresh);
    }
  };

  // Get access token (checks expiration and refreshes if needed)
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // Check if we need to refresh based on expiration time
      if (tokenExpiresAtRef.current) {
        const now = new Date();
        const expiresAt = tokenExpiresAtRef.current;
        
        // If token expires in less than 1 minute, refresh now
        if (expiresAt.getTime() - now.getTime() < 60 * 1000) {
          const refreshed = await refreshTokens();
          if (!refreshed) {
            return null;
          }
        }
      }
      
      // Get current token from cookie via API endpoint
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.access_token || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, []);

  // Refresh tokens with mutex to prevent concurrent refreshes
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      return await refreshPromise;
    }
    
    // Create new refresh promise
    refreshPromise = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update expiration time
          if (data.expires_at) {
            tokenExpiresAtRef.current = new Date(data.expires_at);
            setupRefreshTimer(tokenExpiresAtRef.current);
          }
          
          return true;
        } else {
          console.error('Token refresh failed:', response.status);
          
          // Clear auth state on refresh failure
          setIsAuthenticated(false);
          setUser(null);
          clearRefreshTimer();
          
          // Only redirect to login if it's a permanent auth failure
          if (response.status === 401) {
            router.push('/login');
          }
          
          return false;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        return false;
      } finally {
        // Clear the refresh promise
        refreshPromise = null;
      }
    })();
    
    return await refreshPromise;
  }, [router]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Set user data
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Extract expiration from JWT or use provided expires_at
      const expiresAt = data.expires_at ? new Date(data.expires_at) : new Date(Date.now() + 60 * 60 * 1000); // 1 hour fallback
      tokenExpiresAtRef.current = expiresAt;
      setupRefreshTimer(expiresAt);
      
      // Redirect based on new company status
      if (data.is_new_company) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local state
    setIsAuthenticated(false);
    setUser(null);
    clearRefreshTimer();
    tokenExpiresAtRef.current = null;
    
    // Redirect to login
    router.push('/login');
  }, [router]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgressRef.current || !mountedRef.current) {
      return;
    }
    
    authCheckInProgressRef.current = true;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!mountedRef.current) return; // Component unmounted during fetch
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Set up token expiration - try to extract from JWT if available
        let expiresAt: Date;
        if (data.access_token) {
          expiresAt = getTokenExpiration(data.access_token) || new Date(Date.now() + 60 * 60 * 1000);
        } else {
          expiresAt = data.expires_at ? new Date(data.expires_at) : new Date(Date.now() + 60 * 60 * 1000);
        }
        tokenExpiresAtRef.current = expiresAt;
        setupRefreshTimer(expiresAt);
      } else if (response.status === 401) {
        // Don't log error for 401 - it's expected when not authenticated
        setIsAuthenticated(false);
        setUser(null);
        clearRefreshTimer();
      } else {
        console.warn('Auth check failed:', response.status, response.statusText);
        setIsAuthenticated(false);
        setUser(null);
        clearRefreshTimer();
      }
    } catch (error) {
      if (!mountedRef.current) return; // Component unmounted during error
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      clearRefreshTimer();
    } finally {
      authCheckInProgressRef.current = false;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Track mounted state and initial auth check
  useEffect(() => {
    mountedRef.current = true;
    checkAuth();
    
    return () => {
      mountedRef.current = false;
      clearRefreshTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle visibility change - refresh if needed when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && tokenExpiresAtRef.current) {
        const now = new Date();
        const expiresAt = tokenExpiresAtRef.current;
        
        // If token expires in less than 5 minutes, refresh now
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
          refreshTokens();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshTokens]);

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user,
    getAccessToken,
    login,
    logout,
    refreshTokens,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}