import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { FeatureCard } from "@/components/FeatureCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useArabicProgress } from "@/hooks/useArabicLearning";
import { useShallow } from "zustand/react/shallow";
import { useAppState, selectDailyProgress } from "@/stores/app-state";
import { BorderRadius } from "@/constants/theme";
import { NoorColors } from "@/constants/theme/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LearnTabScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: progress } = useArabicProgress();
  const dailyProgress = useAppState(useShallow(selectDailyProgress));

  const features = [
    {
      title: "Ask Amar",
      description:
        "Your Islamic knowledge companion — ask anything about Islam",
      gradient: ["#4a5a3a", "#7a8a6a"],
      icon: "message-circle" as const,
      screen: "AskAmar" as const,
      comingSoon: false,
    },
    {
      title: "Quran Reader",
      description: "Read and explore the Holy Quran with translations",
      gradient: ["#3a5a4a", "#6a8a7a"],
      icon: "book-open" as const,
      screen: "QuranReader" as const,
      comingSoon: false,
      offlineReady: true,
    },
    {
      title: "Hifz Memorization",
      description:
        "Memorize the Quran with spaced repetition and personalized feedback",
      gradient: ["#2a4a5a", "#5a7a8a"],
      icon: "book" as const,
      screen: "HifzDashboard" as const,
      comingSoon: false,
    },
    {
      title: "Arabic Learning",
      description:
        "Learn Arabic with interactive flashcards and spaced repetition",
      gradient: ["#5a4a3a", "#8a7a6a"],
      icon: "edit-3" as const,
      screen: "ArabicLearning" as const,
      comingSoon: false,
      offlineReady: true,
    },
    {
      title: "Hadith Library",
      description: "Browse authenticated Hadith collections",
      gradient: ["#3a4a5a", "#6a7a8a"],
      icon: "file-text" as const,
      screen: "HadithLibrary" as const,
      comingSoon: false,
    },
    {
      title: "Arabic Alphabet",
      description: "Master the 28 letters of Arabic script with letter forms",
      gradient: ["#4a3a5a", "#7a6a8a"],
      icon: "grid" as const,
      screen: "AlphabetGrid" as const,
      comingSoon: false,
      offlineReady: true,
    },
    {
      title: "Arabic Tutor",
      description:
        "Arabic language tutor with vocabulary, grammar & conversation",
      gradient: ["#4a5a4a", "#6a8a6a"],
      icon: "message-square" as const,
      screen: "ArabicTutor" as const,
      comingSoon: false,
    },
    {
      title: "Pronunciation Coach",
      description:
        "Record your recitation and get real-time pronunciation feedback",
      gradient: ["#5a3a4a", "#8a6a7a"],
      icon: "mic" as const,
      screen: "PronunciationCoach" as const,
      comingSoon: false,
    },
    {
      title: "Travel Translator",
      description:
        "Offline phrasebook & translator for English and Spanish speakers",
      gradient: ["#2d4a3e", "#4a7a6a"],
      icon: "map" as const,
      screen: "TravelTranslator" as const,
      comingSoon: false,
    },
    {
      title: "Translator",
      description:
        "Arabic ↔ English translation with transliteration and detailed explanations",
      gradient: ["#3a4a4a", "#6a7a7a"],
      icon: "globe" as const,
      screen: "Translator" as const,
      comingSoon: false,
    },
    {
      title: "Find a Dua",
      description: "Get personalized dua recommendations for any situation",
      gradient: ["#5a3a3a", "#8a6a5a"],
      icon: "heart" as const,
      screen: "DuaFinder" as const,
      comingSoon: false,
    },
    {
      title: "My Study Plan",
      description:
        "Personalized weekly Quran study plan that adapts to your pace",
      gradient: ["#3a4a5a", "#6a7a8a"],
      icon: "calendar" as const,
      screen: "StudyPlan" as const,
      comingSoon: false,
    },
  ];

  return (
    <View
      testID="learn-screen"
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Learn</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Islamic knowledge and Arabic language
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
        {/* Daily Learning Streak / Progress */}
        <Animated.View entering={FadeInUp.duration(350).delay(50)}>
          <GlassCard style={styles.streakCard}>
            <View style={styles.streakRow}>
              <View style={styles.streakLeft}>
                <View style={styles.streakIconBadge}>
                  <Feather name="zap" size={20} color={NoorColors.gold} />
                </View>
                <View>
                  <ThemedText style={styles.streakTitle}>
                    Daily Progress
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.streakSubtext,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {dailyProgress.completed} / {dailyProgress.goal} reviews
                    today
                  </ThemedText>
                </View>
              </View>
              <View style={styles.streakRight}>
                <ThemedText
                  style={[styles.streakCount, { color: NoorColors.gold }]}
                >
                  {progress?.streak ?? 0}
                </ThemedText>
                <ThemedText
                  style={[styles.streakLabel, { color: theme.textSecondary }]}
                >
                  streak
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.streakProgressBar,
                { backgroundColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.streakProgressFill,
                  {
                    width: `${Math.min(dailyProgress.percentage, 100)}%`,
                    backgroundColor: NoorColors.gold,
                  },
                ]}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Feature Cards */}
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
                  navigation.navigate(feature.screen as any);
                }
              }}
              delay={120 + index * 80}
              comingSoon={feature.comingSoon}
              offlineReady={feature.offlineReady}
              testID={
                feature.screen === "QuranReader"
                  ? "learn-quran-card"
                  : feature.screen === "HifzDashboard"
                    ? "learn-hifz-card"
                    : feature.screen === "ArabicTutor"
                      ? "learn-arabic-tutor-card"
                      : feature.screen === "PronunciationCoach"
                        ? "learn-pronunciation-card"
                        : feature.screen === "Translator"
                          ? "learn-translator-card"
                          : feature.screen === "StudyPlan"
                            ? "learn-study-plan-card"
                            : undefined
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  headerSubtitle: { fontSize: 16, lineHeight: 22 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  // Streak card
  streakCard: { marginBottom: 20 },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  streakIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: { fontSize: 16, fontWeight: "700" },
  streakSubtext: { fontSize: 13, marginTop: 2 },
  streakRight: { alignItems: "center" },
  streakCount: { fontSize: 28, fontWeight: "700" },
  streakLabel: { fontSize: 12 },
  streakProgressBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  streakProgressFill: { height: "100%", borderRadius: 3 },

  // Feature cards
  featuresGrid: { gap: 16 },
});
