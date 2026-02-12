import { Feather } from "@expo/vector-icons";

export const USER_NAME_KEY = "@noor_user_name";
export const JOURNEY_STATS_KEY = "@noor_journey_stats";

// Journey tracking data
export interface JourneyStats {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  lastReflectionDate: string | null;
  topDistortions: string[];
  favoriteAnchors: string[];
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
}
