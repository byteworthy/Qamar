import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "noor_tooltip_seen_";

/**
 * Track whether a first-time tooltip has been shown.
 * Returns shouldShow=true until the user dismisses it.
 */
export function useTooltip(tooltipId: string) {
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(`${KEY_PREFIX}${tooltipId}`)
      .then((seen) => {
        setShouldShow(seen !== "true");
      })
      .catch(() => {
        setShouldShow(false);
      })
      .finally(() => setLoading(false));
  }, [tooltipId]);

  const dismiss = useCallback(async () => {
    try {
      await AsyncStorage.setItem(`${KEY_PREFIX}${tooltipId}`, "true");
    } catch {
      // ignore
    }
    setShouldShow(false);
  }, [tooltipId]);

  return {
    shouldShow: shouldShow && !loading,
    dismiss,
  };
}
