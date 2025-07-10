"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults((prev) => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testAuthMe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      addResult("GET /api/auth/me", {
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      addResult("GET /api/auth/me", { error: error.message });
    }
    setLoading(false);
  };

  const testRefreshToken = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      });
      const data = await response.json();
      addResult("POST /api/auth/refresh", {
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (error) {
      addResult("POST /api/auth/refresh", { error: error.message });
    }
    setLoading(false);
  };

  const testProtectedEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      addResult("GET /api/documents (Protected)", {
        status: response.status,
        ok: response.ok,
        data: data.items ? `${data.items.length} documents` : data,
      });
    } catch (error) {
      addResult("GET /api/documents (Protected)", { error: error.message });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Auth Token Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testAuthMe} disabled={loading}>
                Test /api/auth/me
              </Button>
              <Button onClick={testRefreshToken} disabled={loading}>
                Test Token Refresh
              </Button>
              <Button onClick={testProtectedEndpoint} disabled={loading}>
                Test Protected Endpoint
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {results.length === 0 ? (
                <p className="text-muted-foreground">No test results yet. Click a button to test.</p>
              ) : (
                results.map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{result.test}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs overflow-x-auto bg-muted p-3 rounded">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}