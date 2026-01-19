import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";

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

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator, {
  RootStackParamList,
} from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
      Distortion: "distortion",
      Reframe: "reframe",
      Regulation: "regulation",
      Intention: "intention",
      SessionComplete: "session-complete",
      History: "history",
      Pricing: "pricing",
      BillingSuccess: "billing/success",
      CalmingPractice: "calming-practice",
      Dua: "dua",
      Insights: "insights",
    },
  },
};

export default function App() {
  useHideWebScrollbar();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <NavigationContainer linking={linking}>
                <RootStackNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
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
});
