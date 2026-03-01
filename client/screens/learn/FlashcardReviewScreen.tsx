import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { useEntitlements } from "@/hooks/useEntitlements";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { PremiumGate } from "@/components/PremiumGate";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  useDueFlashcards,
  useSubmitReview,
  Flashcard,
  ReviewResult,
} from "@/hooks/useArabicLearning";
import { useAppState } from "@/stores/app-state";
import { BorderRadius, Fonts } from "@/constants/theme";
import { NoorColors } from "@/constants/theme/colors";
import { TTSButton } from "@/components/TTSButton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.45;

// ---------------------------------------------------------------------------
// Rating Button
// ---------------------------------------------------------------------------

interface RatingButtonProps {
  label: string;
  subtitle: string;
  color: string;
  rating: 1 | 2 | 3 | 4;
  disabled: boolean;
  onPress: (rating: 1 | 2 | 3 | 4) => void;
}

function RatingButton({
  label,
  subtitle,
  color,
  rating,
  disabled,
  onPress,
}: RatingButtonProps) {
  return (
    <Pressable
      onPress={() => onPress(rating)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.ratingButton,
        {
          backgroundColor: color,
          opacity: disabled ? 0.3 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.95 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Rate as ${label}`}
    >
      <ThemedText style={styles.ratingButtonText}>{label}</ThemedText>
      <ThemedText style={styles.ratingSubtext}>{subtitle}</ThemedText>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Session Complete View
// ---------------------------------------------------------------------------

interface SessionCompleteProps {
  reviewed: number;
  correct: number;
  onDone: () => void;
}

function SessionComplete({ reviewed, correct, onDone }: SessionCompleteProps) {
  const { theme } = useTheme();
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.sessionComplete}
    >
      <Feather name="award" size={64} color={NoorColors.gold} />
      <ThemedText style={styles.sessionTitle}>Session Complete!</ThemedText>
      <ThemedText
        style={[styles.sessionSubtitle, { color: theme.textSecondary }]}
      >
        Great work on your Arabic learning
      </ThemedText>

      <View style={styles.sessionStatsGrid}>
        <View
          style={[
            styles.sessionStatCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <ThemedText style={styles.sessionStatValue}>{reviewed}</ThemedText>
          <ThemedText
            style={[styles.sessionStatLabel, { color: theme.textSecondary }]}
          >
            Reviewed
          </ThemedText>
        </View>
        <View
          style={[
            styles.sessionStatCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <ThemedText style={[styles.sessionStatValue, { color: "#38A169" }]}>
            {correct}
          </ThemedText>
          <ThemedText
            style={[styles.sessionStatLabel, { color: theme.textSecondary }]}
          >
            Correct
          </ThemedText>
        </View>
        <View
          style={[
            styles.sessionStatCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <ThemedText
            style={[styles.sessionStatValue, { color: NoorColors.gold }]}
          >
            {accuracy}%
          </ThemedText>
          <ThemedText
            style={[styles.sessionStatLabel, { color: theme.textSecondary }]}
          >
            Accuracy
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={onDone}
        style={({ pressed }) => [
          styles.doneButton,
          { backgroundColor: NoorColors.gold, opacity: pressed ? 0.9 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <ThemedText style={styles.doneButtonText}>Done</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function FlashcardReviewScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isFreeUser } = useEntitlements();

  // Data hooks
  const { data: dueCards, isLoading } = useDueFlashcards();
  const submitReview = useSubmitReview();
  const incrementReviews = useAppState((s) => s.incrementReviewsCompleted);

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  // Flip animation
  const flipRotation = useSharedValue(0);

  const cards = useMemo(() => dueCards ?? [], [dueCards]);
  const currentCard = cards[currentIndex] ?? null;
  const progress =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = isFlipped ? 0 : 180;
    flipRotation.value = withSpring(next, { damping: 20, stiffness: 120 });
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipRotation]);

  const handleRating = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!isFlipped || !currentCard) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Submit review via the hook
      const result: ReviewResult = {
        cardId: currentCard.id,
        rating,
        reviewedAt: new Date().toISOString(),
      };
      submitReview.mutate(result);

      // Increment zustand daily counter
      incrementReviews();

      // Update session stats
      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        correct: rating >= 3 ? prev.correct + 1 : prev.correct,
      }));

      // Move to next card or complete
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
        flipRotation.value = 0;
      } else {
        // Session done
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSessionComplete(true);
      }
    },
    [
      isFlipped,
      currentCard,
      currentIndex,
      cards.length,
      submitReview,
      incrementReviews,
      flipRotation,
    ],
  );

  // Animated styles for card flip
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 90.1, 180],
      [1, 0, 0, 0],
    );
    return { transform: [{ rotateY: `${rotateY}deg` }], opacity };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 90.1, 180],
      [0, 0, 1, 1],
    );
    return { transform: [{ rotateY: `${rotateY}deg` }], opacity };
  });

  // --- Loading state ---
  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText
            style={[
              styles.emptySubtitle,
              { color: theme.textSecondary, marginTop: 16 },
            ]}
          >
            Loading flashcards...
          </ThemedText>
        </View>
      </View>
    );
  }

  // --- Empty state ---
  if (cards.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="check-circle" size={64} color={theme.primary} />
          <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
          <ThemedText
            style={[styles.emptySubtitle, { color: theme.textSecondary }]}
          >
            No cards due for review right now.{"\n"}Check back later.
          </ThemedText>
        </View>
      </View>
    );
  }

  // --- Session complete ---
  if (sessionComplete) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        </View>
        <SessionComplete
          reviewed={sessionStats.reviewed}
          correct={sessionStats.correct}
          onDone={() => navigation.goBack()}
        />
      </View>
    );
  }

  // --- Premium gate (free users: 1 session) ---
  // Keeping the existing pattern but using hooks data now
  // The premium gate logic from the original can be layered on separately.

  if (!currentCard) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText
            style={[styles.counterText, { color: theme.textSecondary }]}
          >
            {currentIndex + 1} of {cards.length}
          </ThemedText>
        </View>

        {/* Progress Bar */}
        <View
          style={[styles.progressContainer, { backgroundColor: theme.border }]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: NoorColors.gold },
            ]}
          />
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <Pressable
          onPress={handleFlip}
          style={styles.cardPressable}
          accessibilityRole="button"
          accessibilityLabel={
            isFlipped
              ? `${currentCard.english}, ${currentCard.transliteration}`
              : `${currentCard.arabic}. Tap to reveal answer`
          }
        >
          {/* Front - Arabic */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
              frontAnimatedStyle,
            ]}
          >
            <View
              style={[
                styles.cardCategoryBadge,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <ThemedText
                style={[styles.cardCategoryText, { color: theme.primary }]}
              >
                {currentCard.category}
              </ThemedText>
            </View>
            <ThemedText style={styles.arabicText}>
              {currentCard.arabic}
            </ThemedText>
            <TTSButton
              text={currentCard.arabic}
              size={22}
              style={styles.ttsButton}
            />
            <ThemedText
              style={[styles.flipHint, { color: theme.textSecondary }]}
            >
              Tap to reveal
            </ThemedText>
          </Animated.View>

          {/* Back - English + transliteration */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { backgroundColor: theme.cardBackground },
              backAnimatedStyle,
            ]}
          >
            <ThemedText style={styles.englishText}>
              {currentCard.english}
            </ThemedText>
            <ThemedText
              style={[styles.transliteration, { color: theme.textSecondary }]}
            >
              {currentCard.transliteration}
            </ThemedText>
            <View style={styles.arabicRow}>
              <ThemedText
                style={[styles.arabicSmall, { color: theme.primary }]}
              >
                {currentCard.arabic}
              </ThemedText>
              <TTSButton text={currentCard.arabic} size={18} />
            </View>
            <View style={styles.metaInfo}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.categoryText, { color: theme.primary }]}
                >
                  {currentCard.category}
                </ThemedText>
              </View>
              {currentCard.reviewCount > 0 && (
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: theme.accent + "20" },
                  ]}
                >
                  <ThemedText
                    style={[styles.categoryText, { color: theme.accent }]}
                  >
                    reviewed {currentCard.reviewCount}x
                  </ThemedText>
                </View>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Rating Buttons */}
      <View
        style={[styles.ratingContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <RatingButton
          label="Again"
          subtitle="<1m"
          color="#E53E3E"
          rating={1}
          disabled={!isFlipped}
          onPress={handleRating}
        />
        <RatingButton
          label="Hard"
          subtitle="1d"
          color="#DD6B20"
          rating={2}
          disabled={!isFlipped}
          onPress={handleRating}
        />
        <RatingButton
          label="Good"
          subtitle="3d"
          color="#38A169"
          rating={3}
          disabled={!isFlipped}
          onPress={handleRating}
        />
        <RatingButton
          label="Easy"
          subtitle="7d"
          color="#3182CE"
          rating={4}
          disabled={!isFlipped}
          onPress={handleRating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  counterText: { fontSize: 16, fontWeight: "600" },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: { height: "100%", borderRadius: 2 },

  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardPressable: { width: CARD_WIDTH, height: CARD_HEIGHT },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardBack: { position: "absolute" },
  cardCategoryBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  cardCategoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  arabicText: {
    fontSize: 48,
    fontFamily: Fonts?.spiritual,
    textAlign: "center",
    marginBottom: 12,
  },
  arabicSmall: {
    fontSize: 28,
    fontFamily: Fonts?.spiritual,
    textAlign: "center",
    marginBottom: 16,
  },
  englishText: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12,
  },
  ttsButton: { marginBottom: 8 },
  arabicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  flipHint: { fontSize: 14, position: "absolute", bottom: 24 },
  metaInfo: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  ratingContainer: { flexDirection: "row", paddingHorizontal: 16, gap: 8 },
  ratingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  ratingSubtext: { fontSize: 11, color: "rgba(255,255,255,0.8)" },

  // Empty / Loading
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },

  // Session Complete
  sessionComplete: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sessionTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  sessionSubtitle: { fontSize: 16, marginBottom: 32, textAlign: "center" },
  sessionStatsGrid: { flexDirection: "row", gap: 12, marginBottom: 40 },
  sessionStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  sessionStatValue: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  sessionStatLabel: { fontSize: 13 },
  doneButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
  },
  doneButtonText: { fontSize: 17, fontWeight: "600", color: "#0f1419" },
});
