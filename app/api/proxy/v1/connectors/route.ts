import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/connectors/${queryString ? `?${queryString}` : ''}`;

    console.log('Proxy request to:', endpoint);
    console.log('Request cookies:', request.headers.get('cookie'));
    
    const response = await backendApiRequest(endpoint, {
      method: 'GET',
    });
    
    console.log('Backend response status:', response.status);

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