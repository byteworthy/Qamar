import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { SlideInDown, SlideOutUp } from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { useAppState, selectIsOffline } from "@/stores/app-state";

export function OfflineBanner() {
  const isOffline = useAppState(selectIsOffline);
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when coming back online
  useEffect(() => {
    if (!isOffline) {
      setDismissed(false);
    }
  }, [isOffline]);

  if (!isOffline || dismissed) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(300)}
      exiting={SlideOutUp.duration(200)}
      style={styles.container}
      testID="offline-banner"
    >
      <Feather name="wifi-off" size={16} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>You{"'"}re offline</ThemedText>
        <ThemedText style={styles.subtitle}>
          Quran, prayer times & flashcards still work
        </ThemedText>
      </View>
      <Pressable
        onPress={() => setDismissed(true)}
        accessibilityRole="button"
        accessibilityLabel="Dismiss offline notification"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="x" size={16} color="rgba(255,255,255,0.8)" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E44D26",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 1,
  },
});
