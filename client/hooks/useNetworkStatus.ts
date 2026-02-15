/**
 * Lightweight network status hook.
 *
 * Uses a periodic HEAD request to detect connectivity rather than adding
 * a native dependency like @react-native-community/netinfo.
 * Updates the Zustand store's `offline.isOffline` flag so other parts of
 * the app (e.g. useOfflineMutation) can react accordingly.
 */

import { useEffect, useRef } from "react";
import { AppState as RNAppState, Platform } from "react-native";
import { useAppState } from "../stores/app-state";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const PING_TIMEOUT_MS = 5_000;

/**
 * Attempts a lightweight fetch to determine connectivity.
 * Uses a well-known, fast endpoint. On web, falls back to navigator.onLine
 * as a first check.
 */
async function checkConnectivity(): Promise<boolean> {
  // Quick check on web
  if (Platform.OS === "web" && typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    // Use a small, reliable endpoint. Google's generate_204 is commonly used.
    await fetch("https://clients3.google.com/generate_204", {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

/**
 * Call once at app root level. Periodically checks connectivity and
 * updates `useAppState.offline.isOffline`.
 */
export function useNetworkStatus() {
  const setOfflineStatus = useAppState((s) => s.setOfflineStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = async () => {
      const isConnected = await checkConnectivity();
      setOfflineStatus(!isConnected);
    };

    // Check immediately on mount
    update();

    // Poll on interval
    intervalRef.current = setInterval(update, POLL_INTERVAL_MS);

    // Also check when app comes back to foreground
    const subscription = RNAppState.addEventListener("change", (state) => {
      if (state === "active") {
        update();
      }
    });

    // On web, listen to online/offline events for instant feedback
    const handleOnline = () => setOfflineStatus(false);
    const handleOffline = () => setOfflineStatus(true);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [setOfflineStatus]);
}
