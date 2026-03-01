import { Feather } from "@expo/vector-icons";

export const USER_NAME_KEY = "@qamar_user_name";
export const JOURNEY_STATS_KEY = "@qamar_journey_stats";
export const REFLECTIONS_KEY = "@qamar_reflections";

// Journey tracking data
export interface JourneyStats {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  lastReflectionDate: string | null;
  topDistortions: string[];
  favoriteAnchors: string[];
}

// Saved reflection preview (for recent reflections on home)
export interface ReflectionPreview {
  id: string;
  thought: string;
  reframe: string;
  anchor: string;
  date: string; // ISO string
  distortions: string[];
}

// Quick action definition
export interface QuickAction {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  route: string;
  color: string;
}

/**
 * Get Islamic greeting based on time of day
 */
export function getIslamicGreeting(): {
  greeting: string;
  timeMessage: string;
} {
  const hour = new Date().getHours();

  if (hour >= 3 && hour < 6) {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage: "Blessed Fajr time — the world is quiet, and Allah is near.",
    };
  } else if (hour >= 6 && hour < 12) {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage: "A new morning — fresh blessings await, in sha Allah.",
    };
  } else if (hour >= 12 && hour < 15) {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage: "Midday peace — pause, breathe, and remember.",
    };
  } else if (hour >= 15 && hour < 18) {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage:
        "The afternoon light fades gently — reflect on your blessings.",
    };
  } else if (hour >= 18 && hour < 21) {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage: "As the sun sets, let gratitude settle in your heart.",
    };
  } else {
    return {
      greeting: "As-salamu Alaykum",
      timeMessage: "The night is a garment of rest — trust and surrender.",
    };
  }
}

/**
 * Convert Gregorian date to approximate Hijri date
 * Uses the Umm al-Qura approximation algorithm
 */
export function getHijriDate(date: Date = new Date()): string {
  const HIJRI_MONTHS = [
    "Muharram",
    "Safar",
    "Rabi al-Awwal",
    "Rabi al-Thani",
    "Jumada al-Ula",
    "Jumada al-Thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ];

  // Julian Day Number calculation
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const jd =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4,
    ) +
    d -
    32075;

  // Convert JD to Hijri
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - remainder) / 5316) *
      Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const adjustedL =
    remainder -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hijriMonth = Math.floor((24 * adjustedL) / 709);
  const hijriDay = adjustedL - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const monthName = HIJRI_MONTHS[(hijriMonth - 1 + 12) % 12] || HIJRI_MONTHS[0];
  return `${hijriDay} ${monthName} ${hijriYear} AH`;
}

// Spiritual journey levels based on reflections
export const JOURNEY_LEVELS = [
  {
    level: 1,
    name: "Seedling",
    minReflections: 0,
    icon: "🌱",
    description: "Beginning your journey",
  },
  {
    level: 2,
    name: "Growing",
    minReflections: 5,
    icon: "🌿",
    description: "Developing awareness",
  },
  {
    level: 3,
    name: "Rooted",
    minReflections: 15,
    icon: "🌳",
    description: "Building resilience",
  },
  {
    level: 4,
    name: "Flourishing",
    minReflections: 30,
    icon: "🌸",
    description: "Deepening understanding",
  },
  {
    level: 5,
    name: "Illuminated",
    minReflections: 50,
    icon: "✨",
    description: "Radiating light",
  },
];

export function getJourneyLevel(totalReflections: number) {
  for (let i = JOURNEY_LEVELS.length - 1; i >= 0; i--) {
    if (totalReflections >= JOURNEY_LEVELS[i].minReflections) {
      return JOURNEY_LEVELS[i];
    }
  }
  return JOURNEY_LEVELS[0];
}

export function getNextLevel(totalReflections: number) {
  const currentLevel = getJourneyLevel(totalReflections);
  const nextIndex =
    JOURNEY_LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
  if (nextIndex < JOURNEY_LEVELS.length) {
    return JOURNEY_LEVELS[nextIndex];
  }
  return null;
}

export interface ModuleCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  gradient: string[];
  delay: number;
  locked?: boolean;
  testID?: string;
}
