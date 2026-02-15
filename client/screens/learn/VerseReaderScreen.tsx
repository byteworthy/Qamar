import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import {
  useQuranVerses,
  useQuranSurahs,
  useCreateBookmark,
  useQuranBookmarks,
  useDeleteBookmark,
  useQuranAudio,
  Verse,
} from "@/hooks/useQuranData";
import { useQuranAudio as useQuranAudioPlayer, RECITERS, Reciter } from "@/hooks/useQuranAudio";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { PremiumGate } from "@/components/PremiumGate";
import { RouteType } from "@/navigation/types";

// =============================================================================
// VERSE CARD
// =============================================================================

interface VerseCardProps {
  verse: Verse;
  isBookmarked: boolean;
  isCurrentlyPlaying: boolean;
  onBookmarkToggle: () => void;
  onPlayVerse: () => void;
  index: number;
}

function VerseCard({
  verse,
  isBookmarked,
  isCurrentlyPlaying,
  onBookmarkToggle,
  onPlayVerse,
  index,
}: VerseCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(index * 30)}>
      <GlassCard
        style={{
          ...styles.verseCard,
          ...(isCurrentlyPlaying ? {
            borderLeftWidth: 3,
            borderLeftColor: theme.primary,
            backgroundColor: theme.primary + "08",
          } : {}),
        }}
      >
        <View style={styles.verseHeader}>
          <View
            style={[
              styles.verseNumberCircle,
              {
                backgroundColor: isCurrentlyPlaying
                  ? theme.primary + "30"
                  : theme.primary + "20",
              },
            ]}
          >
            <ThemedText
              style={[styles.verseNumber, { color: theme.primary }]}
            >
              {verse.verseNumber}
            </ThemedText>
          </View>

          <View style={styles.verseActions}>
            <Pressable
              onPress={onPlayVerse}
              style={styles.actionButton}
              accessibilityLabel={`Play verse ${verse.verseNumber}`}
              accessibilityRole="button"
            >
              <Feather
                name={isCurrentlyPlaying ? "volume-2" : "play-circle"}
                size={20}
                color={isCurrentlyPlaying ? theme.primary : theme.textSecondary}
              />
            </Pressable>

            <Pressable
              onPress={onBookmarkToggle}
              style={styles.actionButton}
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

// =============================================================================
// RECITER SELECTOR MODAL
// =============================================================================

interface ReciterSelectorProps {
  visible: boolean;
  currentReciterId: string;
  onSelect: (reciterId: string) => void;
  onClose: () => void;
}

