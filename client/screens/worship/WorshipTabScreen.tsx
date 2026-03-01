import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { FeatureCard } from "@/components/FeatureCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      offlineReady: true,
    },
    {
      title: "Qibla Finder",
      description: "Find the direction of Makkah",
      gradient: ["#5a3a5a", "#8a6a8a"],
      icon: "compass" as const,
      screen: "QiblaFinder" as const,
      comingSoon: false,
      offlineReady: true,
    },
    {
      title: "Adhkar & Duas",
      description: "Daily remembrance and supplications",
      gradient: ["#3a4a3a", "#6a7a6a"],
      icon: "heart" as const,
      screen: "AdhkarList" as const,
      comingSoon: false,
      offlineReady: true,
    },
    {
      title: "Islamic Calendar",
      description: "Hijri dates and important events",
      gradient: ["#4a3a3a", "#7a6a6a"],
      icon: "calendar" as const,
      screen: "IslamicCalendar" as const,
      comingSoon: false,
      offlineReady: false,
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
                navigation.navigate(feature.screen);
              }}
              delay={100 + index * 80}
              comingSoon={feature.comingSoon}
              offlineReady={feature.offlineReady}
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
});
