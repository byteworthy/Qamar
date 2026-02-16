import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { TTSButton } from "@/components/TTSButton";
import { useAdhkarCategories, Dhikr } from "@/hooks/useAdhkarData";

interface DhikrCounterProps {
  dhikr: Dhikr;
}

function DhikrCounter({ dhikr }: DhikrCounterProps) {
  const { theme } = useTheme();
  const [count, setCount] = useState(0);

  const handlePress = () => {
    if (count < dhikr.count) {
      setCount(count + 1);
    } else {
      setCount(0);
    }
  };

  const isComplete = count === dhikr.count;

  return (
    <View style={[styles.dhikrCard, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.dhikrContent}>
        <View style={styles.arabicRow}>
          <TTSButton text={dhikr.arabic} size={18} />
          <ThemedText
            style={[styles.arabicText, { textAlign: "right", flex: 1 }]}
            accessibilityLabel={`Arabic text: ${dhikr.arabic}`}
          >
            {dhikr.arabic}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.transliterationText, { color: theme.textSecondary }]}
          accessibilityLabel={`Transliteration: ${dhikr.transliteration}`}
        >
          {dhikr.transliteration}
        </ThemedText>
        <ThemedText
          style={[styles.englishText, { color: theme.textSecondary }]}
          accessibilityLabel={`English translation: ${dhikr.english}`}
        >
          {dhikr.english}
        </ThemedText>

        {dhikr.reference && (
          <ThemedText
            style={[styles.referenceText, { color: theme.textSecondary }]}
            accessibilityLabel={`Reference: ${dhikr.reference}`}
          >
            {dhikr.reference}
          </ThemedText>
        )}

        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.counterButton,
            {
              backgroundColor: isComplete
                ? theme.success
                : theme.cardBackground,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Counter: ${count} of ${dhikr.count}`}
          accessibilityHint="Tap to increment counter"
        >
          <Feather
            name={isComplete ? "check-circle" : "circle"}
            size={20}
            color={isComplete ? "#fff" : theme.text}
            style={styles.counterIcon}
          />
          <ThemedText
            style={[
              styles.counterText,
              { color: isComplete ? "#fff" : theme.text },
            ]}
          >
            {count} / {dhikr.count}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    nameArabic: string;
    icon: string;
    adhkar: Dhikr[];
  };
  delay: number;
}

function CategoryCard({ category, delay }: CategoryCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const gradients: Record<string, string[]> = {
    morning: ["#5a4a3a", "#8a7a6a"],
    evening: ["#3a4a5a", "#6a7a8a"],
    "after-prayer": ["#3a5a4a", "#6a8a7a"],
    sleep: ["#4a3a5a", "#7a6a8a"],
  };

  const gradient = gradients[category.id] || ["#4a4a4a", "#7a7a7a"];

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [
          styles.categoryCard,
          {
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${category.name} - ${category.adhkar.length} adhkar`}
        accessibilityHint={expanded ? "Tap to collapse" : "Tap to expand"}
        accessibilityState={{ expanded }}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleContainer}>
              <Feather
                name={category.icon as any}
                size={24}
                color="rgba(255,255,255,0.9)"
                style={styles.categoryIcon}
              />
              <View>
                <ThemedText style={styles.categoryTitle}>
                  {category.name}
                </ThemedText>
                <ThemedText style={styles.categoryTitleArabic}>
                  {category.nameArabic}
                </ThemedText>
              </View>
            </View>
            <View style={styles.categoryMeta}>
              <ThemedText style={styles.adhkarCount}>
                {category.adhkar.length}
              </ThemedText>
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={24}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {expanded && (
        <View style={[styles.adhkarList, { backgroundColor: theme.backgroundSecondary }]}>
          {category.adhkar.map((dhikr, index) => (
            <Animated.View
              key={dhikr.id}
              entering={FadeInUp.duration(300).delay(index * 50)}
            >
              <DhikrCounter dhikr={dhikr} />
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export default function AdhkarListScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { data: categories, isLoading, error } = useAdhkarCategories();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText
            style={styles.headerTitle}
            accessibilityRole="header"
            accessibilityLabel="Adhkar & Duas"
          >
            Adhkar & Duas
          </ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            accessibilityLabel="Daily remembrance of Allah"
          >
            Daily remembrance of Allah
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
              Loading adhkar...
            </ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.centerContainer}>
            <Feather name="alert-circle" size={48} color={theme.error} />
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              Failed to load adhkar
            </ThemedText>
            <ThemedText
              style={[styles.errorSubtext, { color: theme.textSecondary }]}
            >
              Please check your connection and try again
            </ThemedText>
          </View>
        )}

        {categories && (
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                delay={100 + index * 80}
              />
            ))}
          </View>
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
  categoriesGrid: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryGradient: {
    padding: 20,
    minHeight: 100,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 4,
  },
  categoryTitleArabic: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adhkarCount: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  adhkarList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  dhikrCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dhikrContent: {
    gap: 12,
  },
  arabicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: "600",
    textAlign: "right",
  },
  transliterationText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  englishText: {
    fontSize: 15,
    lineHeight: 22,
  },
  referenceText: {
    fontSize: 12,
    marginTop: 4,
  },
  counterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  counterIcon: {
    marginRight: 4,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
