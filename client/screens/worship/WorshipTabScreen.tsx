import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string[];
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  delay: number;
  comingSoon?: boolean;
}

function FeatureCard({
  title,
  description,
  gradient,
  icon,
  onPress,
  delay,
  comingSoon = false,
}: FeatureCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
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
              <View style={styles.comingSoonBadge}>
                <ThemedText style={styles.comingSoonText}>
                  Coming Soon
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

export default function WorshipTabScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const features = [
    {
      title: "Prayer Times",
      description: "Accurate prayer times for your location",
      gradient: ["#3a5a5a", "#6a8a8a"],
      icon: "clock" as const,
      screen: "PrayerTimes" as const,
      comingSoon: false,
    },
    {
      title: "Qibla Finder",
      description: "Find the direction of Makkah",
      gradient: ["#5a3a5a", "#8a6a8a"],
      icon: "compass" as const,
      screen: "QiblaFinder" as const,
      comingSoon: false,
    },
    {
      title: "Adhkar & Duas",
      description: "Daily remembrance and supplications",
      gradient: ["#3a4a3a", "#6a7a6a"],
      icon: "heart" as const,
      screen: "AdhkarList" as const,
      comingSoon: false,
    },
    {
      title: "Islamic Calendar",
      description: "Hijri dates and important events",
      gradient: ["#4a3a3a", "#7a6a6a"],
      icon: "calendar" as const,
      screen: "IslamicCalendar" as const,
      comingSoon: false,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Worship</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Prayer times, Qibla, and daily adhkar
          </ThemedText>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              icon={feature.icon}
              onPress={() => {
                if (feature.screen) {
                  navigation.navigate(feature.screen);
                }
              }}
              delay={100 + index * 80}
              comingSoon={feature.comingSoon}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  featuresGrid: {
    gap: 16,
  },
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
  comingSoonBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
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
