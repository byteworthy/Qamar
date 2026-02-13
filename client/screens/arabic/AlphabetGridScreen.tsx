import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { useAllFlashcards, Flashcard } from "@/hooks/useArabicLearning";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AlphabetCellProps {
  card: Flashcard;
  delay: number;
  onPress: () => void;
}

function AlphabetCell({ card, delay, onPress }: AlphabetCellProps) {
  const { theme } = useTheme();

  const getStateColor = () => {
    switch (card.state) {
      case "new":
        return theme.textSecondary;
      case "learning":
        return theme.warning;
      case "review":
        return theme.success;
      case "relearning":
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.alphabetCell,
          {
            backgroundColor: theme.cardBackground,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${card.arabic}, ${card.transliteration}, ${card.english}`}
        accessibilityHint="Tap to review this letter"
      >
        <View style={styles.cellContent}>
          <ThemedText style={styles.arabicLetter}>{card.arabic}</ThemedText>
          <ThemedText
            style={[styles.transliteration, { color: theme.textSecondary }]}
          >
            {card.transliteration}
          </ThemedText>
          <View
            style={[
              styles.stateIndicator,
              { backgroundColor: getStateColor() },
            ]}
            accessibilityLabel={`Learning state: ${card.state}`}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AlphabetGridScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: allCards, isLoading, error } = useAllFlashcards();

  const alphabetCards = allCards?.filter((card) => card.category === "alphabet") || [];

  const handleCellPress = (card: Flashcard) => {
    // Navigate to FlashcardReview screen with this specific card
    // For now, we'll just navigate to the general review screen
    navigation.navigate("FlashcardReview");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText
            style={styles.headerTitle}
            accessibilityRole="header"
            accessibilityLabel="Arabic Alphabet"
          >
            Arabic Alphabet
          </ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            accessibilityLabel="28 letters of the Arabic script"
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
            <ThemedText
              style={[styles.errorSubtext, { color: theme.textSecondary }]}
            >
              Please check your connection and try again
            </ThemedText>
          </View>
        )}

        {alphabetCards.length > 0 && (
          <>
            <View
              style={[
                styles.legendCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <ThemedText
                style={[styles.legendTitle, { color: theme.textSecondary }]}
              >
                Learning Progress
              </ThemedText>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: theme.textSecondary },
                    ]}
                  />
                  <ThemedText
                    style={[styles.legendText, { color: theme.textSecondary }]}
                  >
                    New
                  </ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: theme.warning },
                    ]}
                  />
                  <ThemedText
                    style={[styles.legendText, { color: theme.textSecondary }]}
                  >
                    Learning
                  </ThemedText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: theme.success },
                    ]}
                  />
                  <ThemedText
                    style={[styles.legendText, { color: theme.textSecondary }]}
                  >
                    Mastered
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.alphabetGrid}>
              {alphabetCards.map((card, index) => (
                <AlphabetCell
                  key={card.id}
                  card={card}
                  delay={100 + index * 30}
                  onPress={() => handleCellPress(card)}
                />
              ))}
            </View>

            {alphabetCards.length === 0 && (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Feather
                  name="book"
                  size={48}
                  color={theme.textSecondary}
                  style={styles.emptyIcon}
                />
                <ThemedText
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No alphabet cards available yet
                </ThemedText>
                <ThemedText
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Check back soon for learning materials
                </ThemedText>
              </View>
            )}
          </>
        )}
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
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  legendCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  alphabetCell: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cellContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
  },
  arabicLetter: {
    fontSize: 36,
    fontWeight: "600",
    marginBottom: 4,
  },
  transliteration: {
    fontSize: 11,
    textAlign: "center",
  },
  stateIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
