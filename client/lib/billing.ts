import { apiRequest, getApiUrl } from "./query-client";

// Billing status state machine - normalized values only
export interface BillingStatus {
  status: "free" | "active" | "past_due" | "canceled";
  planName: string;
}

export interface BillingConfig {
  publishableKey: string;
  priceId: string;
}

export interface ReflectionLimit {
  canReflect: boolean;
  remaining: number | null;
  isPaid: boolean;
}

// All billing requests use credentials: 'include' to send the session cookie.
// The server derives user identity from the signed session cookie, NOT from request body.

export async function getBillingStatus(): Promise<BillingStatus> {
  const url = new URL("/api/billing/status", getApiUrl());

  const response = await fetch(url.toString(), {
    credentials: "include",
  });
  if (!response.ok) {
    return { status: "free", planName: "Free" };
  }
  return response.json();
}

export async function getBillingConfig(): Promise<BillingConfig> {
  const url = new URL("/api/billing/config", getApiUrl());
  const response = await fetch(url.toString(), {
    credentials: "include",
  });
  return response.json();
}

// SECURITY: Only email is sent to the server.
// userId is derived from the server-side session cookie.
export async function createCheckoutSession(
  email: string,
): Promise<{ checkoutUrl: string }> {
  const response = await apiRequest(
    "POST",
    "/api/billing/create-checkout-session",
    {
      email,
    },
  );

  return response.json();
}

// SECURITY: No client-supplied identity.
// userId is derived from the server-side session cookie.
export async function createPortalSession(): Promise<{ portalUrl: string }> {
  const response = await apiRequest(
    "POST",
    "/api/billing/create-portal-session",
    {},
  );

  return response.json();
}

export async function checkReflectionLimit(): Promise<ReflectionLimit> {
  const url = new URL("/api/reflection/can-reflect", getApiUrl());

  const response = await fetch(url.toString(), {
    credentials: "include",
  });
  if (!response.ok) {
    return { canReflect: true, remaining: 1, isPaid: false };
  }
  return response.json();
}

export async function saveReflection(data: {
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
}): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    const response = await apiRequest("POST", "/api/reflection/save", data);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error, code: error.code };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReflectionHistory(): Promise<{
  history: any[];
  isLimited: boolean;
  limit: number | null;
}> {
  const url = new URL("/api/reflection/history", getApiUrl());

  const response = await fetch(url.toString(), {
    credentials: "include",
  });
  if (!response.ok) {
    return { history: [], isLimited: true, limit: 3 };
  }
  return response.json();
}

export function isPaidStatus(status: string): boolean {
  // Only 'active' and 'past_due' are treated as paid (past_due is grace period)
  return status === "active" || status === "past_due";
}

export async function syncBillingStatus(): Promise<BillingStatus> {
  const response = await apiRequest("POST", "/api/billing/sync", {});

  if (!response.ok) {
    return { status: "free", planName: "Free" };
  }
  return response.json();
}
