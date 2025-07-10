import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ syncId: string }> }
) {
  try {
    const { syncId } = await params;
    
    const response = await backendApiRequest(`/api/v1/syncs/${syncId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to delete sync',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync delete proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ syncId: string }> }
) {
  try {
    const { syncId } = await params;
    
    const response = await backendApiRequest(`/api/v1/syncs/${syncId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to fetch sync details',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync details proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}