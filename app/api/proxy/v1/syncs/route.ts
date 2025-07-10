import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/syncs/${queryString ? `?${queryString}` : ''}`;

    const response = await backendApiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to fetch syncs',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Syncs list proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await proxyApiRequest('/api/v1/syncs/', request, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

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
        detail: 'Failed to create sync',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Syncs create proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}