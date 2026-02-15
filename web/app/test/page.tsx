'use client';

import { useQuery } from '@tanstack/react-query';
import { healthCheck } from '@/lib/api';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

function TestPageContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-8">
          Backend Connection Test
        </h1>

        <div className="bg-background-card p-6 rounded-xl border border-background-card-light">
          <h2 className="font-semibold text-xl mb-4">Health Check</h2>

          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gold rounded-full animate-pulse"></div>
              <span className="text-moonlight-dim">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm mt-1">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald rounded-full"></div>
                <span className="text-emerald font-semibold">Connected</span>
              </div>

              <pre className="bg-background p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>

              <div className="pt-4 border-t border-background-card-light">
                <h3 className="font-semibold mb-2">Session Cookie Check</h3>
                <p className="text-moonlight-dim text-sm">
                  Check browser DevTools → Application → Cookies for <code className="bg-background px-1 py-0.5 rounded">noor_session</code>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-moonlight-muted text-sm">
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
          <p className="mt-1">
            This page tests connectivity with credentials: 'include' for session cookies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestPageContent />
    </QueryClientProvider>
  );
}
