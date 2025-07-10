"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientApiRequest } from '@/lib/client-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleDriveOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors from Google
        if (error) {
          setStatus('error');
          setMessage(`OAuth failed: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');
          return;
        }

        // Verify state matches what we stored
        const storedState = sessionStorage.getItem('oauth_state');
        if (state !== storedState) {
          setStatus('error');
          setMessage('Invalid state parameter - possible CSRF attack');
          return;
        }

        // Clear stored state
        sessionStorage.removeItem('oauth_state');

        // Exchange code for connection
        const response = await clientApiRequest(`/api/proxy/v1/oauth/callback/google_drive?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          console.error('OAuth callback API error:', { 
            status: response.status, 
            statusText: response.statusText,
            errorData 
          });
          throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Store connection ID for future use
        localStorage.setItem('google_drive_connection_id', data.connection_id);
        
        setStatus('success');
        setMessage('Google Drive connected successfully!');
        
        // Redirect to settings after a short delay
        setTimeout(() => {
          router.push('/settings?tab=integrations');
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/settings?tab=integrations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fafbf9] to-[#f0f7e8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            
            {status === 'loading' && 'Connecting Google Drive...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your Google Drive connection...'}
            {status === 'success' && 'You will be redirected shortly.'}
            {status === 'error' && 'There was a problem connecting your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <Button onClick={handleRetry} variant="outline" className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}