function ReciterSelector({
  visible,
  currentReciterId,
  onSelect,
  onClose,
}: ReciterSelectorProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.reciterModal,
            { backgroundColor: theme.backgroundRoot },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText style={styles.reciterModalTitle}>
            Select Reciter
          </ThemedText>

          {RECITERS.map((reciter) => {
            const isSelected = reciter.id === currentReciterId;
            return (
              <Pressable
                key={reciter.id}
                style={[
                  styles.reciterOption,
                  isSelected && {
                    backgroundColor: theme.primary + "15",
                    borderColor: theme.primary + "40",
                  },
                  { borderColor: theme.textSecondary + "20" },
                ]}
                onPress={() => {
                  onSelect(reciter.id);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.reciterInfo}>
                  <ThemedText style={styles.reciterName}>
                    {reciter.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.reciterNameArabic,
                      { color: theme.textSecondary, fontFamily: "Amiri-Regular" },
                    ]}
                  >
                    {reciter.nameArabic}
                  </ThemedText>
                </View>
                {isSelected && (
                  <Feather name="check-circle" size={20} color={theme.primary} />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function VerseReaderScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteType<"VerseReader">>();
  const { surahId } = route.params;

  const { data: surahs } = useQuranSurahs();
  const { data: verses, isLoading, error } = useQuranVerses(surahId);
  const { data: bookmarks } = useQuranBookmarks();
  const { data: audioData, isLoading: isAudioLoading } = useQuranAudio(surahId);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  // Quran audio player (new hook with verse-level controls)
  const audio = useQuranAudioPlayer();

  // Reciter selector
  const [reciterModalVisible, setReciterModalVisible] = useState(false);

  // FlatList ref for auto-scroll
  const flatListRef = useRef<FlatList>(null);

  // Find current surah
  const currentSurah = useMemo(
    () => surahs?.find((s) => s.id === surahId),
    [surahs, surahId]
  );

  // Auto-scroll to currently playing verse
  useEffect(() => {
    if (
      audio.isPlaying &&
      audio.currentVerse &&
      audio.currentSurah === surahId &&
      verses?.length
    ) {
      const index = verses.findIndex(
        (v) => v.verseNumber === audio.currentVerse
      );
      if (index >= 0 && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
        });
      }
    }
  }, [audio.currentVerse, audio.isPlaying, audio.currentSurah, surahId, verses]);

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

  // Audio controls
  const handlePlayPause = async () => {
    if (audio.isPlaying) {
      await audio.pause();
    } else if (audio.position > 0 && audio.currentSurah === surahId) {
      await audio.resume();
    } else {
      // Start from first verse (or resume from where we were)
      await audio.playSurah(surahId, 1);
    }
  };

  const handlePlayVerse = useCallback(
    async (verseNumber: number) => {
      await audio.playVerse(surahId, verseNumber);
    },
    [surahId, audio]
  );

  const handleStop = async () => {
    await audio.stop();
  };

  const handleNextVerse = async () => {
    await audio.nextVerse();
  };

  const handlePreviousVerse = async () => {
    await audio.previousVerse();
  };

  const handleReciterSelect = async (reciterId: string) => {
    await audio.setReciter(reciterId);
  };

  // Format time in mm:ss
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = audio.duration > 0 ? audio.position / audio.duration : 0;

  // Is this surah's audio currently active?
  const isThisSurahActive = audio.currentSurah === surahId;

  // Show bismillah at top (except for Surah 9 - At-Tawbah)
  const shouldShowBismillah = surahId !== 9;

  // Handle scrollToIndex failures gracefully
  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      // Scroll to approximate position first, then retry
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
    },
    []
  );

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
            Loading verses...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText style={[styles.errorText, { color: theme.error }]}>
            Failed to load verses
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => `${item.surahId}-${item.verseNumber}`}
        renderItem={({ item, index }) => (
          <VerseCard
            verse={item}
            isBookmarked={!!isVerseBookmarked(item.verseNumber)}
            isCurrentlyPlaying={
              isThisSurahActive && audio.currentVerse === item.verseNumber
            }
            onBookmarkToggle={() => handleBookmarkToggle(item.verseNumber)}
            onPlayVerse={() => handlePlayVerse(item.verseNumber)}
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: audioData
              ? 220 + insets.bottom
              : 100 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={onScrollToIndexFailed}
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
                    {"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650"}
                  </ThemedText>
                </GlassCard>
              </Animated.View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={48} color={theme.textSecondary} />
            <ThemedText
              style={[styles.emptyText, { color: theme.textSecondary }]}
            >
              No verses available
            </ThemedText>
          </View>
        }
      />

      {/* Audio Player Bar */}
      {audioData && (
        <PremiumGate requiredTier="plus" featureName="Quran Audio Recitation">
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[
              styles.audioPlayerContainer,
              { bottom: insets.bottom + 16 },
            ]}
          >
            <GlassCard style={styles.audioPlayer} elevated>
              {/* Header: reciter name + selector */}
              <View style={styles.audioHeader}>
                <Feather name="music" size={18} color={theme.primary} />
                <ThemedText style={styles.audioTitle} numberOfLines={1}>
                  {currentSurah?.transliteration || "Recitation"}
                </ThemedText>
                <Pressable
                  onPress={() => setReciterModalVisible(true)}
                  style={[
                    styles.reciterBadge,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                  accessibilityLabel="Change reciter"
                  accessibilityRole="button"
                >
                  <ThemedText
                    style={[styles.reciterBadgeText, { color: theme.primary }]}
                    numberOfLines={1}
                  >
                    {audio.reciter.name.split(" ").slice(-1)[0]}
                  </ThemedText>
                  <Feather name="chevron-down" size={12} color={theme.primary} />
                </Pressable>
              </View>

              {/* Currently playing verse indicator */}
              {isThisSurahActive && audio.currentVerse && (
                <ThemedText
                  style={[styles.verseIndicator, { color: theme.textSecondary }]}
                >
                  Verse {audio.currentVerse}
                </ThemedText>
              )}

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Pressable
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.textSecondary + "20" },
                  ]}
                  onPress={async (e) => {
                    if (audio.duration > 0) {
                      const { locationX } = e.nativeEvent;
                      // Get approximate bar width (container - padding)
                      const barWidth = 300; // approximate
                      const seekRatio = Math.max(0, Math.min(1, locationX / barWidth));
                      await audio.seekTo(seekRatio * audio.duration);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${progress * 100}%`,
                      },
                    ]}
                  />
                </Pressable>
                <View style={styles.timeLabels}>
                  <ThemedText
                    style={[styles.timeText, { color: theme.textSecondary }]}
                  >
                    {formatTime(audio.position)}
                  </ThemedText>
                  <ThemedText
                    style={[styles.timeText, { color: theme.textSecondary }]}
                  >
                    {formatTime(audio.duration)}
                  </ThemedText>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.audioControls}>
                {audio.isLoading || isAudioLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    {/* Stop */}
                    <Pressable
                      onPress={handleStop}
                      style={styles.controlButton}
                      disabled={!audio.isPlaying && audio.position === 0}
                      accessibilityLabel="Stop"
                    >
                      <Feather
                        name="square"
                        size={20}
                        color={
                          !audio.isPlaying && audio.position === 0
                            ? theme.textSecondary + "40"
                            : theme.textSecondary
                        }
                      />
                    </Pressable>

                    {/* Previous verse */}
                    <Pressable
                      onPress={handlePreviousVerse}
                      style={styles.controlButton}
                      disabled={!isThisSurahActive}
                      accessibilityLabel="Previous verse"
                    >
                      <Feather
                        name="skip-back"
                        size={20}
                        color={
                          isThisSurahActive
                            ? theme.textSecondary
                            : theme.textSecondary + "40"
                        }
                      />
                    </Pressable>

                    {/* Play / Pause */}
                    <Pressable
                      onPress={handlePlayPause}
                      style={[
                        styles.playButton,
                        { backgroundColor: theme.primary },
                      ]}
                      accessibilityLabel={audio.isPlaying ? "Pause" : "Play"}
                    >
                      <Feather
                        name={audio.isPlaying ? "pause" : "play"}
                        size={28}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    {/* Next verse */}
                    <Pressable
                      onPress={handleNextVerse}
                      style={styles.controlButton}
                      disabled={!isThisSurahActive}
                      accessibilityLabel="Next verse"
                    >
                      <Feather
                        name="skip-forward"
                        size={20}
                        color={
                          isThisSurahActive
                            ? theme.textSecondary
                            : theme.textSecondary + "40"
                        }
                      />
                    </Pressable>

                    {/* Placeholder for symmetry */}
                    <View style={styles.controlButton} />
                  </>
                )}
              </View>

              {/* Error Message */}
              {audio.error && (
                <ThemedText
                  style={[styles.errorMessage, { color: theme.error }]}
                >
                  {audio.error}
                </ThemedText>
              )}
            </GlassCard>
          </Animated.View>
        </PremiumGate>
      )}

      {/* Reciter Selector Modal */}
      <ReciterSelector
        visible={reciterModalVisible}
        currentReciterId={audio.reciter.id}
        onSelect={handleReciterSelect}
        onClose={() => setReciterModalVisible(false)}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

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
  verseActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    padding: 8,
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
  // Audio player bar
  audioPlayerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  audioPlayer: {
    padding: 16,
    gap: 10,
  },
  audioHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  reciterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  reciterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  verseIndicator: {
    fontSize: 12,
    textAlign: "center",
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 11,
  },
  audioControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    padding: 8,
    width: 36,
    alignItems: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorMessage: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  // Reciter modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  reciterModal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  reciterModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  reciterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reciterInfo: {
    flex: 1,
    gap: 2,
  },
  reciterName: {
    fontSize: 15,
    fontWeight: "600",
  },
  reciterNameArabic: {
    fontSize: 16,
  },
});
