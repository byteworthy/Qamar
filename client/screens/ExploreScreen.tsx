import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { NiyyahColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExploreCardProps {
  title: string;
  gradient: string[];
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  delay: number;
}

function ExploreCard({
  title,
  gradient,
  icon,
  onPress,
  delay,
}: ExploreCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.exploreCard,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Feather
            name={icon}
            size={28}
            color="rgba(255,255,255,0.9)"
            style={styles.cardIcon}
          />
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const journeys = [
    {
      title: "Process difficult thoughts",
      gradient: ["#5a4a3a", "#8a7a6a"],
      icon: "edit-3" as const,
      screen: "ThoughtCapture" as const,
    },
    {
      title: "Find calm through dhikr",
      gradient: ["#3a5a4a", "#6a8a7a"],
      icon: "wind" as const,
      screen: "CalmingPractice" as const,
    },
    {
      title: "Discover contextual duas",
      gradient: ["#3a4a5a", "#6a7a8a"],
      icon: "heart" as const,
      screen: "Dua" as const,
    },
    {
      title: "Understand your patterns",
      gradient: ["#5a3a4a", "#8a6a7a"],
      icon: "bar-chart-2" as const,
      screen: "Insights" as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Explore</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Practical tools for daily life
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
        <View style={styles.cardsGrid}>
          {journeys.map((journey, index) => (
            <ExploreCard
              key={journey.title}
              title={journey.title}
              gradient={journey.gradient}
              icon={journey.icon}
              onPress={() => {
                if (journey.screen === "Dua") {
                  navigation.navigate("Dua", { state: undefined });
                } else {
                  navigation.navigate(journey.screen);
                }
              }}
              delay={100 + index * 80}
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
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardsGrid: {
    gap: 14,
  },
  exploreCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
    minHeight: 100,
    justifyContent: "flex-end",
  },
  cardIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    opacity: 0.6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
