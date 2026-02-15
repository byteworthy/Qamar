import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Text,
  ActivityIndicator,
} from "react-native";
import { initSentry } from "@/lib/sentry";
import { useNotifications } from "@/hooks/useNotifications";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import {
  authenticateWithBiometric,
  isBiometricAvailable,
} from "@/lib/biometric-auth";
import { checkDeviceSecurity } from "@/lib/device-security";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator, {
  RootStackParamList,
} from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useOfflineDatabase } from "@/hooks/useOfflineData";

// Initialize Sentry (no-op if EXPO_PUBLIC_SENTRY_DSN not configured)
initSentry();

function useHideWebScrollbar() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        html, body, #root {
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
}

const prefix = Linking.createURL("/");

const getWebPrefix = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin + "/";
  }
  return undefined;
};

const webPrefix = getWebPrefix();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: webPrefix ? [prefix, webPrefix] : [prefix],
  config: {
    screens: {
      Home: "",
      ThoughtCapture: "thought-capture",
      Noticing: "noticing",
      BeliefInspection: "belief-inspection",
      Reframe: "reframe",
      Regulation: "regulation",
      Intention: "intention",
      ReflectionComplete: "reflection-complete",
      History: "history",
      Pricing: "pricing",
      BillingSuccess: "billing/success",
      CalmingPractice: "calming-practice",
      Dua: "dua",
      Insights: "insights",
      QuranReader: "quran",
      VerseReader: "quran/:surahId",
      PrayerTimes: "prayer-times",
      QiblaFinder: "qibla",
      IslamicCalendar: "islamic-calendar",
      ArabicLearning: "arabic-learning",
      FlashcardReview: "flashcard-review",
      HadithLibrary: "hadith",
      HadithList: "hadith/collection/:collectionId",
      HadithDetail: "hadith/:hadithId",
      AdhkarList: "adhkar",
      AlphabetGrid: "alphabet",
      ProgressDashboard: "progress",
    },
  },
};

/**
 * BiometricGuard Component
 *
 * Protects app access with biometric authentication (Face ID, Touch ID, Fingerprint).
 * Checks if biometric is available, prompts for authentication, and only allows
 * access after successful verification.
 *
 * Privacy Note: Used to protect sensitive personal reflection entries.
 */
function BiometricGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAndAuthenticate() {
      try {
        // First, check if device is compromised (jailbroken/rooted)
        checkDeviceSecurity();
        // Note: checkDeviceSecurity shows alert to user if compromised,
        // but we still allow app to continue (user choice)

        const isAvailable = await isBiometricAvailable();

        if (!isAvailable) {
          // Biometric not available - allow access (device may not support it)
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }

        // Prompt for biometric authentication
        const result = await authenticateWithBiometric(
          "Authenticate to access your personal reflections",
        );

        setIsAuthenticated(result);
        setIsChecking(false);
      } catch (error) {
        console.error("[BiometricGuard] Authentication error:", error);
        // On error, allow access (graceful degradation)
        setIsAuthenticated(true);
        setIsChecking(false);
      }
    }

    checkAndAuthenticate();
  }, []);

  if (isChecking) {
    // Show loading screen while checking biometric availability
    return (
      <View style={styles.authScreen}>
        <ActivityIndicator size="large" color="#4fd1a8" />
        <Text style={styles.authText}>Securing your reflections...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    // Authentication failed - show blocked screen
    return (
      <View style={styles.authScreen}>
        <Text style={styles.authText}>Authentication Required</Text>
        <Text style={styles.authSubtext}>
          Please authenticate to access your personal reflections
        </Text>
      </View>
    );
  }

  // Authenticated - render app content
  return <>{children}</>;
}

function OfflineDatabaseInitializer() {
  const { isReady, error } = useOfflineDatabase();

  useEffect(() => {
    if (error) {
      console.error("[App] Offline database failed to initialize:", error);
    } else if (isReady) {
      console.log("[App] Offline database initialized");
    }
  }, [isReady, error]);

  return null;
}

function NotificationInitializer() {
  // Initialize notifications - this hook handles permission requests,
  // daily reminder scheduling, and notification listeners
  const { isEnabled, isLoading } = useNotifications();

  useEffect(() => {
    if (!isLoading) {
      console.log("[App] Notifications initialized, enabled:", isEnabled);
    }
  }, [isEnabled, isLoading]);

  return null;
}

export default function App() {
  useHideWebScrollbar();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "CormorantGaramond-Regular": CormorantGaramond_400Regular,
    "CormorantGaramond-SemiBold": CormorantGaramond_600SemiBold,
    "CormorantGaramond-Bold": CormorantGaramond_700Bold,
    "Amiri-Regular": Amiri_400Regular,
    "Amiri-Bold": Amiri_700Bold,
  });

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <BiometricGuard>
                <OfflineDatabaseInitializer />
                <NotificationInitializer />
                <NavigationContainer linking={linking}>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="auto" />
              </BiometricGuard>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  authScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b1620",
    padding: 24,
  },
  authText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
    textAlign: "center",
  },
  authSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
});
// Test E2E workflow
