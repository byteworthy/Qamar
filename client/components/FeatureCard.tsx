/**
 * FeatureCard
 *
 * Shared gradient feature card used in LearnTabScreen and WorshipTabScreen.
 * Supports optional "Coming Soon" and "Works Offline" badges.
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";

export interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string[];
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  delay: number;
  comingSoon?: boolean;
  offlineReady?: boolean;
  testID?: string;
}

export function FeatureCard({
  title,
  description,
  gradient,
  icon,
  onPress,
  delay,
  comingSoon = false,
  offlineReady = false,
  testID,
}: FeatureCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        testID={testID}
        onPress={comingSoon ? undefined : onPress}
        style={({ pressed }) => [
          styles.featureCard,
          {
            opacity: comingSoon ? 0.6 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && !comingSoon ? 0.98 : 1 }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={
          comingSoon ? "Coming soon" : `Opens ${title.toLowerCase()}`
        }
        disabled={comingSoon}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Feather
              name={icon}
              size={28}
              color="rgba(255,255,255,0.9)"
              style={styles.cardIcon}
            />
            {comingSoon && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>Coming Soon</ThemedText>
              </View>
            )}
            {!comingSoon && offlineReady && (
              <View style={styles.offlineBadge}>
                <Feather
                  name="wifi-off"
                  size={10}
                  color="rgba(255,255,255,0.85)"
                  style={styles.offlineIcon}
                />
                <ThemedText style={styles.offlineBadgeText}>
                  Works offline
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
          <ThemedText style={styles.cardDescription}>{description}</ThemedText>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardIcon: {
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineIcon: {
    marginTop: 1,
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
  },
});
