import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ARABIC_ALPHABET, ARABIC_VOCABULARY } from "@/data/arabicVocabulary";
import { createNewCard, getDueCards, FSRSCard } from "@/lib/fsrs";
import { Spacing, BorderRadius } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STORAGE_KEY = "@noor_arabic_flashcards";

interface FlashcardData {
  wordId: string;
  card: FSRSCard;
}

export default function ArabicLearningScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [stats, setStats] = useState({
    learned: 0,
    streak: 0,
    accuracy: 0,
  });

  // Load flashcard progress from storage
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let cards: FlashcardData[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
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
        // Initialize with new cards for all vocabulary
        cards = ARABIC_VOCABULARY.map((word) => ({
          wordId: word.id,
          card: createNewCard(),
        }));
      }

      setFlashcards(cards);

      // Calculate stats
      const due = getDueCards(cards.map((c) => c.card));
      setDueCount(due.length);

      const learned = cards.filter((c) => c.card.state === "review").length;
      const totalReviews = cards.reduce(
        (sum, c) => sum + c.card.reviewCount,
        0
      );
      const successfulReviews = cards.reduce((sum, c) => {
        if (c.card.state === "review") return sum + c.card.reviewCount;
        return sum;
      }, 0);
      const accuracy =
        totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;

      setStats({
        learned,
        streak: 0, // TODO: Implement streak tracking
        accuracy,
      });
    } catch (error) {
      console.error("Failed to load flashcards:", error);
    }
  };

  const handleStartReview = () => {
    if (dueCount > 0) {
      navigation.navigate("FlashcardReview");
    }
  };

  const { width } = Dimensions.get("window");
  const letterSize = (width - 80) / 7; // 7 columns with spacing

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Arabic Learning</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Master Arabic with spaced repetition
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
        {/* Progress Stats */}
        <Animated.View entering={FadeInUp.duration(350).delay(100)}>
          <GlassCard style={styles.statsCard}>
            <ThemedText style={styles.sectionTitle}>Your Progress</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{stats.learned}</ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Learned
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{stats.streak}</ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Day Streak
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {stats.accuracy}%
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Accuracy
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Vocabulary Review Section */}
        <Animated.View entering={FadeInUp.duration(350).delay(200)}>
          <GlassCard style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>
                  Vocabulary Review
                </ThemedText>
                <ThemedText
                  style={[
                    styles.reviewSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {dueCount} cards ready to review
                </ThemedText>
              </View>
              <Feather name="book-open" size={32} color={theme.primary} />
            </View>

            <Pressable
              onPress={handleStartReview}
              disabled={dueCount === 0}
              style={({ pressed }) => [
                styles.reviewButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                dueCount === 0 && { opacity: 0.5 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start vocabulary review"
            >
              <ThemedText style={styles.reviewButtonText}>
                {dueCount > 0 ? "Start Review" : "All Caught Up!"}
              </ThemedText>
              <Feather name="arrow-right" size={20} color={theme.onPrimary} />
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* Arabic Alphabet Section */}
        <Animated.View entering={FadeInUp.duration(350).delay(300)}>
          <View style={styles.alphabetSection}>
            <ThemedText style={styles.sectionTitle}>
              Arabic Alphabet
            </ThemedText>
            <ThemedText
              style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
            >
              28 letters to master
            </ThemedText>

            <View style={styles.alphabetGrid}>
              {ARABIC_ALPHABET.map((letter, index) => (
                <Animated.View
                  key={letter.name}
                  entering={FadeInUp.duration(300).delay(350 + index * 30)}
                >
                  <Pressable
                    onPress={() => {
                      // TODO: Show letter detail modal
                    }}
                    style={({ pressed }) => [
                      styles.letterCard,
                      {
                        width: letterSize,
                        height: letterSize,
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Letter ${letter.name}`}
                  >
                    <ThemedText style={styles.letterText}>
                      {letter.letter}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.letterName,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {letter.name}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View entering={FadeInUp.duration(350).delay(400)}>
          <GlassCard style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Feather
                name="info"
                size={20}
                color={theme.primary}
                style={styles.tipsIcon}
              />
              <ThemedText style={styles.tipsTitle}>Learning Tips</ThemedText>
            </View>
            <ThemedText
              style={[styles.tipsText, { color: theme.textSecondary }]}
            >
              • Review cards daily for best retention{"\n"}
              • Be honest with your ratings{"\n"}
              • Take breaks between sessions{"\n"}• Practice writing letters by hand
            </ThemedText>
          </GlassCard>
        </Animated.View>
      </ScrollView>
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statsCard: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  reviewCard: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  reviewSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  alphabetSection: {
    marginTop: 8,
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  letterCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  letterText: {
    fontSize: 28,
    marginBottom: 2,
  },
  letterName: {
    fontSize: 10,
    textAlign: "center",
  },
  tipsCard: {
    marginBottom: 0,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsIcon: {
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
