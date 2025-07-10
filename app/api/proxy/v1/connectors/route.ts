import { NextRequest, NextResponse } from 'next/server';
import { proxyApiRequest } from '@/lib/api-client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/connectors${queryString ? `?${queryString}` : ''}`;

    console.log('Proxy request to:', endpoint);
    console.log('Request cookies:', request.headers.get('cookie'));
    
    const response = await proxyApiRequest(endpoint, request, {
      method: 'GET',
    });
    
    console.log('Backend response status:', response.status);

    // Handle token refresh
    const newAccessToken = response.headers.get('X-New-Access-Token');
    const newRefreshToken = response.headers.get('X-New-Refresh-Token');
    
    if (newAccessToken && newRefreshToken) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
      cookieStore.set("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to fetch connectors',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Connectors proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}