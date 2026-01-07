import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "@siraat_sessions";

export interface Session {
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  timestamp: number;
}

export async function saveSession(session: Session): Promise<void> {
  try {
    const existing = await getSessions();
    const updated = [session, ...existing];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
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
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error("Error clearing sessions:", error);
  }
}
