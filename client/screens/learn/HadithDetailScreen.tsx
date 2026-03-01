import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { useHadithById } from "@/hooks/useHadithData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RouteType } from "@/navigation/types";

const BOOKMARKS_KEY = "@noor_hadith_bookmarks";

const COLLECTION_NAMES: Record<string, string> = {
  bukhari: "Sahih al-Bukhari",
  muslim: "Sahih Muslim",
  tirmidhi: "Jami at-Tirmidhi",
  abudawud: "Sunan Abu Dawud",
  nasai: "Sunan an-Nasa'i",
  ibnmajah: "Sunan Ibn Majah",
};

export default function HadithDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteType<"HadithDetail">>();
  const { hadithId } = route.params;
  const { data: hadith, isLoading, error } = useHadithById(hadithId);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load bookmark state
  useEffect(() => {
    AsyncStorage.getItem(BOOKMARKS_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const bookmarks: string[] = JSON.parse(raw);
            setIsBookmarked(bookmarks.includes(hadithId));
          } catch {
            // silently fail on corrupt data
          }
        }
      })
      .catch(() => {});
  }, [hadithId]);

  const toggleBookmark = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
      const bookmarks: string[] = raw ? JSON.parse(raw) : [];
      let updated: string[];
      if (bookmarks.includes(hadithId)) {
        updated = bookmarks.filter((id) => id !== hadithId);
        setIsBookmarked(false);
      } else {
        updated = [...bookmarks, hadithId];
        setIsBookmarked(true);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch {
      Alert.alert("Error", "Could not update bookmark.");
    }
  }, [hadithId]);

  const handleShare = useCallback(async () => {
    if (!hadith) return;
    const collectionName =
      COLLECTION_NAMES[hadith.collection] ?? hadith.collection;
    const text = [
      hadith.textArabic,
      "",
      hadith.textEnglish,
      "",
      `- ${hadith.narrator}`,
      `[${collectionName}, Hadith #${hadith.hadithNumber}]`,
      "",
      "Shared via Qamar",
    ].join("\n");

    try {
      await Share.share({ message: text });
    } catch {
      // user cancelled
    }
  }, [hadith]);

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
        ? "#FF9800"
        : "#f44336";

  const collectionName =
    COLLECTION_NAMES[hadith.collection] ?? hadith.collection;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom, paddingTop: 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference, Grade & Actions */}
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

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={toggleBookmark}
              style={[
                styles.actionButton,
                {
                  backgroundColor: isBookmarked
                    ? "rgba(212, 175, 55, 0.15)"
                    : "transparent",
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name={isBookmarked ? "bookmark" : "bookmark"}
                size={18}
                color={isBookmarked ? "#D4AF37" : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  {
                    color: isBookmarked ? "#D4AF37" : theme.textSecondary,
                  },
                ]}
              >
                {isBookmarked ? "Saved" : "Save"}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleShare}
              style={[styles.actionButton, { borderColor: theme.border }]}
            >
              <Feather name="share-2" size={18} color={theme.textSecondary} />
              <ThemedText
                style={[styles.actionText, { color: theme.textSecondary }]}
              >
                Share
              </ThemedText>
            </Pressable>
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
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
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
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                Narrator
              </ThemedText>
            </View>
            <ThemedText style={[styles.narratorText, { color: theme.text }]}>
              {hadith.narrator}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Metadata */}
        <Animated.View entering={FadeInUp.duration(350).delay(350)}>
          <GlassCard style={styles.metadataCard} elevated>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={16} color={theme.textSecondary} />
              <ThemedText
                style={[styles.sectionTitle, { color: theme.textSecondary }]}
              >
                Reference
              </ThemedText>
            </View>
            <View style={styles.metadataGrid}>
              <View style={styles.metadataItem}>
                <ThemedText
                  style={[styles.metadataLabel, { color: theme.textSecondary }]}
                >
                  Collection
                </ThemedText>
                <ThemedText
                  style={[styles.metadataValue, { color: theme.text }]}
                >
                  {collectionName}
                </ThemedText>
              </View>
              {hadith.bookNumber > 0 && (
                <View style={styles.metadataItem}>
                  <ThemedText
                    style={[
                      styles.metadataLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Book
                  </ThemedText>
                  <ThemedText
                    style={[styles.metadataValue, { color: theme.text }]}
                  >
                    {hadith.bookNumber}
                  </ThemedText>
                </View>
              )}
              <View style={styles.metadataItem}>
                <ThemedText
                  style={[styles.metadataLabel, { color: theme.textSecondary }]}
                >
                  Hadith No.
                </ThemedText>
                <ThemedText
                  style={[styles.metadataValue, { color: theme.text }]}
                >
                  {hadith.hadithNumber}
                </ThemedText>
              </View>
              <View style={styles.metadataItem}>
                <ThemedText
                  style={[styles.metadataLabel, { color: theme.textSecondary }]}
                >
                  Grade
                </ThemedText>
                <ThemedText
                  style={[styles.metadataValue, { color: gradeColor }]}
                >
                  {hadith.grade}
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Topics */}
        {hadith.topics.length > 0 && (
          <Animated.View entering={FadeInUp.duration(350).delay(400)}>
            <GlassCard style={styles.topicsCard} elevated>
              <View style={styles.sectionHeader}>
                <Feather name="tag" size={16} color={theme.textSecondary} />
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
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
                      style={[styles.topicText, { color: theme.textSecondary }]}
                    >
                      {topic}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Citation Footer */}
        <Animated.View entering={FadeInUp.duration(350).delay(450)}>
          <View style={styles.citationContainer}>
            <ThemedText
              style={[styles.citationText, { color: theme.textSecondary }]}
            >
              {collectionName}, Book {hadith.bookNumber || "-"}, Hadith{" "}
              {hadith.hadithNumber}. Graded {hadith.grade}.
            </ThemedText>
          </View>
        </Animated.View>
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
  // Actions
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Arabic
  arabicCard: {
    padding: 24,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
  },
  // Translation
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
  // Narrator
  narratorCard: {
    padding: 20,
  },
  narratorText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  // Metadata
  metadataCard: {
    padding: 20,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metadataItem: {
    minWidth: "40%",
    gap: 2,
  },
  metadataLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Topics
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
  // Citation
  citationContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  citationText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
  },
});
