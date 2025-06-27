import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  try {
    const { connectionId } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/google-drive/browse/${connectionId}${queryString ? `?${queryString}` : ''}`;

    const response = await backendApiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to browse Google Drive',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Drive browse proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}