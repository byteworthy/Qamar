import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureStorage, SECURE_KEYS } from "./secure-storage";

const SESSIONS_KEY = SECURE_KEYS.SESSIONS;
const ONBOARDING_KEY = "@noor_onboarding_completed"; // Less sensitive, can stay in regular storage for now

export interface Session {
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  timestamp: number;
}

export async function saveSession(session: Session): Promise<void> {
  try {
    const existing = await getSessions();
    const updated = [session, ...existing];
    // Use secure storage for sensitive session data (personal reflection entries)
    await secureStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving session:", error);
    throw error; // Re-throw to handle at call site
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const data = await secureStorage.getItem(SESSIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error getting sessions:", error);
    return [];
  }
}

export async function clearSessions(): Promise<void> {
  try {
    await secureStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error("Error clearing sessions:", error);
    throw error; // Re-throw to handle at call site
  }
}

export async function getOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    return false;
  }
}

export async function setOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Error setting onboarding status:", error);
  }
}
