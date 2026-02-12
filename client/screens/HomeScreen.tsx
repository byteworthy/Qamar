import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { Fonts, NiyyahColors } from "@/constants/theme";
import { secureStorage } from "@/lib/secure-storage";
import { ThemedText } from "@/components/ThemedText";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { styles } from "./HomeScreen.styles";
import {
  USER_NAME_KEY,
  JOURNEY_STATS_KEY,
  JourneyStats,
  ModuleCardProps,
  getJourneyLevel,
  getNextLevel,
} from "./HomeScreen.data";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ModuleCard = React.memo(function ModuleCard({
  icon,
  title,
  description,
  onPress,
  gradient,
  delay,
  locked,
}: ModuleCardProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Staggered rotation for visual interest (alternating left/right)
  const initialRotation = (delay % 2 === 0 ? -1 : 1) * 0.5;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400)
        .delay(delay)
        .springify()
        .damping(15)
        .stiffness(100)}
      style={[{ transform: [{ rotate: `${initialRotation}deg` }] }]}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => {
            scale.value = withSpring(0.97);
            rotation.value = withSpring(0);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
            rotation.value = withSpring(initialRotation);
          }}
          style={styles.moduleCard}
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
    </Animated.View>
  );
});

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
    secureStorage.getItem(USER_NAME_KEY).then((name: string | null) => {
      if (name && name.trim()) {
        setUserName(name);
      }
    });

    // Load journey stats
    secureStorage.getItem(JOURNEY_STATS_KEY).then((stats: string | null) => {
      if (stats) {
        try {
          setJourneyStats(JSON.parse(stats));
        } catch {
          // Failed to parse journey stats - silently fail and use defaults
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
      await secureStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowNameModal(false);
    setNameInput("");
  };

  const dailyReminder = useMemo(() => getDailyReminder(), []);

  // Memoized navigation handlers to prevent unnecessary re-renders
  const handleNavigateThoughtCapture = useCallback(() => {
    navigation.navigate("ThoughtCapture");
  }, [navigation]);

  const handleNavigateCalmingPractice = useCallback(() => {
    navigation.navigate("CalmingPractice");
  }, [navigation]);

  const handleNavigateDua = useCallback(() => {
    navigation.navigate("Dua", { state: undefined });
  }, [navigation]);

  const handleNavigateInsights = useCallback(() => {
    navigation.navigate("Insights");
  }, [navigation]);

  const handleNavigatePricing = useCallback(() => {
    navigation.navigate("Pricing");
  }, [navigation]);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  return (
    <>
      <View style={styles.container}>
        <AtmosphericBackground variant="atmospheric">
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

          <Animated.View entering={FadeInUp.duration(350).delay(80)}>
            <GlassCard style={styles.anchorCard} elevated breathing>
              <IslamicPattern variant="moonstar" opacity={0.03} />
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
                  {"Today's Anchor"}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.anchorText, { fontFamily: Fonts?.serif }]}
              >
                {dailyReminder}
              </ThemedText>
            </GlassCard>
          </Animated.View>

          {/* Journey Progress Card */}
          <Animated.View entering={FadeInUp.duration(350).delay(100)}>
            <GlassCard style={styles.journeyCard} elevated>
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
            </GlassCard>
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
                onPress={handleNavigateThoughtCapture}
                gradient={["#6a5a4a", "#4a3a2a"]}
                delay={120}
              />
              <ModuleCard
                icon="wind"
                title="Calming Practice"
                description="Quick grounding exercises with dhikr"
                onPress={handleNavigateCalmingPractice}
                gradient={["#4a6a5a", "#2a4a3a"]}
                delay={160}
              />
              <ModuleCard
                icon="heart"
                title="Dua"
                description="Find the right words for what you carry"
                onPress={handleNavigateDua}
                gradient={["#4a5a6a", "#2a3a4a"]}
                delay={200}
              />
              <ModuleCard
                icon="bar-chart-2"
                title="Insights"
                description="See patterns in your reflections"
                onPress={handleNavigateInsights}
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
                onPress={handleNavigatePricing}
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
        </AtmosphericBackground>
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

