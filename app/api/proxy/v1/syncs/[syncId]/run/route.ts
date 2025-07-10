import { NextRequest, NextResponse } from 'next/server';
import { backendApiRequest } from '@/lib/api-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ syncId: string }> }
) {
  try {
    const { syncId } = await params;
    const response = await backendApiRequest(`/api/v1/syncs/${syncId}/run`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to run sync',
      }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sync run proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}