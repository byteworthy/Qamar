/**
 * HifzRecitationScreen
 *
 * Screen for practicing Quran memorization with hidden verse mode.
 * Users recite from memory, receive feedback, and rate difficulty for spaced repetition.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { HifzMistakeFeedback } from "@/components/HifzMistakeFeedback";
import { HifzPeekOverlay } from "@/components/HifzPeekOverlay";
import { useHifzRecitation } from "@/hooks/useHifzRecitation";
import { useOfflineQuranVerses } from "@/hooks/useOfflineData";
import { useGamification } from "@/stores/gamification-store";
import { QamarColors } from "@/constants/theme/colors";

// ====================================================================
// Types
// ====================================================================

type HifzRecitationParams = {
  HifzRecitation: {
    surahNumber: string;
    verseNumber: string;
    mode?: "review" | "memorize";
  };
};

// ====================================================================
// Component
// ====================================================================

export default function HifzRecitationScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HifzRecitationParams, "HifzRecitation">>();

  // Extract route params
  const { surahNumber, verseNumber, mode = "review" } = route.params;
  const surahNum = parseInt(surahNumber, 10);
  const verseNum = parseInt(verseNumber, 10);

  // Verse data from offline DB
  const { data: verses } = useOfflineQuranVerses(surahNum);
  const verse = verses?.find((v) => v.verse_number === verseNum);

  // Recitation hook
  const {
    isRecording,
    isProcessing,
    result,
    error,
    startRecitation,
    stopRecitation,
    rateAndSave,
    reset,
  } = useHifzRecitation(surahNum, verseNum, verse?.arabic_text);

  // Gamification
  const recordActivity = useGamification((state) => state.recordActivity);

  // Local state
  const [showPeek, setShowPeek] = useState(false);
  const [revealedText, setRevealedText] = useState<string | null>(null);
  const [revealedWordCount, setRevealedWordCount] = useState(0);

  // ============================================================
  // Handlers
  // ============================================================

  const handleRecordPress = useCallback(async () => {
    if (isRecording) {
      await stopRecitation();
    } else {
      await startRecitation();
    }
  }, [isRecording, startRecitation, stopRecitation]);

  const handleHintPress = useCallback(() => {
    setShowPeek(true);
  }, []);

  const handleRevealWord = useCallback(() => {
    const words = (verse?.arabic_text ?? "").split(" ");
    const nextCount = Math.min(revealedWordCount + 1, words.length);
    setRevealedWordCount(nextCount);
    setRevealedText(words.slice(0, nextCount).join(" "));
  }, [verse, revealedWordCount]);

  const handleRevealAyah = useCallback(() => {
    setRevealedText(verse?.arabic_text ?? "");
  }, [verse]);

  const handleDismissPeek = useCallback(() => {
    setShowPeek(false);
  }, []);

  const handleRating = useCallback(
    async (rating: "again" | "hard" | "good" | "easy") => {
      recordActivity("hifz_review_completed");
      rateAndSave(rating);
      // Navigate back after a short delay to show feedback was recorded
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    },
    [recordActivity, rateAndSave, navigation],
  );

  const handleRetry = useCallback(() => {
    reset();
    setRevealedWordCount(0);
    setRevealedText(null);
  }, [reset]);

  // ============================================================
  // Render helpers
  // ============================================================

  const renderHeader = () => (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={styles.headerSection}
    >
      <ThemedText style={[styles.verseReference, { color: theme.text }]}>
        Surah {surahNum}:{verseNum}
      </ThemedText>
      <ThemedText style={[styles.modeIndicator, { color: QamarColors.gold }]}>
        {mode === "review" ? "Review" : "New Memorization"}
      </ThemedText>
      <ThemedText style={[styles.hiddenNotice, { color: theme.textSecondary }]}>
        Verse hidden - recite from memory
      </ThemedText>
    </Animated.View>
  );

  const renderRecordSection = () => (
    <Animated.View
      entering={FadeInUp.duration(400).delay(100)}
      style={styles.recordSection}
    >
      {/* Hint button - only show before recording or after reset */}
      {!result && !isProcessing && (
        <Pressable
          testID="hint-button"
          onPress={handleHintPress}
          style={({ pressed }) => [
            styles.hintButton,
            { borderColor: QamarColors.gold, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather
            name="help-circle"
            size={16}
            color={QamarColors.gold}
            style={styles.hintIcon}
          />
          <ThemedText style={[styles.hintText, { color: QamarColors.gold }]}>
            Need a hint?
          </ThemedText>
        </Pressable>
      )}

      {/* Record button */}
      <Pressable
        testID="record-button"
        onPress={handleRecordPress}
        disabled={isProcessing}
        style={({ pressed }) => [
          styles.recordButton,
          {
            backgroundColor: isRecording ? "#EF4444" : QamarColors.gold,
            opacity: pressed && !isProcessing ? 0.85 : isProcessing ? 0.6 : 1,
          },
        ]}
      >
        {isRecording ? (
          <Feather name="square" size={32} color="#FFFFFF" />
        ) : (
          <Feather name="mic" size={32} color="#FFFFFF" />
        )}
      </Pressable>

      <ThemedText style={[styles.recordHint, { color: theme.textSecondary }]}>
        {isRecording ? "Tap to stop recording" : "Tap to start recording"}
      </ThemedText>

      {/* Processing indicator */}
      {isProcessing && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.processingContainer}
        >
          <ActivityIndicator
            size="small"
            color={QamarColors.gold}
            style={styles.processingSpinner}
          />
          <ThemedText
            style={[styles.processingText, { color: theme.textSecondary }]}
          >
            Processing your recitation...
          </ThemedText>
        </Animated.View>
      )}
    </Animated.View>
  );

  const renderFeedback = () => {
    if (!result) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={styles.feedbackSection}
      >
        <HifzMistakeFeedback result={result} showAITips={false} />
      </Animated.View>
    );
  };

  const renderRatingButtons = () => {
    if (!result) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={styles.ratingSection}
      >
        <ThemedText style={[styles.ratingTitle, { color: theme.text }]}>
          How difficult was this?
        </ThemedText>
        <View style={styles.ratingButtons}>
          <Pressable
            testID="rating-again"
            onPress={() => handleRating("again")}
            style={({ pressed }) => [
              styles.ratingButton,
              styles.ratingAgain,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.ratingButtonText}>Again</ThemedText>
          </Pressable>

          <Pressable
            testID="rating-hard"
            onPress={() => handleRating("hard")}
            style={({ pressed }) => [
              styles.ratingButton,
              styles.ratingHard,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.ratingButtonText}>Hard</ThemedText>
          </Pressable>

          <Pressable
            testID="rating-good"
            onPress={() => handleRating("good")}
            style={({ pressed }) => [
              styles.ratingButton,
              styles.ratingGood,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.ratingButtonText}>Good</ThemedText>
          </Pressable>

          <Pressable
            testID="rating-easy"
            onPress={() => handleRating("easy")}
            style={({ pressed }) => [
              styles.ratingButton,
              styles.ratingEasy,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.ratingButtonText}>Easy</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.errorContainer}
      >
        <GlassCard style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Feather
              name="alert-circle"
              size={20}
              color="#EF4444"
              style={styles.errorIcon}
            />
            <ThemedText style={[styles.errorText, { color: "#EF4444" }]}>
              {error}
            </ThemedText>
          </View>
          <Pressable
            testID="retry-button"
            onPress={handleRetry}
            style={({ pressed }) => [
              styles.retryButton,
              { borderColor: QamarColors.gold, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather
              name="refresh-cw"
              size={16}
              color={QamarColors.gold}
              style={styles.retryIcon}
            />
            <ThemedText style={[styles.retryText, { color: QamarColors.gold }]}>
              Try Again
            </ThemedText>
          </Pressable>
        </GlassCard>
      </Animated.View>
    );
  };

  const renderInstructions = () => {
    if (result || error || isProcessing || isRecording) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={styles.instructionsSection}
      >
        <GlassCard style={styles.instructionsCard}>
          <ThemedText style={[styles.instructionsTitle, { color: theme.text }]}>
            Instructions
          </ThemedText>
          <ThemedText
            style={[styles.instructionsText, { color: theme.textSecondary }]}
          >
            • Tap record when ready to recite{"\n"}• Try to recite the verse
            from memory{"\n"}• Use hints if you get stuck{"\n"}• Rate the
            difficulty after reciting
          </ThemedText>
        </GlassCard>
      </Animated.View>
    );
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <Screen title="Hifz Practice" showBack scrollable>
      <View style={styles.container}>
        {renderHeader()}
        {renderError()}
        {renderInstructions()}
        {renderRecordSection()}
        {renderFeedback()}
        {renderRatingButtons()}
      </View>

      {/* Peek Overlay */}
      <HifzPeekOverlay
        visible={showPeek}
        onRevealWord={handleRevealWord}
        onRevealAyah={handleRevealAyah}
        onDismiss={handleDismissPeek}
        revealedText={revealedText || undefined}
      />
    </Screen>
  );
}

// ====================================================================
// Styles
// ====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },

  // Header
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  verseReference: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  modeIndicator: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  hiddenNotice: {
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "italic",
  },

  // Instructions
  instructionsSection: {
    marginBottom: 24,
  },
  instructionsCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
  },

  // Record section
  recordSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  hintIcon: {
    marginRight: 6,
  },
  hintText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  recordHint: {
    fontSize: 14,
    fontWeight: "500",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  processingSpinner: {
    marginRight: 8,
  },
  processingText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Feedback
  feedbackSection: {
    marginBottom: 24,
  },

  // Rating
  ratingSection: {
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: "row",
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ratingAgain: {
    backgroundColor: "#EF4444",
  },
  ratingHard: {
    backgroundColor: "#F59E0B",
  },
  ratingGood: {
    backgroundColor: "#3B82F6",
  },
  ratingEasy: {
    backgroundColor: "#10B981",
  },

  // Error
  errorContainer: {
    marginBottom: 24,
  },
  errorCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryIcon: {
    marginRight: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
