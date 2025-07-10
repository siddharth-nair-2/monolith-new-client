import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/connections/${queryString ? `?${queryString}` : ''}`;

    const response = await backendApiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to fetch connections',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Connections proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}