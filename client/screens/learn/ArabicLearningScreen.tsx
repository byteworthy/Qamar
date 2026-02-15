import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  useDueFlashcards,
  useAllFlashcards,
  useArabicProgress,
  useConversationScenarios,
  Flashcard,
  ConversationScenario,
} from "@/hooks/useArabicLearning";
import { useAppState, selectDailyProgress } from "@/stores/app-state";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { NoorColors } from "@/constants/theme/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

// ---------------------------------------------------------------------------
// Category Progress Card
// ---------------------------------------------------------------------------

interface CategoryCardProps {
  title: string;
  titleArabic: string;
  icon: keyof typeof Feather.glyphMap;
  learned: number;
  total: number;
  gradient: [string, string];
  onPress: () => void;
  delay: number;
}

function CategoryCard({
  title,
  titleArabic,
  icon,
  learned,
  total,
  gradient,
  onPress,
  delay,
}: CategoryCardProps) {
  const pct = total > 0 ? (learned / total) * 100 : 0;

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.categoryCard,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${title} - ${learned} of ${total} learned`}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryHeader}>
            <Feather name={icon} size={24} color="rgba(255,255,255,0.9)" />
            <ThemedText style={styles.categoryArabic}>{titleArabic}</ThemedText>
          </View>
          <ThemedText style={styles.categoryTitle}>{title}</ThemedText>
          <View style={styles.categoryProgress}>
            <View style={styles.categoryProgressBar}>
              <View
                style={[styles.categoryProgressFill, { width: `${pct}%` }]}
              />
            </View>
            <ThemedText style={styles.categoryProgressText}>
              {learned}/{total}
            </ThemedText>
          </View>
          <Pressable
            onPress={onPress}
            style={styles.categoryStartButton}
            accessibilityRole="button"
            accessibilityLabel={`Start learning ${title}`}
          >
            <ThemedText style={styles.categoryStartText}>
              Start Learning
            </ThemedText>
            <Feather name="arrow-right" size={14} color="rgba(255,255,255,0.95)" />
          </Pressable>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Scenario Card
// ---------------------------------------------------------------------------

interface ScenarioCardProps {
  scenario: ConversationScenario;
  delay: number;
}

function ScenarioCard({ scenario, delay }: ScenarioCardProps) {
  const { theme } = useTheme();

  const difficultyColor =
    scenario.difficulty === "beginner"
      ? "#38A169"
      : scenario.difficulty === "intermediate"
        ? "#D69E2E"
        : "#E53E3E";

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <View
        style={[styles.scenarioCard, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.scenarioHeader}>
          <ThemedText style={styles.scenarioTitle}>
            {scenario.title}
          </ThemedText>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor + "20" },
            ]}
          >
            <ThemedText
              style={[styles.difficultyText, { color: difficultyColor }]}
            >
              {scenario.difficulty}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          style={[styles.scenarioArabicTitle, { color: theme.primary }]}
        >
          {scenario.titleArabic}
        </ThemedText>
        <ThemedText
          style={[styles.scenarioPhraseCount, { color: theme.textSecondary }]}
        >
          {scenario.phrases.length} phrases
        </ThemedText>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ArabicLearningScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Data hooks
  const { data: dueCards, isLoading: dueLoading } = useDueFlashcards();
  const { data: allCards, isLoading: allLoading } = useAllFlashcards();
  const { data: progress } = useArabicProgress();
  const { data: scenarios } = useConversationScenarios();

  // Zustand daily progress
  const dailyProgress = useAppState(selectDailyProgress);

  const dueCount = dueCards?.length ?? 0;
  const isLoading = dueLoading || allLoading;

  // Compute category stats from allCards
  const categoryStats = React.useMemo(() => {
    if (!allCards) return { alphabet: { learned: 0, total: 0 }, vocabulary: { learned: 0, total: 0 }, phrase: { learned: 0, total: 0 } };
    const compute = (cat: Flashcard["category"]) => {
      const filtered = allCards.filter((c) => c.category === cat);
      return {
        learned: filtered.filter((c) => c.state === "review" && c.reviewCount > 0).length,
        total: filtered.length,
      };
    };
    return {
      alphabet: compute("alphabet"),
      vocabulary: compute("vocabulary"),
      phrase: compute("phrase"),
    };
  }, [allCards]);

  const handleStartReview = () => {
    if (dueCount > 0) {
      navigation.navigate("FlashcardReview");
    }
  };

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
        {/* Daily Progress Card */}
        <Animated.View entering={FadeInUp.duration(350).delay(100)}>
          <GlassCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>
                  Today's Progress
                </ThemedText>
                <ThemedText
                  style={[styles.progressSubtext, { color: theme.textSecondary }]}
                >
                  {dailyProgress.completed} / {dailyProgress.goal} reviews
                </ThemedText>
              </View>
              <View style={styles.streakBadge}>
                <Feather name="zap" size={18} color={NoorColors.gold} />
                <ThemedText style={[styles.streakText, { color: NoorColors.gold }]}>
                  {progress?.streak ?? 0}
                </ThemedText>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.dailyProgressBar, { backgroundColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.dailyProgressFill,
                  {
                    width: `${Math.min(dailyProgress.percentage, 100)}%`,
                    backgroundColor: NoorColors.gold,
                  },
                ]}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {progress?.cardsLearned ?? 0}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Learned
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {progress?.accuracy ? Math.round(progress.accuracy * 100) : 0}%
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Accuracy
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {progress?.totalCards ?? 0}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Total Cards
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Due For Review Button */}
        <Animated.View entering={FadeInUp.duration(350).delay(200)}>
          <GlassCard style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sectionTitle}>
                  Due for Review
                </ThemedText>
                <ThemedText
                  style={[styles.reviewSubtext, { color: theme.textSecondary }]}
                >
                  {isLoading
                    ? "Loading..."
                    : dueCount > 0
                      ? `${dueCount} card${dueCount !== 1 ? "s" : ""} ready`
                      : "All caught up!"}
                </ThemedText>
              </View>
              {dueCount > 0 && (
                <View style={[styles.dueBadge, { backgroundColor: NoorColors.gold }]}>
                  <ThemedText style={styles.dueBadgeText}>{dueCount}</ThemedText>
                </View>
              )}
            </View>

            <Pressable
              onPress={handleStartReview}
              disabled={dueCount === 0 || isLoading}
              style={({ pressed }) => [
                styles.reviewButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                (dueCount === 0 || isLoading) && { opacity: 0.4 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                dueCount > 0
                  ? `Start reviewing ${dueCount} cards`
                  : "No cards due for review"
              }
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.onPrimary} />
              ) : (
                <>
                  <ThemedText
                    style={[styles.reviewButtonText, { color: theme.onPrimary }]}
                  >
                    {dueCount > 0 ? "Start Review" : "All Caught Up!"}
                  </ThemedText>
                  <Feather
                    name={dueCount > 0 ? "arrow-right" : "check-circle"}
                    size={20}
                    color={theme.onPrimary}
                  />
                </>
              )}
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* Category Sections */}
        <Animated.View entering={FadeInUp.duration(350).delay(300)}>
          <ThemedText style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Categories
          </ThemedText>
        </Animated.View>

        <CategoryCard
          title="Alphabet"
          titleArabic="الحروف"
          icon="grid"
          learned={categoryStats.alphabet.learned}
          total={categoryStats.alphabet.total}
          gradient={["#4a3a5a", "#7a6a8a"]}
          onPress={() => navigation.navigate("AlphabetGrid")}
          delay={350}
        />
        <CategoryCard
          title="Vocabulary"
          titleArabic="المفردات"
          icon="book-open"
          learned={categoryStats.vocabulary.learned}
          total={categoryStats.vocabulary.total}
          gradient={["#3a5a4a", "#6a8a7a"]}
          onPress={() => navigation.navigate("FlashcardReview")}
          delay={420}
        />
        <CategoryCard
          title="Phrases"
          titleArabic="العبارات"
          icon="message-circle"
          learned={categoryStats.phrase.learned}
          total={categoryStats.phrase.total}
          gradient={["#5a4a3a", "#8a7a6a"]}
          onPress={() => navigation.navigate("FlashcardReview")}
          delay={490}
        />

        {/* Conversation Scenarios */}
        {scenarios && scenarios.length > 0 && (
          <Animated.View entering={FadeInUp.duration(350).delay(550)}>
            <ThemedText style={[styles.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>
              Conversation Scenarios
            </ThemedText>
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                delay={580 + index * 60}
              />
            ))}
          </Animated.View>
        )}

        {/* Tips Section */}
        <Animated.View entering={FadeInUp.duration(350).delay(650)}>
          <GlassCard style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Feather
                name="info"
                size={20}
                color={theme.primary}
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.tipsTitle}>Learning Tips</ThemedText>
            </View>
            <ThemedText
              style={[styles.tipsText, { color: theme.textSecondary }]}
            >
              {"\u2022"} Review cards daily for best retention{"\n"}
              {"\u2022"} Be honest with your ratings{"\n"}
              {"\u2022"} Take breaks between sessions{"\n"}
              {"\u2022"} Practice writing letters by hand
            </ThemedText>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: "center", marginBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  headerSubtitle: { fontSize: 16, lineHeight: 22 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 16 },

  // Progress card
  progressCard: { marginBottom: 0 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  progressSubtext: { fontSize: 14, marginTop: 4 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  streakText: { fontSize: 16, fontWeight: "700" },
  dailyProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  dailyProgressFill: { height: "100%", borderRadius: 3 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", marginBottom: 2 },
  statLabel: { fontSize: 13 },

  // Review card
  reviewCard: { marginBottom: 0 },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewSubtext: { fontSize: 14, marginTop: 4 },
  dueBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dueBadgeText: { fontSize: 16, fontWeight: "700", color: "#0f1419" },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  reviewButtonText: { fontSize: 17, fontWeight: "600" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },

  // Category cards
  categoryCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryGradient: { padding: 20 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryArabic: {
    fontSize: 20,
    fontFamily: Fonts?.spiritual,
    color: "rgba(255,255,255,0.85)",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 12,
  },
  categoryProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  categoryProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  categoryProgressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    minWidth: 40,
    textAlign: "right",
  },
  categoryStartButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  categoryStartText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
  },

  // Scenario cards
  scenarioCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  scenarioTitle: { fontSize: 16, fontWeight: "600" },
  scenarioArabicTitle: {
    fontSize: 18,
    fontFamily: Fonts?.spiritual,
    marginBottom: 4,
  },
  scenarioPhraseCount: { fontSize: 13 },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Tips
  tipsCard: { marginBottom: 0 },
  tipsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipsTitle: { fontSize: 16, fontWeight: "600" },
  tipsText: { fontSize: 14, lineHeight: 22 },
});
