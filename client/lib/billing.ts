import { apiRequest, getApiUrl } from "./query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "noor_user_id";

export async function getUserId(): Promise<string> {
  let userId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export interface BillingStatus {
  status: "free" | "active" | "canceled" | "past_due" | "trialing";
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

export async function getBillingStatus(): Promise<BillingStatus> {
  const userId = await getUserId();
  const url = new URL("/api/billing/status", getApiUrl());
  url.searchParams.set("userId", userId);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    return { status: "free", planName: "Free" };
  }
  return response.json();
}

export async function getBillingConfig(): Promise<BillingConfig> {
  const url = new URL("/api/billing/config", getApiUrl());
  const response = await fetch(url.toString());
  return response.json();
}

export async function createCheckoutSession(email: string): Promise<{ checkoutUrl: string }> {
  const userId = await getUserId();
  const config = await getBillingConfig();
  
  const response = await apiRequest("POST", "/api/billing/create-checkout-session", {
    userId,
    email,
    priceId: config.priceId,
  });
  
  return response.json();
}

export async function createPortalSession(): Promise<{ portalUrl: string }> {
  const userId = await getUserId();
  
  const response = await apiRequest("POST", "/api/billing/create-portal-session", {
    userId,
  });
  
  return response.json();
}

export async function checkReflectionLimit(): Promise<ReflectionLimit> {
  const userId = await getUserId();
  const url = new URL("/api/reflection/can-reflect", getApiUrl());
  url.searchParams.set("userId", userId);
  
  const response = await fetch(url.toString());
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
  const userId = await getUserId();
  
  try {
    const response = await apiRequest("POST", "/api/reflection/save", {
      userId,
      ...data,
    });
    
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
  const userId = await getUserId();
  const url = new URL("/api/reflection/history", getApiUrl());
  url.searchParams.set("userId", userId);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    return { history: [], isLimited: true, limit: 3 };
  }
  return response.json();
}

export function isPaidStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}
