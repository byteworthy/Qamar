import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = true;

function getMockPrayerTimes(): DailyPrayerTimes {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const prayers: PrayerTime[] = [
    { name: "Fajr", time: `${today}T05:30:00`, isNext: false },
    { name: "Dhuhr", time: `${today}T12:15:00`, isNext: false },
    { name: "Asr", time: `${today}T15:30:00`, isNext: false },
    { name: "Maghrib", time: `${today}T18:05:00`, isNext: false },
    { name: "Isha", time: `${today}T19:30:00`, isNext: false },
  ];

  // Mark next prayer
  const currentHour = now.getHours() * 60 + now.getMinutes();
  const prayerMinutes = [330, 735, 930, 1085, 1170];
  let nextIdx = prayerMinutes.findIndex((m) => m > currentHour);
  if (nextIdx === -1) nextIdx = 0;
  prayers[nextIdx].isNext = true;

  return {
    date: today,
    location: "New York, NY",
    method: "ISNA",
    prayers,
    sunrise: `${today}T06:45:00`,
  };
}

const MOCK_PREFERENCES: PrayerPreferences = {
  calculationMethod: "isna",
  asrMethod: "standard",
  highLatitudeRule: "middle-of-night",
  adjustments: {},
};

const MOCK_LOGS: PrayerLog[] = [];

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchPrayerTimes(
  latitude?: number,
  longitude?: number
): Promise<DailyPrayerTimes> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 400));
    return getMockPrayerTimes();
  }

  const params = new URLSearchParams();
  if (latitude) params.set("lat", String(latitude));
  if (longitude) params.set("lng", String(longitude));

  const response = await fetch(`/api/prayer/times?${params}`);
  if (!response.ok) throw new Error("Failed to fetch prayer times");
  return response.json();
}

async function fetchPreferences(): Promise<PrayerPreferences> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_PREFERENCES;
  }

  const response = await fetch("/api/prayer/preferences");
  if (!response.ok) throw new Error("Failed to fetch prayer preferences");
  return response.json();
}

async function updatePreferences(
  prefs: Partial<PrayerPreferences>
): Promise<PrayerPreferences> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300));
    Object.assign(MOCK_PREFERENCES, prefs);
    return MOCK_PREFERENCES;
  }

  const response = await fetch("/api/prayer/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
  if (!response.ok) throw new Error("Failed to update preferences");
  return response.json();
}

async function logPrayer(prayer: string, onTime: boolean): Promise<PrayerLog> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 200));
    const log: PrayerLog = {
      id: `log-${Date.now()}`,
      prayer,
      date: new Date().toISOString().split("T")[0],
      completedAt: new Date().toISOString(),
      onTime,
    };
    MOCK_LOGS.push(log);
    return log;
  }

  const response = await fetch("/api/prayer/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prayer, onTime }),
  });
  if (!response.ok) throw new Error("Failed to log prayer");
  return response.json();
}

// ============================================================================
// HOOKS
// ============================================================================

export function usePrayerTimes(latitude?: number, longitude?: number) {
  return useQuery({
    queryKey: ["prayer", "times", latitude, longitude],
    queryFn: () => fetchPrayerTimes(latitude, longitude),
    staleTime: 1000 * 60 * 30, // 30 min - recalculate periodically
    refetchInterval: 1000 * 60 * 5, // refresh every 5 min for "next prayer"
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
