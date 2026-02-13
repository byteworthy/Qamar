import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { useHadithById } from "@/hooks/useHadithData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RouteType } from "@/navigation/types";

export default function HadithDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteType<"HadithDetail">>();
  const { hadithId } = route.params;
  const { data: hadith, isLoading, error } = useHadithById(hadithId);

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading hadith...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error || !hadith) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load hadith
          </ThemedText>
          <ThemedText
            style={[styles.errorSubtext, { color: theme.textSecondary }]}
          >
            Please check your connection and try again
          </ThemedText>
        </View>
      </View>
    );
  }

  const gradeColor =
    hadith.grade === "Sahih"
      ? "#4CAF50"
      : hadith.grade === "Hasan"
        ? "#2196F3"
        : "#9E9E9E";

  const collectionName =
    hadith.collection === "bukhari"
      ? "Sahih al-Bukhari"
      : hadith.collection === "muslim"
        ? "Sahih Muslim"
        : hadith.collection === "tirmidhi"
          ? "Jami at-Tirmidhi"
          : hadith.collection;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom, paddingTop: 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference & Grade */}
        <Animated.View entering={FadeInUp.duration(350).delay(0)}>
          <View style={styles.referenceRow}>
            <View
              style={[
                styles.referenceBadge,
                { backgroundColor: "rgba(212, 175, 55, 0.15)" },
              ]}
            >
              <Feather
                name="book"
                size={14}
                color={theme.primary}
                style={{ marginRight: 6 }}
              />
              <ThemedText
                style={[styles.referenceText, { color: theme.primary }]}
              >
                {collectionName} #{hadith.hadithNumber}
              </ThemedText>
            </View>

            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: `${gradeColor}20` },
              ]}
            >
              <ThemedText style={[styles.gradeText, { color: gradeColor }]}>
                {hadith.grade}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Arabic Text */}
        <Animated.View entering={FadeInUp.duration(350).delay(100)}>
          <GlassCard style={styles.arabicCard} elevated>
            <ThemedText
              style={[styles.arabicText, { fontFamily: "Amiri-Bold" }]}
            >
              {hadith.textArabic}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* English Translation */}
        <Animated.View entering={FadeInUp.duration(350).delay(200)}>
          <GlassCard style={styles.translationCard} elevated>
            <View style={styles.sectionHeader}>
              <Feather name="globe" size={16} color={theme.textSecondary} />
              <ThemedText
                style={[
                  styles.sectionTitle,
                  { color: theme.textSecondary },
                ]}
              >
                Translation
              </ThemedText>
            </View>
            <ThemedText style={[styles.englishText, { color: theme.text }]}>
              {hadith.textEnglish}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Narrator Chain */}
        <Animated.View entering={FadeInUp.duration(350).delay(300)}>
          <GlassCard style={styles.narratorCard} elevated>
            <View style={styles.sectionHeader}>
              <Feather name="user" size={16} color={theme.textSecondary} />
              <ThemedText
                style={[
                  styles.sectionTitle,
                  { color: theme.textSecondary },
                ]}
              >
                Narrator
              </ThemedText>
            </View>
            <ThemedText style={[styles.narratorText, { color: theme.text }]}>
              {hadith.narrator}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Topics */}
        {hadith.topics.length > 0 && (
          <Animated.View entering={FadeInUp.duration(350).delay(400)}>
            <GlassCard style={styles.topicsCard} elevated>
              <View style={styles.sectionHeader}>
                <Feather name="tag" size={16} color={theme.textSecondary} />
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  Topics
                </ThemedText>
              </View>
              <View style={styles.topicsContainer}>
                {hadith.topics.map((topic) => (
                  <View
                    key={topic}
                    style={[
                      styles.topicBadge,
                      { backgroundColor: "rgba(212, 175, 55, 0.10)" },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.topicText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {topic}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  referenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  referenceText: {
    fontSize: 13,
    fontWeight: "600",
  },
  gradeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  arabicCard: {
    padding: 24,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
  },
  translationCard: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  englishText: {
    fontSize: 16,
    lineHeight: 26,
  },
  narratorCard: {
    padding: 20,
  },
  narratorText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  topicsCard: {
    padding: 20,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topicText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
