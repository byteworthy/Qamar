import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatPrayerTime,
  formatCountdown,
  type PrayerTimesResult,
} from "../services/prayerTimes";

// ============================================================================
// TYPES
// ============================================================================

export interface PrayerTime {
  name: string;
  time: string; // ISO time string
  isNext: boolean;
}

export interface DailyPrayerTimes {
  date: string;
  location: string;
  method: string;
  prayers: PrayerTime[];
  sunrise: string;
}

export interface PrayerPreferences {
  calculationMethod: CalculationMethod;
  asrMethod: "standard" | "hanafi";
  highLatitudeRule: "middle-of-night" | "seventh-of-night" | "twilight-angle";
  adjustments: Record<string, number>;
}

export type CalculationMethod =
  | "muslim-world-league"
  | "egyptian"
  | "karachi"
  | "umm-al-qura"
  | "dubai"
  | "moonsighting-committee"
  | "isna"
  | "kuwait"
  | "qatar"
  | "singapore"
  | "turkey"
  | "tehran"
  | "north-america";

export interface PrayerLog {
  id: string;
  prayer: string;
  date: string;
  completedAt: string;
  onTime: boolean;
}

// ============================================================================
// METHOD MAPPING - hook CalculationMethod IDs → adhan method IDs
// ============================================================================

const METHOD_MAP: Record<CalculationMethod, string> = {
  "muslim-world-league": "MuslimWorldLeague",
  egyptian: "Egyptian",
  karachi: "Karachi",
  "umm-al-qura": "UmmAlQura",
  dubai: "Dubai",
  "moonsighting-committee": "MuslimWorldLeague", // fallback
  isna: "NorthAmerica",
  kuwait: "Kuwait",
  qatar: "Qatar",
  singapore: "Singapore",
  turkey: "Turkey",
  tehran: "Tehran",
  "north-america": "NorthAmerica",
};

// ============================================================================
// LOCATION HOOK
// ============================================================================

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          // Default to Mecca
          setLocation({
            latitude: 21.4225,
            longitude: 39.8262,
            name: "Makkah",
          });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const name = geo
          ? `${geo.city || geo.region || ""}, ${geo.country || ""}`
          : `${loc.coords.latitude.toFixed(2)}, ${loc.coords.longitude.toFixed(2)}`;
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          name: name.replace(/^, /, ""),
        });
      } catch (e) {
        setError("Failed to get location");
        setLocation({ latitude: 21.4225, longitude: 39.8262, name: "Makkah" });
      }
    })();
  }, []);

  return { location, error };
}

// ============================================================================
// API FUNCTIONS - Now using real adhan library
// ============================================================================

function buildDailyPrayerTimes(
  latitude: number,
  longitude: number,
  locationName: string,
  methodId?: string,
  madhabId?: string,
): DailyPrayerTimes {
  const now = new Date();
  const result = calculatePrayerTimes(
    latitude,
    longitude,
    now,
    methodId,
    madhabId,
  );
  const next = getNextPrayer(result);

  const prayers: PrayerTime[] = [
    {
      name: "Fajr",
      time: result.fajr.toISOString(),
      isNext: next.name === "Fajr",
    },
    {
      name: "Dhuhr",
      time: result.dhuhr.toISOString(),
      isNext: next.name === "Dhuhr",
    },
    {
      name: "Asr",
      time: result.asr.toISOString(),
      isNext: next.name === "Asr",
    },
    {
      name: "Maghrib",
      time: result.maghrib.toISOString(),
      isNext: next.name === "Maghrib",
    },
    {
      name: "Isha",
      time: result.isha.toISOString(),
      isNext: next.name === "Isha",
    },
  ];

  return {
    date: now.toISOString().split("T")[0],
    location: locationName,
    method: methodId || "NorthAmerica",
    prayers,
    sunrise: result.sunrise.toISOString(),
  };
}

async function fetchPrayerTimes(
  latitude?: number,
  longitude?: number,
  locationName?: string,
  methodId?: string,
  madhabId?: string,
): Promise<DailyPrayerTimes> {
  // Use adhan library for client-side calculation (no network needed)
  const lat = latitude || 21.4225;
  const lng = longitude || 39.8262;
  return buildDailyPrayerTimes(
    lat,
    lng,
    locationName || "Unknown",
    methodId,
    madhabId,
  );
}

async function fetchPreferences(): Promise<PrayerPreferences> {
  // Try server, fall back to defaults
  try {
    const response = await fetch("/api/prayer/preferences");
    if (response.ok) {
      const data = await response.json();
      return data.preferences;
    }
  } catch {
    // Offline - use defaults
  }

  return {
    calculationMethod: "north-america",
    asrMethod: "standard",
    highLatitudeRule: "middle-of-night",
    adjustments: {},
  };
}

async function updatePreferences(
  prefs: Partial<PrayerPreferences>,
): Promise<PrayerPreferences> {
  try {
    const response = await fetch("/api/prayer/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (response.ok) {
      const data = await response.json();
      return data.preferences;
    }
  } catch {
    // Offline - just return merged prefs
  }

  return {
    calculationMethod: "north-america",
    asrMethod: "standard",
    highLatitudeRule: "middle-of-night",
    adjustments: {},
    ...prefs,
  } as PrayerPreferences;
}

async function logPrayer(prayer: string, onTime: boolean): Promise<PrayerLog> {
  const log: PrayerLog = {
    id: `log-${Date.now()}`,
    prayer,
    date: new Date().toISOString().split("T")[0],
    completedAt: new Date().toISOString(),
    onTime,
  };

  try {
    const response = await fetch("/api/prayer/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerName: prayer, onTime }),
    });
    if (response.ok) return log;
  } catch {
    // Offline - still return the log for local tracking
  }

  return log;
}

// ============================================================================
// HOOKS
// ============================================================================

export function usePrayerTimes(latitude?: number, longitude?: number) {
  const { location } = useLocation();
  const lat = latitude || location?.latitude;
  const lng = longitude || location?.longitude;
  const name = location?.name || "Loading...";

  return useQuery({
    queryKey: ["prayer", "times", lat, lng],
    queryFn: () => fetchPrayerTimes(lat, lng, name),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 1000 * 60 * 30, // 30 min - recalculate periodically
    refetchInterval: 1000 * 60 * 1, // refresh every 1 min for "next prayer" accuracy
  });
}

export function usePrayerPreferences() {
  return useQuery({
    queryKey: ["prayer", "preferences"],
    queryFn: fetchPreferences,
    staleTime: 1000 * 60 * 60,
  });
}

export function useUpdatePrayerPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<PrayerPreferences>) => updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer"] });
    },
  });
}

export function useLogPrayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prayer, onTime }: { prayer: string; onTime: boolean }) =>
      logPrayer(prayer, onTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer", "logs"] });
    },
  });
}

// Re-export utilities for screens to use
export { formatPrayerTime, formatCountdown, getNextPrayer };
