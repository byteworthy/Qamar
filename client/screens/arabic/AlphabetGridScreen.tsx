import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useAllFlashcards, Flashcard } from "@/hooks/useArabicLearning";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { BorderRadius, Fonts, Spacing } from "@/constants/theme";
import { QamarColors } from "@/constants/theme/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const GRID_PADDING = 20;
const GRID_GAP = 10;
const NUM_COLUMNS = 4;
const CELL_SIZE =
  (width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

// ---------------------------------------------------------------------------
// Letter Forms Data (isolated, initial, medial, final)
// ---------------------------------------------------------------------------

const LETTER_FORMS: Record<
  string,
  { isolated: string; initial: string; medial: string; final: string }
> = {
  أ: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" },
  ب: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
  ت: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
  ث: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
  ج: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
  ح: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
  خ: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
  د: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
  ذ: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
  ر: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
  ز: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
  س: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
  ش: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
  ص: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
  ض: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
  ط: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
  ظ: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
  ع: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
  غ: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
  ف: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
  ق: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
  ك: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
  ل: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
  م: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
  ن: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
  ه: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" },
  و: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
  ي: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
};

// ---------------------------------------------------------------------------
// Letter Detail Modal
// ---------------------------------------------------------------------------

interface LetterDetailModalProps {
  card: Flashcard | null;
  visible: boolean;
  onClose: () => void;
}

function LetterDetailModal({ card, visible, onClose }: LetterDetailModalProps) {
  const { theme } = useTheme();
  if (!card) return null;

  const forms = LETTER_FORMS[card.arabic];
  const formEntries = forms
    ? [
        { label: "Isolated", form: forms.isolated },
        { label: "Initial", form: forms.initial },
        { label: "Medial", form: forms.medial },
        { label: "Final", form: forms.final },
      ]
    : [];

  const stateColor =
    card.state === "review"
      ? QamarColors.emerald
      : card.state === "learning"
        ? "#D4A85A"
        : card.state === "relearning"
          ? "#D4756B"
          : theme.textSecondary;

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
            styles.modalContent,
            { backgroundColor: theme.backgroundRoot },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View entering={FadeIn.duration(300)}>
            {/* Close button */}
            <Pressable
              onPress={onClose}
              style={styles.modalClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={24} color={theme.textSecondary} />
            </Pressable>

            {/* Letter header */}
            <ThemedText style={styles.modalArabic}>{card.arabic}</ThemedText>
            <ThemedText style={styles.modalName}>
              {card.transliteration}
            </ThemedText>
            <ThemedText
              style={[styles.modalEnglish, { color: theme.textSecondary }]}
            >
              Sound: {card.english}
            </ThemedText>

            {/* State badge */}
            <View
              style={[
                styles.modalStateBadge,
                { backgroundColor: stateColor + "20" },
              ]}
            >
              <View
                style={[styles.modalStateDot, { backgroundColor: stateColor }]}
              />
              <ThemedText
                style={[styles.modalStateText, { color: stateColor }]}
              >
                {card.state === "new"
                  ? "Not yet learned"
                  : card.state === "learning"
                    ? "Currently learning"
                    : card.state === "review"
                      ? "Mastered"
                      : "Needs review"}
              </ThemedText>
            </View>

            {/* Letter Forms */}
            {formEntries.length > 0 && (
              <>
                <ThemedText
                  style={[styles.formsTitle, { color: theme.textSecondary }]}
                >
                  Letter Forms
                </ThemedText>
                <View style={styles.formsGrid}>
                  {formEntries.map((entry) => (
                    <View
                      key={entry.label}
                      style={[
                        styles.formCell,
                        { backgroundColor: theme.cardBackground },
                      ]}
                    >
                      <ThemedText style={styles.formArabic}>
                        {entry.form}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.formLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {entry.label}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </>
            )}

            {card.reviewCount > 0 && (
              <ThemedText
                style={[
                  styles.modalReviewCount,
                  { color: theme.textSecondary },
                ]}
              >
                Reviewed {card.reviewCount} time
                {card.reviewCount !== 1 ? "s" : ""}
              </ThemedText>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Alphabet Cell
// ---------------------------------------------------------------------------

interface AlphabetCellProps {
  card: Flashcard;
  delay: number;
  onPress: () => void;
}

function AlphabetCell({ card, delay, onPress }: AlphabetCellProps) {
  const { theme } = useTheme();

  const stateColor =
    card.state === "review"
      ? QamarColors.emerald
      : card.state === "learning"
        ? "#D4A85A"
        : card.state === "relearning"
          ? "#D4756B"
          : theme.textSecondary;

  const isLearned = card.state === "review" && card.reviewCount > 0;

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.alphabetCell,
          {
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: isLearned
              ? QamarColors.emerald + "15"
              : theme.cardBackground,
            borderColor: isLearned
              ? QamarColors.emerald + "40"
              : theme.cardBackground,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.93 : 1 }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${card.transliteration}, ${card.english}. ${card.state}`}
        accessibilityHint="Tap to see letter forms"
      >
        <View style={styles.cellContent}>
          <ThemedText style={styles.cellArabic}>{card.arabic}</ThemedText>
          <ThemedText style={[styles.cellName, { color: theme.textSecondary }]}>
            {card.transliteration}
          </ThemedText>
          <View
            style={[styles.stateIndicator, { backgroundColor: stateColor }]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function AlphabetGridScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: allCards, isLoading, error } = useAllFlashcards();

  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const alphabetCards = useMemo(
    () => allCards?.filter((c) => c.category === "alphabet") ?? [],
    [allCards],
  );

  const progressStats = useMemo(() => {
    if (alphabetCards.length === 0) return { learned: 0, total: 0, pct: 0 };
    const learned = alphabetCards.filter(
      (c) => c.state === "review" && c.reviewCount > 0,
    ).length;
    return {
      learned,
      total: alphabetCards.length,
      pct: Math.round((learned / alphabetCards.length) * 100),
    };
  }, [alphabetCards]);

  const handleCellPress = (card: Flashcard) => {
    setSelectedCard(card);
    setModalVisible(true);
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
          <ThemedText style={styles.headerTitle} accessibilityRole="header">
            Arabic Alphabet
          </ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            28 letters of the Arabic script
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
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText
              style={[styles.loadingText, { color: theme.textSecondary }]}
            >
              Loading alphabet...
            </ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.centerContainer}>
            <Feather name="alert-circle" size={48} color={theme.error} />
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              Failed to load alphabet
            </ThemedText>
          </View>
        )}

        {alphabetCards.length > 0 && (
          <>
            {/* Progress Card */}
            <Animated.View entering={FadeInUp.duration(350).delay(50)}>
              <GlassCard style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View>
                    <ThemedText style={styles.progressTitle}>
                      Progress
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.progressSubtext,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {progressStats.learned} of {progressStats.total} letters
                      mastered
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.progressPct, { color: QamarColors.gold }]}
                  >
                    {progressStats.pct}%
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressStats.pct}%`,
                        backgroundColor: QamarColors.emerald,
                      },
                    ]}
                  />
                </View>
              </GlassCard>
            </Animated.View>

            {/* Legend */}
            <Animated.View entering={FadeInUp.duration(300).delay(80)}>
              <View
                style={[
                  styles.legendCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: theme.textSecondary },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.legendText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      New
                    </ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#D4A85A" }]}
                    />
                    <ThemedText
                      style={[
                        styles.legendText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Learning
                    </ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: QamarColors.emerald },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.legendText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Mastered
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Alphabet Grid (4 columns) */}
            <View style={styles.alphabetGrid}>
              {alphabetCards.map((card, index) => (
                <AlphabetCell
                  key={card.id}
                  card={card}
                  delay={100 + index * 25}
                  onPress={() => handleCellPress(card)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Letter Detail Modal */}
      <LetterDetailModal
        card={selectedCard}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: GRID_PADDING, paddingBottom: 16 },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  headerSubtitle: { fontSize: 16, lineHeight: 22 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: GRID_PADDING },

  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: { fontSize: 16, marginTop: 8 },
  errorText: { fontSize: 18, fontWeight: "600", marginTop: 12 },

  // Progress card
  progressCard: { marginBottom: 12 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  progressSubtext: { fontSize: 13 },
  progressPct: { fontSize: 24, fontWeight: "700" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  // Legend
  legendCard: { borderRadius: 12, padding: 12, marginBottom: 16 },
  legendItems: { flexDirection: "row", justifyContent: "center", gap: 24 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13 },

  // Grid
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  alphabetCell: {
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cellContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  cellArabic: {
    fontSize: 32,
    fontFamily: Fonts?.spiritual,
    marginBottom: 2,
  },
  cellName: { fontSize: 11, textAlign: "center" },
  stateIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 380,
  },
  modalClose: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modalArabic: {
    fontSize: 64,
    fontFamily: Fonts?.spiritual,
    textAlign: "center",
    marginBottom: 4,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  modalEnglish: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  modalStateBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: 24,
  },
  modalStateDot: { width: 10, height: 10, borderRadius: 5 },
  modalStateText: { fontSize: 14, fontWeight: "600" },
  formsTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  formCell: {
    width: 70,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  formArabic: {
    fontSize: 28,
    fontFamily: Fonts?.spiritual,
    marginBottom: 4,
  },
  formLabel: { fontSize: 11 },
  modalReviewCount: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
