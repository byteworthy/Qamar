import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  ARABIC_VOCABULARY,
  VocabularyWord,
} from "@/data/arabicVocabulary";
import {
  createNewCard,
  getDueCards,
  scheduleReview,
  FSRSCard,
  Rating,
} from "@/lib/fsrs";
import { BorderRadius, Fonts } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STORAGE_KEY = "@noor_arabic_flashcards";

interface FlashcardData {
  wordId: string;
  card: FSRSCard;
}

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.5;

export default function FlashcardReviewScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
  });

  const flipRotation = useSharedValue(0);

  // Load flashcards
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let cards: FlashcardData[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);
        cards = parsed.map((item: any) => ({
          ...item,
          card: {
            ...item.card,
            lastReview: item.card.lastReview
              ? new Date(item.card.lastReview)
              : null,
            nextReview: item.card.nextReview
              ? new Date(item.card.nextReview)
              : null,
          },
        }));
      } else {
        cards = ARABIC_VOCABULARY.map((word) => ({
          wordId: word.id,
          card: createNewCard(),
        }));
      }

      setFlashcards(cards);

      // Get due cards
      const due = getDueCards(cards.map((c) => c.card));
      const dueCardData = cards.filter((c) =>
        due.some((d) => d === c.card)
      );
      setDueCards(dueCardData);
    } catch (error) {
      console.error("Failed to load flashcards:", error);
    }
  };

  const saveFlashcards = async (cards: FlashcardData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error("Failed to save flashcards:", error);
    }
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flipRotation.value = withSpring(isFlipped ? 0 : 180, {
      damping: 20,
      stiffness: 120,
    });
    setIsFlipped(!isFlipped);
  };

  const handleRating = (rating: Rating) => {
    if (!isFlipped) {
      // Must flip card first to see answer
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentCard = dueCards[currentIndex];
    if (!currentCard) return;

    // Update card with FSRS scheduling
    const updatedCard = scheduleReview(currentCard.card, rating);

    // Update flashcards array
    const updatedFlashcards = flashcards.map((fc) =>
      fc.wordId === currentCard.wordId
        ? { ...fc, card: updatedCard }
        : fc
    );

    setFlashcards(updatedFlashcards);
    saveFlashcards(updatedFlashcards);

    // Update session stats
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: rating >= 3 ? prev.correct + 1 : prev.correct,
    }));

    // Move to next card
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipRotation.value = 0;
    } else {
      // Session complete
      showSessionSummary();
    }
  };

  const showSessionSummary = () => {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // TODO: Show modal with session summary
    // For now, just navigate back
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  const currentWord = dueCards[currentIndex]
    ? ARABIC_VOCABULARY.find(
        (w) => w.id === dueCards[currentIndex].wordId
      )
    : null;

  const progress = dueCards.length > 0
    ? ((currentIndex + 1) / dueCards.length) * 100
    : 0;

  // Animated styles for flip
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [0, 180]
    );
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 90.1, 180],
      [1, 0, 0, 0]
    );

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipRotation.value,
      [0, 180],
      [180, 360]
    );
    const opacity = interpolate(
      flipRotation.value,
      [0, 90, 90.1, 180],
      [0, 0, 1, 1]
    );

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  if (dueCards.length === 0) {
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
            No cards due for review right now.
          </ThemedText>
        </View>
      </View>
    );
  }

  if (!currentWord) {
    return null;
  }

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

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: "#D69E2E" },
            ]}
          />
        </View>

        <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
          {currentIndex + 1} / {dueCards.length}
        </ThemedText>
      </View>

      <View style={styles.cardContainer}>
        {/* Flashcard */}
        <Pressable
          onPress={handleFlip}
          style={styles.cardPressable}
          accessibilityRole="button"
          accessibilityLabel="Tap to flip card"
        >
          {/* Front of card (Arabic) */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
              frontAnimatedStyle,
            ]}
          >
            <ThemedText style={styles.arabicText}>
              {currentWord.arabic}
            </ThemedText>
            <ThemedText
              style={[styles.flipHint, { color: theme.textSecondary }]}
            >
              Tap to reveal
            </ThemedText>
          </Animated.View>

          {/* Back of card (Translation) */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { backgroundColor: theme.cardBackground },
              backAnimatedStyle,
            ]}
          >
            <ThemedText style={styles.englishText}>
              {currentWord.english}
            </ThemedText>
            <ThemedText
              style={[styles.transliteration, { color: theme.textSecondary }]}
            >
              {currentWord.transliteration}
            </ThemedText>
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
                  {currentWord.category}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Rating Buttons */}
      <View style={[styles.ratingContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => handleRating(1)}
          disabled={!isFlipped}
          style={({ pressed }) => [
            styles.ratingButton,
            {
              backgroundColor: "#E53E3E",
              opacity: !isFlipped ? 0.3 : pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rate as Again"
        >
          <ThemedText style={styles.ratingButtonText}>Again</ThemedText>
          <ThemedText style={styles.ratingSubtext}>&lt;1m</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => handleRating(2)}
          disabled={!isFlipped}
          style={({ pressed }) => [
            styles.ratingButton,
            {
              backgroundColor: "#DD6B20",
              opacity: !isFlipped ? 0.3 : pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rate as Hard"
        >
          <ThemedText style={styles.ratingButtonText}>Hard</ThemedText>
          <ThemedText style={styles.ratingSubtext}>1d</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => handleRating(3)}
          disabled={!isFlipped}
          style={({ pressed }) => [
            styles.ratingButton,
            {
              backgroundColor: "#38A169",
              opacity: !isFlipped ? 0.3 : pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rate as Good"
        >
          <ThemedText style={styles.ratingButtonText}>Good</ThemedText>
          <ThemedText style={styles.ratingSubtext}>3d</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => handleRating(4)}
          disabled={!isFlipped}
          style={({ pressed }) => [
            styles.ratingButton,
            {
              backgroundColor: "#3182CE",
              opacity: !isFlipped ? 0.3 : pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rate as Easy"
        >
          <ThemedText style={styles.ratingButtonText}>Easy</ThemedText>
          <ThemedText style={styles.ratingSubtext}>7d</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardPressable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardBack: {
    position: "absolute",
  },
  arabicText: {
    fontSize: 36,
    fontFamily: Fonts.spiritual,
    textAlign: "center",
    marginBottom: 16,
  },
  englishText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  transliteration: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  flipHint: {
    fontSize: 14,
    position: "absolute",
    bottom: 24,
  },
  metaInfo: {
    position: "absolute",
    bottom: 24,
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  ratingContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
  },
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
  ratingSubtext: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
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
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
