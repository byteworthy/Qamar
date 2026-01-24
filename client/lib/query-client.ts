import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  let url = new URL(`https://${host}`);

  return url.href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;

    // Classify error type for better error messages
    if (res.status >= 500) {
      throw new Error(`SERVER_ERROR:${res.status}: ${text}`);
    } else if (res.status === 408 || res.status === 504) {
      throw new Error(`TIMEOUT:${res.status}: ${text}`);
    } else if (res.status === 401) {
      throw new Error(`AUTH_ERROR:${res.status}: ${text}`);
    } else {
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Network errors (no response received)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("NETWORK_ERROR: Couldn't connect. Check your internet.");
    }
    // Re-throw other errors
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Network errors: retry up to 3 times
        if (
          error.message?.includes("NETWORK_ERROR") ||
          error.message?.includes("TIMEOUT")
        ) {
          return failureCount < 3;
        }
        // Server errors (500+): retry once (might be transient)
        if (error.message?.includes("SERVER_ERROR")) {
          return failureCount < 1;
        }
        // Client errors (4xx): don't retry (user input issue)
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
    },
    mutations: {
      retry: (failureCount, error) => {
        // Network errors: retry up to 3 times
        if (
          error.message?.includes("NETWORK_ERROR") ||
          error.message?.includes("TIMEOUT")
        ) {
          return failureCount < 3;
        }
        // Server errors: retry once
        if (error.message?.includes("SERVER_ERROR")) {
          return failureCount < 1;
        }
        // Don't retry client errors
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
