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
import { Fonts, NiyyahColors, NoorColors } from "@/constants/theme";
import { secureStorage } from "@/lib/secure-storage";
import { ThemedText } from "@/components/ThemedText";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { useDailyHadith } from "@/hooks/useHadithData";
import {
  useAppState,
  selectUserLocation,
  selectArabicState,
  selectDailyProgress,
} from "@/stores/app-state";
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatPrayerTime,
  formatCountdown,
} from "@/services/prayerTimes";
import {
  useGamification,
  selectCurrentStreak,
  selectStreakStatus,
  selectPendingMilestone,
} from "@/stores/gamification-store";
import { getHijriDate as getHijriDateService } from "@/services/islamicCalendar";
import { styles } from "./HomeScreen.styles";
import {
  USER_NAME_KEY,
  JOURNEY_STATS_KEY,
  REFLECTIONS_KEY,
  JourneyStats,
  ReflectionPreview,
  ModuleCardProps,
  getJourneyLevel,
  getNextLevel,
  getIslamicGreeting,
  getHijriDate,
} from "./HomeScreen.data";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─────────────────────────────────────────────────────────────────────────────
// Module Card (preserved from original)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Quick Action Button
// ─────────────────────────────────────────────────────────────────────────────

interface QuickActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
  delay: number;
}

