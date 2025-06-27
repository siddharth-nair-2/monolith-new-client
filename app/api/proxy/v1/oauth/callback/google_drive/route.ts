import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code || !state) {
      return NextResponse.json(
        { detail: 'Missing code or state parameter' },
        { status: 400 }
      );
    }
    
    // Forward the request to backend with query parameters
    const backendUrl = `/api/v1/oauth/callback/google_drive?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    const response = await backendApiRequest(backendUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to complete OAuth callback',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth callback proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}