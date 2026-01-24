import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { Fonts, NiyyahColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";

const USER_NAME_KEY = "@noor_user_name";
const JOURNEY_STATS_KEY = "@noor_journey_stats";

// Journey tracking data
interface JourneyStats {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  lastReflectionDate: string | null;
  topDistortions: string[];
  favoriteAnchors: string[];
}

// Spiritual journey levels based on reflections
const JOURNEY_LEVELS = [
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

function getJourneyLevel(totalReflections: number) {
  for (let i = JOURNEY_LEVELS.length - 1; i >= 0; i--) {
    if (totalReflections >= JOURNEY_LEVELS[i].minReflections) {
      return JOURNEY_LEVELS[i];
    }
  }
  return JOURNEY_LEVELS[0];
}

function getNextLevel(totalReflections: number) {
  const currentLevel = getJourneyLevel(totalReflections);
  const nextIndex =
    JOURNEY_LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
  if (nextIndex < JOURNEY_LEVELS.length) {
    return JOURNEY_LEVELS[nextIndex];
  }
  return null;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ModuleCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  gradient: string[];
  delay: number;
  locked?: boolean;
}

function ModuleCard({
  icon,
  title,
  description,
  onPress,
  gradient,
  delay,
  locked,
}: ModuleCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.moduleCard,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${title}${locked ? ", requires Noor Plus" : ""}`}
        accessibilityHint={description}
        accessibilityState={{ disabled: locked }}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.moduleGradient}
        >
          <View style={styles.moduleHeader}>
            <Feather name={icon} size={24} color="rgba(255,255,255,0.9)" />
            {locked && (
              <View style={styles.proBadge}>
                <ThemedText style={styles.proBadgeText}>PRO</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.moduleContent}>
            <ThemedText style={styles.moduleTitle}>{title}</ThemedText>
            <ThemedText style={styles.moduleDescription}>
              {description}
            </ThemedText>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function getDailyReminder(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return Brand.dailyReminders[dayOfYear % Brand.dailyReminders.length];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [userName, setUserName] = useState<string>("Friend");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [journeyStats, setJourneyStats] = useState<JourneyStats>({
    totalReflections: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastReflectionDate: null,
    topDistortions: [],
    favoriteAnchors: [],
  });

  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name: string | null) => {
      if (name && name.trim()) {
        setUserName(name);
      }
    });

    // Load journey stats
    AsyncStorage.getItem(JOURNEY_STATS_KEY).then((stats: string | null) => {
      if (stats) {
        try {
          setJourneyStats(JSON.parse(stats));
        } catch (e) {
          console.log("Failed to parse journey stats");
        }
      }
    });
  }, []);

  const currentLevel = getJourneyLevel(journeyStats.totalReflections);
  const nextLevel = getNextLevel(journeyStats.totalReflections);
  const progressToNext = nextLevel
    ? ((journeyStats.totalReflections - currentLevel.minReflections) /
        (nextLevel.minReflections - currentLevel.minReflections)) *
      100
    : 100;

  const handleSaveName = async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      await AsyncStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowNameModal(false);
    setNameInput("");
  };

  const dailyReminder = useMemo(() => getDailyReminder(), []);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 20,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.header}
          >
            <Pressable
              onPress={() => {
                setNameInput(userName);
                setShowNameModal(true);
              }}
              style={styles.greetingRow}
              accessibilityRole="button"
              accessibilityLabel={`Greeting: Salaam, ${userName}. Edit name`}
              accessibilityHint="Opens dialog to change your name"
            >
              <View style={styles.greetingContent}>
                <ThemedText
                  style={[styles.salaamText, { color: theme.textSecondary }]}
                >
                  Salaam,
                </ThemedText>
                <ThemedText style={styles.nameText}> {userName}</ThemedText>
              </View>
              <Feather
                name="edit-2"
                size={12}
                color={theme.textSecondary}
                style={{ opacity: 0.4 }}
              />
            </Pressable>
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              {"What's on your mind today?"}
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(350).delay(80)}
            style={[
              styles.anchorCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.anchorHeader}>
              <View
                style={[
                  styles.anchorBadge,
                  { backgroundColor: NiyyahColors.accent + "20" },
                ]}
              >
                <Feather name="anchor" size={14} color={NiyyahColors.accent} />
              </View>
              <ThemedText
                style={[styles.anchorLabel, { color: theme.textSecondary }]}
              >
                {"Today’s Anchor"}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.anchorText, { fontFamily: Fonts?.serif }]}
            >
              {dailyReminder}
            </ThemedText>
          </Animated.View>

          {/* Journey Progress Card */}
          <Animated.View
            entering={FadeInUp.duration(350).delay(100)}
            style={[
              styles.journeyCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.journeyHeader}>
              <View style={styles.journeyLevel}>
                <ThemedText style={styles.journeyIcon}>
                  {currentLevel.icon}
                </ThemedText>
                <View>
                  <ThemedText
                    style={[styles.journeyLevelName, { color: theme.text }]}
                  >
                    {currentLevel.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.journeyLevelDesc,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {currentLevel.description}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.journeyStats}>
                <ThemedText
                  style={[styles.statNumber, { color: NiyyahColors.accent }]}
                >
                  {journeyStats.totalReflections}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  reflections
                </ThemedText>
              </View>
            </View>

            {nextLevel && (
              <View style={styles.progressSection}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.backgroundRoot },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progressToNext, 100)}%`,
                        backgroundColor: NiyyahColors.accent,
                      },
                    ]}
                  />
                </View>
                <ThemedText
                  style={[styles.progressText, { color: theme.textSecondary }]}
                >
                  {nextLevel.minReflections - journeyStats.totalReflections}{" "}
                  more to reach {nextLevel.icon} {nextLevel.name}
                </ThemedText>
              </View>
            )}

            {journeyStats.currentStreak > 0 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: NiyyahColors.accent + "15" },
                ]}
              >
                <ThemedText style={styles.streakText}>
                  🔥 {journeyStats.currentStreak} day streak
                </ThemedText>
              </View>
            )}
          </Animated.View>

          <View style={styles.modulesSection}>
            <ThemedText
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Tools for Your Journey
            </ThemedText>

            <View style={styles.modulesGrid}>
              <ModuleCard
                icon="edit-3"
                title="Reflection"
                description="Process a troubling thought with structured prompts"
                onPress={() => navigation.navigate("ThoughtCapture")}
                gradient={["#6a5a4a", "#4a3a2a"]}
                delay={120}
              />
              <ModuleCard
                icon="wind"
                title="Calming Practice"
                description="Quick grounding exercises with dhikr"
                onPress={() => navigation.navigate("CalmingPractice")}
                gradient={["#4a6a5a", "#2a4a3a"]}
                delay={160}
              />
              <ModuleCard
                icon="heart"
                title="Dua"
                description="Find the right words for what you carry"
                onPress={() => navigation.navigate("Dua", { state: undefined })}
                gradient={["#4a5a6a", "#2a3a4a"]}
                delay={200}
              />
              <ModuleCard
                icon="bar-chart-2"
                title="Insights"
                description="See patterns in your reflections"
                onPress={() => navigation.navigate("Insights")}
                gradient={["#5a4a5a", "#3a2a3a"]}
                delay={240}
                locked={!isPaid}
              />
            </View>
          </View>

          {!isPaid && (
            <Animated.View
              entering={FadeInUp.duration(300).delay(320)}
              style={styles.upgradeSection}
            >
              <Pressable
                onPress={() => navigation.navigate("Pricing")}
                style={({ pressed }) => [
                  styles.upgradeButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Noor Plus"
                accessibilityHint="Opens pricing options for Noor Plus subscription"
              >
                <View style={styles.upgradeContent}>
                  <Feather
                    name="star"
                    size={16}
                    color={NiyyahColors.background}
                  />
                  <ThemedText style={styles.upgradeText}>
                    Upgrade to Noor Plus
                  </ThemedText>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={NiyyahColors.background}
                  style={{ opacity: 0.6 }}
                />
              </Pressable>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.duration(300).delay(380)}
            style={styles.footer}
          >
            <ThemedText
              style={[styles.methodCallout, { color: theme.textSecondary }]}
            >
              {Brand.betaDisclaimer}
            </ThemedText>
            <ThemedText
              style={[styles.disclaimer, { color: theme.textSecondary }]}
            >
              {Brand.disclaimer}
            </ThemedText>
          </Animated.View>
        </ScrollView>
      </View>

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.modalTitle}>
              {"What’s your name?"}
            </ThemedText>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nameInput,
                { backgroundColor: theme.backgroundRoot, color: theme.text },
              ]}
              autoFocus
              maxLength={20}
              accessibilityLabel="Name input"
              accessibilityHint="Enter your preferred name for greetings"
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowNameModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.backgroundRoot },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes dialog without saving"
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                accessibilityRole="button"
                accessibilityLabel="Save name"
                accessibilityHint="Saves your name and closes dialog"
              >
                <ThemedText style={{ color: NiyyahColors.background }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  greetingContent: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  salaamText: {
    fontSize: 22,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  anchorCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 28,
  },
  anchorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  anchorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  anchorLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "500",
  },
  anchorText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modulesSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
    fontWeight: "500",
  },
  modulesGrid: {
    gap: 12,
  },
  moduleCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  moduleGradient: {
    padding: 18,
    minHeight: 100,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  moduleContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)", // Increased from 0.75 for better contrast
    lineHeight: 18,
  },
  proBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  upgradeSection: {
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: NiyyahColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  upgradeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: "600",
    color: NiyyahColors.background,
  },
  footer: {
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
  },
  methodCallout: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 12,
    opacity: 0.7,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
    fontSize: 10,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  // Journey Card
  journeyCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  journeyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  journeyLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  journeyIcon: {
    fontSize: 32,
  },
  journeyLevelName: {
    fontSize: 17,
    fontWeight: "600",
  },
  journeyLevelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  journeyStats: {
    alignItems: "flex-end",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  streakBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  streakText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
