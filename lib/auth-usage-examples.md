# Authentication System Usage Guide

## Overview
The new authentication system provides centralized token management with automatic refresh, preventing "Already Used" refresh token errors and ensuring seamless user experience.

## Key Features
- **Automatic Token Refresh**: Tokens refresh 5 minutes before expiration
- **Concurrent Request Handling**: Prevents multiple simultaneous refresh attempts
- **Request Queuing**: Queues requests during token refresh
- **Proactive Management**: Refreshes tokens when app becomes active

## Usage in Components

### Client Components

```typescript
// Use the auth hook in client components
"use client";

import { useAuth } from '@/lib/auth-context';
import { clientApiRequest, clientApiRequestJson } from '@/lib/client-api';

export function MyClientComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  const fetchData = async () => {
    // The client API automatically handles auth
    const { data, error } = await clientApiRequestJson('/api/documents');
    
    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }
    
    // Use data
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Server Components

```typescript
// Use the auth-aware API client in server components
import { authApiRequest, authApiRequestJson } from '@/lib/auth-api-client';

export default async function MyServerComponent() {
  // The auth API client automatically handles tokens
  const { data, error } = await authApiRequestJson(
    `${process.env.FASTAPI_BASE_URL}/api/v1/documents`
  );

  if (error) {
    return <div>Error loading documents</div>;
  }

  return (
    <div>
      {data.documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

### API Routes

```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';
import { backendAuthApiRequest } from '@/lib/auth-api-client';

export async function GET() {
  try {
    // Automatically includes auth headers
    const response = await backendAuthApiRequest('/api/v1/some-endpoint');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Token Lifecycle

1. **Login**: User logs in, receives 1-hour access token and 30-day refresh token
2. **Active Use**: Tokens refresh automatically 5 minutes before expiration
3. **Inactive Tab**: When tab becomes active, checks if refresh is needed
4. **API Calls**: All 401 responses trigger automatic refresh (with mutex)
5. **Logout**: Clears all tokens and redirects to login

## Migration from Old System

Replace old API calls:

```typescript
// Old way (prone to refresh token reuse)
const response = await fetch('/api/documents', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// New way (automatic token management)
const { data, error } = await clientApiRequestJson('/api/documents');
```

## Troubleshooting

- **Still getting 401 errors**: Ensure you're using the new API clients
- **Redirect loops**: Check that auth pages are in the public routes list
- **Token not refreshing**: Verify AuthProvider is wrapped around your app