const QuickActionButton = React.memo(function QuickActionButton({
  icon,
  label,
  onPress,
  color,
  delay,
}: QuickActionButtonProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(350).delay(delay)}
      style={styles.quickActionItem}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.quickActionItem}
      >
        <View
          style={[
            styles.quickActionCircle,
            { backgroundColor: color + "18" },
          ]}
        >
          <Feather name={icon} size={22} color={color} />
        </View>
        <ThemedText
          style={[styles.quickActionLabel, { color: theme.textSecondary }]}
        >
          {label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getDailyReminder(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return Brand.dailyReminders[dayOfYear % Brand.dailyReminders.length];
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // ── State ───────────────────────────────────────────────────────────
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
  const [recentReflections, setRecentReflections] = useState<
    ReflectionPreview[]
  >([]);
  const [prayerCountdown, setPrayerCountdown] = useState<string>("");

  // ── Store selectors ─────────────────────────────────────────────────
  const userLocation = useAppState(selectUserLocation);
  const arabicState = useAppState(selectArabicState);
  const dailyProgress = useAppState(selectDailyProgress);

  // ── Gamification selectors ────────────────────────────────────────
  const currentStreak = useGamification(selectCurrentStreak);
  const streakStatus = useGamification(selectStreakStatus);
  const pendingMilestone = useGamification(selectPendingMilestone);
  const clearPendingMilestone = useGamification((s) => s.clearPendingMilestone);
  const checkAndUpdateStreak = useGamification((s) => s.checkAndUpdateStreak);
  const todayActivities = useGamification((s) => s.todayActivities);

  // Check if it's Ramadan
  const isRamadan = useMemo(() => {
    const hijri = getHijriDateService();
    return hijri.monthNumber === 9;
  }, []);

  const dailyNoorDone = todayActivities.includes("daily_noor_completed");

  // ── Data hooks ──────────────────────────────────────────────────────
  const { data: dailyHadith } = useDailyHadith();
  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });
  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  // ── Computed values ─────────────────────────────────────────────────
  const greeting = useMemo(() => getIslamicGreeting(), []);
  const hijriDate = useMemo(() => getHijriDate(), []);
  const dailyReminder = useMemo(() => getDailyReminder(), []);

  const prayerTimes = useMemo(() => {
    if (!userLocation) return null;
    return calculatePrayerTimes(
      userLocation.latitude,
      userLocation.longitude,
    );
  }, [userLocation]);

  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    return getNextPrayer(prayerTimes);
  }, [prayerTimes]);

  const currentLevel = getJourneyLevel(journeyStats.totalReflections);
  const nextLevel = getNextLevel(journeyStats.totalReflections);
  const progressToNext = nextLevel
    ? ((journeyStats.totalReflections - currentLevel.minReflections) /
        (nextLevel.minReflections - currentLevel.minReflections)) *
      100
    : 100;

  // Check if Arabic review happened today
  const today = new Date().toISOString().split("T")[0];
  const hasArabicActivity =
    arabicState.lastReviewDate === today && arabicState.reviewsCompleted > 0;

  // ── Effects ─────────────────────────────────────────────────────────

  // Check streak status on mount
  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  // Load persisted data
  useEffect(() => {
    secureStorage.getItem(USER_NAME_KEY).then((name: string | null) => {
      if (name && name.trim()) setUserName(name);
    }).catch(() => {});

    secureStorage.getItem(JOURNEY_STATS_KEY).then((stats: string | null) => {
      if (stats) {
        try {
          setJourneyStats(JSON.parse(stats));
        } catch {
          // silently fail
        }
      }
    }).catch(() => {});

    secureStorage
      .getItem(REFLECTIONS_KEY)
      .then((data: string | null) => {
        if (data) {
          try {
            const all: ReflectionPreview[] = JSON.parse(data);
            // Sort by date descending, take latest 3
            const sorted = all
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .slice(0, 3);
            setRecentReflections(sorted);
          } catch {
            // silently fail
          }
        }
      }).catch(() => {});
  }, []);

  // Prayer countdown timer — update every second
  useEffect(() => {
    if (!prayerTimes) return;

    const update = () => {
      const next = getNextPrayer(prayerTimes);
      setPrayerCountdown(formatCountdown(next.timeUntil));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    const trimmedName = nameInput.trim();
    if (trimmedName) {
      await secureStorage.setItem(USER_NAME_KEY, trimmedName);
      setUserName(trimmedName);
    }
    setShowNameModal(false);
    setNameInput("");
  };

  const handleNavigateThoughtCapture = useCallback(
    () => navigation.navigate("ThoughtCapture"),
    [navigation],
  );
  const handleNavigateKhalil = useCallback(
    () => navigation.navigate("Main", { screen: "Khalil" } as any),
    [navigation],
  );
  const handleNavigateCalmingPractice = useCallback(
    () => navigation.navigate("CalmingPractice"),
    [navigation],
  );
  const handleNavigateDua = useCallback(
    () => navigation.navigate("Dua", { state: undefined }),
    [navigation],
  );
  const handleNavigateInsights = useCallback(
    () => navigation.navigate("Insights"),
    [navigation],
  );
  const handleNavigatePricing = useCallback(
    () => navigation.navigate("Pricing"),
    [navigation],
  );
  const handleNavigatePrayerTimes = useCallback(
    () => navigation.navigate("PrayerTimes"),
    [navigation],
  );
  const handleNavigateQuran = useCallback(
    () => navigation.navigate("QuranReader"),
    [navigation],
  );
  const handleNavigateArabic = useCallback(
    () => navigation.navigate("ArabicLearning"),
    [navigation],
  );
  const handleNavigateAdhkar = useCallback(
    () => navigation.navigate("AdhkarList"),
    [navigation],
  );
  const handleNavigateHistory = useCallback(
    () => navigation.navigate("History"),
    [navigation],
  );
  const handleNavigateHadithDetail = useCallback(
    (hadithId: string) => navigation.navigate("HadithDetail", { hadithId }),
    [navigation],
  );
  const handleNavigateDailyNoor = useCallback(
    () => navigation.navigate("DailyNoor"),
    [navigation],
  );
  const handleNavigateAchievements = useCallback(
    () => navigation.navigate("Achievements"),
    [navigation],
  );
  const handleNavigateRamadanHub = useCallback(
    () => navigation.navigate("RamadanHub"),
    [navigation],
  );

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <View style={styles.container}>
        <AtmosphericBackground variant="atmospheric">
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + 16,
                paddingBottom: 100 + insets.bottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header with Hijri Date + Islamic Greeting ── */}
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.header}
            >
              <ThemedText
                style={[
                  styles.hijriDate,
                  {
                    color: theme.textSecondary,
                    fontFamily: Fonts?.sansMedium,
                  },
                ]}
              >
                {hijriDate}
              </ThemedText>

              <Pressable
                onPress={() => {
                  setNameInput(userName);
                  setShowNameModal(true);
                }}
                style={styles.greetingRow}
                accessibilityRole="button"
                accessibilityLabel={`Greeting: ${greeting.greeting}, ${userName}. Edit name`}
                accessibilityHint="Opens dialog to change your name"
              >
                <View style={styles.greetingContent}>
                  <ThemedText
                    style={[
                      styles.salaamText,
                      {
                        color: theme.textSecondary,
                        fontFamily: Fonts?.serif,
                      },
                    ]}
                  >
                    {greeting.greeting},
                  </ThemedText>
                  <ThemedText
                    style={[styles.nameText, { fontFamily: Fonts?.sansBold }]}
                  >
                    {" "}
                    {userName}
                  </ThemedText>
                </View>
                <Feather
                  name="edit-2"
                  size={12}
                  color={theme.textSecondary}
                  style={{ opacity: 0.4 }}
                />
              </Pressable>

              <ThemedText
                style={[
                  styles.subtitle,
                  {
                    color: theme.textSecondary,
                    fontFamily: Fonts?.sans,
                  },
                ]}
              >
                {greeting.timeMessage}
              </ThemedText>
            </Animated.View>

            {/* ── Streak Badge + Daily Noor CTA ── */}
            <Animated.View entering={FadeInUp.duration(350).delay(40)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {/* Streak Badge */}
                <Pressable
                  onPress={handleNavigateAchievements}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: streakStatus === "active" ? NoorColors.gold + "20" : streakStatus === "endangered" ? "#D4A85A20" : theme.backgroundDefault + "40",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${currentStreak} day streak. Tap to view achievements.`}
                >
                  <Feather
                    name={streakStatus === "paused" ? "pause-circle" : "zap"}
                    size={16}
                    color={streakStatus === "active" ? NoorColors.gold : streakStatus === "endangered" ? "#D4A85A" : theme.textSecondary}
                  />
                  <ThemedText style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: streakStatus === "active" ? NoorColors.gold : streakStatus === "endangered" ? "#D4A85A" : theme.textSecondary,
                  }}>
                    {currentStreak}
                  </ThemedText>
                </Pressable>

                {/* Daily Noor CTA */}
                <Pressable
                  onPress={handleNavigateDailyNoor}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: dailyNoorDone ? NoorColors.emerald + "20" : NoorColors.gold + "15",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={dailyNoorDone ? "Daily Noor completed" : "Start your Daily Noor — 4 minutes of guided practice"}
                >
                  <Feather
                    name={dailyNoorDone ? "check-circle" : "sun"}
                    size={18}
                    color={dailyNoorDone ? NoorColors.emerald : NoorColors.gold}
                  />
                  <ThemedText style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: dailyNoorDone ? NoorColors.emerald : theme.text,
                    flex: 1,
                  }}>
                    {dailyNoorDone ? "Daily Noor Complete" : "Start Daily Noor"}
                  </ThemedText>
                  {!dailyNoorDone && (
                    <ThemedText style={{ fontSize: 11, color: theme.textSecondary }}>
                      4 min
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            </Animated.View>

            {/* ── Ramadan Banner ── */}
            {isRamadan && (
              <Animated.View entering={FadeInUp.duration(350).delay(50)}>
                <Pressable
                  onPress={handleNavigateRamadanHub}
                  accessibilityRole="button"
                  accessibilityLabel="Ramadan Hub. Tap to open."
                >
                  <GlassCard style={{ marginBottom: 16 }} elevated>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: NoorColors.emerald + "20",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Feather name="moon" size={20} color={NoorColors.emerald} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
                          Ramadan Mubarak
                        </ThemedText>
                        <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>
                          Tap to open your Ramadan Hub
                        </ThemedText>
                      </View>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                    </View>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            )}

            {/* ── Next Prayer Card ── */}
            <Animated.View entering={FadeInUp.duration(350).delay(60)}>
              <Pressable
                onPress={handleNavigatePrayerTimes}
                accessibilityRole="button"
                accessibilityLabel={
                  nextPrayer
                    ? `Next prayer: ${nextPrayer.name} in ${prayerCountdown}. Tap to see all prayer times.`
                    : "Prayer times. Tap to set your location."
                }
              >
                <GlassCard style={styles.prayerCard} elevated>
                  <IslamicPattern variant="moonstar" opacity={0.03} />
                  {prayerTimes && nextPrayer ? (
                    <View style={styles.prayerCardInner}>
                      <View style={styles.prayerCardLeft}>
                        <ThemedText
                          style={[
                            styles.prayerLabel,
                            { color: NoorColors.emerald },
                          ]}
                        >
                          Next Prayer
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.prayerName,
                            {
                              color: theme.text,
                              fontFamily: Fonts?.serifBold,
                            },
                          ]}
                        >
                          {nextPrayer.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.prayerTime,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {formatPrayerTime(nextPrayer.time)}
                        </ThemedText>
                      </View>
                      <View style={styles.prayerCountdown}>
                        <ThemedText
                          style={[
                            styles.countdownText,
                            {
                              color: NoorColors.gold,
                              fontFamily: Fonts?.sansBold,
                            },
                          ]}
                        >
                          {prayerCountdown}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.countdownLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          remaining
                        </ThemedText>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <ThemedText
                        style={[
                          styles.prayerLabel,
                          { color: NoorColors.emerald },
                        ]}
                      >
                        Prayer Times
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.prayerLocationHint,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Tap to set your location for accurate prayer times
                      </ThemedText>
                    </View>
                  )}
                </GlassCard>
              </Pressable>
            </Animated.View>

            {/* ── Daily Hadith Card ── */}
            {dailyHadith && (
              <Animated.View entering={FadeInUp.duration(350).delay(120)}>
                <Pressable
                  onPress={() => handleNavigateHadithDetail(dailyHadith.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Daily hadith. Tap to read full hadith."
                >
                  <GlassCard style={styles.hadithCard} elevated>
                    <View style={styles.hadithHeader}>
                      <View
                        style={[
                          styles.hadithBadge,
                          {
                            backgroundColor: NoorColors.gold + "20",
                          },
                        ]}
                      >
                        <Feather
                          name="book-open"
                          size={14}
                          color={NoorColors.gold}
                        />
                      </View>
                      <ThemedText
                        style={[
                          styles.hadithLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Daily Hadith
                      </ThemedText>
                    </View>

                    {dailyHadith.textArabic ? (
                      <ThemedText
                        style={[
                          styles.hadithArabic,
                          {
                            color: theme.text,
                            fontFamily: Fonts?.spiritual,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {truncate(dailyHadith.textArabic, 120)}
                      </ThemedText>
                    ) : null}

                    <ThemedText
                      style={[
                        styles.hadithEnglish,
                        {
                          color: theme.text,
                          fontFamily: Fonts?.sans,
                        },
                      ]}
                      numberOfLines={3}
                    >
                      {truncate(dailyHadith.textEnglish, 180)}
                    </ThemedText>

                    <ThemedText
                      style={[
                        styles.hadithSource,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {dailyHadith.collection} - Hadith #{dailyHadith.hadithNumber}
                    </ThemedText>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            )}

            {/* ── Quick Actions Row ── */}
            <Animated.View entering={FadeInUp.duration(350).delay(180)}>
              <View style={styles.quickActionsSection}>
                <ThemedText
                  style={[
                    styles.quickActionsLabel,
                    { color: theme.textSecondary },
                  ]}
                  accessibilityRole="header"
                >
                  Quick Actions
                </ThemedText>
                <View style={styles.quickActionsRow}>
                  <QuickActionButton
                    icon="edit-3"
                    label="Reflect"
                    onPress={handleNavigateKhalil}
                    color={NoorColors.gold}
                    delay={200}
                  />
                  <QuickActionButton
                    icon="book"
                    label="Quran"
                    onPress={handleNavigateQuran}
                    color={NoorColors.emerald}
                    delay={240}
                  />
                  <QuickActionButton
                    icon="type"
                    label="Arabic"
                    onPress={handleNavigateArabic}
                    color={NoorColors.twilightLight}
                    delay={280}
                  />
                  <QuickActionButton
                    icon="sun"
                    label="Adhkar"
                    onPress={handleNavigateAdhkar}
                    color={NoorColors.goldLight}
                    delay={320}
                  />
                </View>
              </View>
            </Animated.View>

            {/* ── Today's Anchor ── */}
            <Animated.View entering={FadeInUp.duration(350).delay(240)}>
              <GlassCard style={styles.anchorCard} elevated breathing>
                <IslamicPattern variant="moonstar" opacity={0.03} />
                <View style={styles.anchorHeader}>
                  <View
                    style={[
                      styles.anchorBadge,
                      { backgroundColor: NiyyahColors.accent + "20" },
                    ]}
                  >
                    <Feather
                      name="anchor"
                      size={14}
                      color={NiyyahColors.accent}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.anchorLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {"Today's Anchor"}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.anchorText,
                    { fontFamily: Fonts?.serif },
                  ]}
                >
                  {dailyReminder}
                </ThemedText>
              </GlassCard>
            </Animated.View>

            {/* ── Arabic Learning Streak ── */}
            {hasArabicActivity && (
              <Animated.View entering={FadeInUp.duration(350).delay(300)}>
                <Pressable
                  onPress={handleNavigateArabic}
                  accessibilityRole="button"
                  accessibilityLabel={`Arabic learning progress: ${dailyProgress.completed} of ${dailyProgress.goal} cards reviewed`}
                >
                  <GlassCard style={styles.streakCard} elevated>
                    <View style={styles.streakHeader}>
                      <View style={styles.streakHeaderLeft}>
                        <Feather
                          name="zap"
                          size={18}
                          color={NoorColors.gold}
                        />
                        <ThemedText
                          style={[
                            styles.streakTitle,
                            { color: theme.text },
                          ]}
                        >
                          Arabic Review
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={[
                          styles.streakCount,
                          { color: NoorColors.gold },
                        ]}
                      >
                        {dailyProgress.completed}/{dailyProgress.goal}
                      </ThemedText>
                    </View>
                    <View style={styles.streakProgressRow}>
                      <View
                        style={[
                          styles.streakProgressBar,
                          { backgroundColor: theme.backgroundRoot },
                        ]}
                      >
                        <View
                          style={[
                            styles.streakProgressFill,
                            {
                              width: `${Math.min(dailyProgress.percentage, 100)}%`,
                              backgroundColor: NoorColors.emerald,
                            },
                          ]}
                        />
                      </View>
                      <ThemedText
                        style={[
                          styles.streakProgressText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {Math.round(dailyProgress.percentage)}%
                      </ThemedText>
                    </View>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            )}

            {/* ── Recent Reflections ── */}
            {recentReflections.length > 0 && (
              <Animated.View entering={FadeInUp.duration(350).delay(340)}>
                <View style={styles.reflectionsSection}>
                  <View style={styles.reflectionsSectionHeader}>
                    <ThemedText
                      style={[
                        styles.reflectionsSectionTitle,
                        { color: theme.textSecondary },
                      ]}
                      accessibilityRole="header"
                    >
                      Recent Reflections
                    </ThemedText>
                    <Pressable
                      onPress={handleNavigateHistory}
                      accessibilityRole="button"
                      accessibilityLabel="See all reflections"
                    >
                      <ThemedText
                        style={[
                          styles.reflectionsSeeAll,
                          { color: NoorColors.gold },
                        ]}
                      >
                        See All
                      </ThemedText>
                    </Pressable>
                  </View>

                  {recentReflections.map((reflection, index) => (
                    <Animated.View
                      key={reflection.id}
                      entering={FadeInUp.duration(300).delay(360 + index * 60)}
                    >
                      <Pressable
                        onPress={handleNavigateHistory}
                        accessibilityRole="button"
                        accessibilityLabel={`Reflection from ${formatRelativeDate(reflection.date)}: ${reflection.thought}`}
                      >
                        <GlassCard style={styles.reflectionItem}>
                          <View style={styles.reflectionItemInner}>
                            <ThemedText
                              style={[
                                styles.reflectionDate,
                                { color: theme.textSecondary },
                              ]}
                            >
                              {formatRelativeDate(reflection.date)}
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.reflectionThought,
                                { color: theme.text },
                              ]}
                              numberOfLines={2}
                            >
                              {truncate(reflection.thought, 100)}
                            </ThemedText>
                            {reflection.reframe ? (
                              <ThemedText
                                style={[
                                  styles.reflectionReframe,
                                  { color: theme.textSecondary },
                                ]}
                                numberOfLines={1}
                              >
                                {truncate(reflection.reframe, 80)}
                              </ThemedText>
                            ) : null}
                          </View>
                        </GlassCard>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* ── Journey Progress Card ── */}
            <Animated.View entering={FadeInUp.duration(350).delay(380)}>
              <GlassCard style={styles.journeyCard} elevated>
                <View style={styles.journeyHeader}>
                  <View style={styles.journeyLevel}>
                    <ThemedText style={styles.journeyIcon}>
                      {currentLevel.icon}
                    </ThemedText>
                    <View>
                      <ThemedText
                        style={[
                          styles.journeyLevelName,
                          { color: theme.text },
                        ]}
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
                      style={[
                        styles.statNumber,
                        { color: NiyyahColors.accent },
                      ]}
                    >
                      {journeyStats.totalReflections}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statLabel,
                        { color: theme.textSecondary },
                      ]}
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
                      style={[
                        styles.progressText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {nextLevel.minReflections -
                        journeyStats.totalReflections}{" "}
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
                      {journeyStats.currentStreak} day streak
                    </ThemedText>
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* ── Module Cards (Tools for Your Journey) ── */}
            <View style={styles.modulesSection}>
              <ThemedText
                style={[
                  styles.sectionLabel,
                  { color: theme.textSecondary },
                ]}
                accessibilityRole="header"
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
                  delay={420}
                />
                <ModuleCard
                  icon="wind"
                  title="Calming Practice"
                  description="Quick grounding exercises with dhikr"
                  onPress={handleNavigateCalmingPractice}
                  gradient={["#4a6a5a", "#2a4a3a"]}
                  delay={460}
                />
                <ModuleCard
                  icon="heart"
                  title="Dua"
                  description="Find the right words for what you carry"
                  onPress={handleNavigateDua}
                  gradient={["#4a5a6a", "#2a3a4a"]}
                  delay={500}
                />
                <ModuleCard
                  icon="bar-chart-2"
                  title="Insights"
                  description="See patterns in your reflections"
                  onPress={handleNavigateInsights}
                  gradient={["#5a4a5a", "#3a2a3a"]}
                  delay={540}
                />
              </View>
            </View>

            {/* ── Upgrade Banner ── */}
            {!isPaid && (
              <Animated.View
                entering={FadeInUp.duration(300).delay(580)}
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

            {/* ── Footer ── */}
            <Animated.View
              entering={FadeInUp.duration(300).delay(620)}
              style={styles.footer}
            >
              <ThemedText
                style={[
                  styles.methodCallout,
                  { color: theme.textSecondary },
                ]}
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

      {/* ── Name Edit Modal ── */}
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
              {"What's your name?"}
            </ThemedText>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundRoot,
                  color: theme.text,
                },
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
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.primary },
                ]}
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
