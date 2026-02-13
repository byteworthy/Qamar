import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import {
  useQuranVerses,
  useQuranSurahs,
  useCreateBookmark,
  useQuranBookmarks,
  useDeleteBookmark,
  Verse,
} from "@/hooks/useQuranData";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RouteType } from "@/navigation/types";

interface VerseCardProps {
  verse: Verse;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  index: number;
}

function VerseCard({
  verse,
  isBookmarked,
  onBookmarkToggle,
  index,
}: VerseCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(index * 30)}>
      <GlassCard style={styles.verseCard}>
        <View style={styles.verseHeader}>
          <View
            style={[
              styles.verseNumberCircle,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <ThemedText
              style={[styles.verseNumber, { color: theme.primary }]}
            >
              {verse.verseNumber}
            </ThemedText>
          </View>

          <Pressable
            onPress={onBookmarkToggle}
            style={styles.bookmarkButton}
            accessibilityLabel={
              isBookmarked ? "Remove bookmark" : "Add bookmark"
            }
            accessibilityRole="button"
          >
            <Feather
              name={isBookmarked ? "heart" : "heart"}
              size={20}
              color={isBookmarked ? theme.primary : theme.textSecondary}
              style={{ opacity: isBookmarked ? 1 : 0.5 }}
            />
          </Pressable>
        </View>

        <ThemedText
          style={[
            styles.verseArabic,
            { fontFamily: "Amiri-Regular", lineHeight: 48 },
          ]}
        >
          {verse.textArabic}
        </ThemedText>

        <ThemedText
          style={[styles.verseEnglish, { color: theme.textSecondary }]}
        >
          {verse.textEnglish}
        </ThemedText>
      </GlassCard>
    </Animated.View>
  );
}

export default function VerseReaderScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteType<"VerseReader">>();
  const { surahId } = route.params;

  const { data: surahs } = useQuranSurahs();
  const { data: verses, isLoading, error } = useQuranVerses(surahId);
  const { data: bookmarks } = useQuranBookmarks();
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  // Find current surah
  const currentSurah = useMemo(
    () => surahs?.find((s) => s.id === surahId),
    [surahs, surahId]
  );

  // Check if verse is bookmarked
  const isVerseBookmarked = (verseNumber: number) => {
    return bookmarks?.some(
      (b) => b.surahId === surahId && b.verseNumber === verseNumber
    );
  };

  // Get bookmark ID for a verse
  const getBookmarkId = (verseNumber: number) => {
    return bookmarks?.find(
      (b) => b.surahId === surahId && b.verseNumber === verseNumber
    )?.id;
  };

  const handleBookmarkToggle = (verseNumber: number) => {
    const bookmarkId = getBookmarkId(verseNumber);

    if (bookmarkId) {
      deleteBookmark.mutate(bookmarkId);
    } else {
      createBookmark.mutate({ surahId, verseNumber });
    }
  };

  // Show bismillah at top (except for Surah 9 - At-Tawbah)
  const shouldShowBismillah = surahId !== 9;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading verses...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load verses
          </ThemedText>
          <ThemedText style={[styles.errorSubtext, { color: theme.textSecondary }]}>
            Please check your connection and try again
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={verses}
        keyExtractor={(item) => `${item.surahId}-${item.verseNumber}`}
        renderItem={({ item, index }) => (
          <VerseCard
            verse={item}
            isBookmarked={!!isVerseBookmarked(item.verseNumber)}
            onBookmarkToggle={() => handleBookmarkToggle(item.verseNumber)}
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Surah Info */}
            {currentSurah && (
              <Animated.View entering={FadeInUp.duration(300)}>
                <GlassCard style={styles.surahInfoCard} elevated>
                  <ThemedText
                    style={[
                      styles.surahNameArabic,
                      { fontFamily: "Amiri-Bold" },
                    ]}
                  >
                    {currentSurah.name}
                  </ThemedText>
                  <ThemedText style={styles.surahNameEnglish}>
                    {currentSurah.transliteration}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.surahTranslation,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {currentSurah.translation}
                  </ThemedText>
                  <View style={styles.surahMeta}>
                    <View
                      style={[
                        styles.revelationBadge,
                        {
                          backgroundColor:
                            currentSurah.revelationPlace === "Makkah"
                              ? "rgba(212, 175, 55, 0.15)"
                              : "rgba(0, 150, 136, 0.15)",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.revelationText,
                          {
                            color:
                              currentSurah.revelationPlace === "Makkah"
                                ? theme.primary
                                : theme.accent,
                          },
                        ]}
                      >
                        {currentSurah.revelationPlace}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.versesCount,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {currentSurah.numberOfVerses} verses
                    </ThemedText>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            {/* Bismillah */}
            {shouldShowBismillah && (
              <Animated.View entering={FadeInUp.duration(350).delay(100)}>
                <GlassCard style={styles.bismillahCard}>
                  <ThemedText
                    style={[
                      styles.bismillah,
                      { fontFamily: "Amiri-Bold", color: theme.primary },
                    ]}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </ThemedText>
                </GlassCard>
              </Animated.View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No verses available
            </ThemedText>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    gap: 12,
    marginBottom: 12,
  },
  surahInfoCard: {
    alignItems: "center",
    padding: 20,
  },
  surahNameArabic: {
    fontSize: 32,
    lineHeight: 42,
    textAlign: "center",
    marginBottom: 4,
  },
  surahNameEnglish: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  surahMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  revelationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  revelationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  versesCount: {
    fontSize: 13,
  },
  bismillahCard: {
    padding: 20,
    alignItems: "center",
  },
  bismillah: {
    fontSize: 28,
    lineHeight: 40,
    textAlign: "center",
  },
  verseCard: {
    padding: 16,
    gap: 12,
  },
  verseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  verseNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookmarkButton: {
    padding: 8,
  },
  verseArabic: {
    fontSize: 26,
    textAlign: "right",
    writingDirection: "rtl",
  },
  verseEnglish: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
