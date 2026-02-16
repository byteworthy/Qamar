/**
 * TajweedGuideScreen
 *
 * Legend screen showing all 17 tajweed rules with color swatches,
 * Arabic names, English names, and descriptions. Serves as a reference
 * for users reading color-coded Quranic text.
 */

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { TAJWEED_RULES, type TajweedRule } from "@/data/tajweed-rules";

// ============================================================================
// RULE CARD
// ============================================================================

interface RuleCardProps {
  rule: TajweedRule;
  index: number;
}

function RuleCard({ rule, index }: RuleCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(80 + index * 40)}>
      <GlassCard style={styles.ruleCard}>
        <View style={styles.ruleRow}>
          {/* Color swatch */}
          <View
            style={[styles.colorSwatch, { backgroundColor: rule.color }]}
            accessibilityLabel={`${rule.name} color swatch`}
          />

          {/* Text content */}
          <View style={styles.ruleContent}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.ruleName}>{rule.name}</ThemedText>
              <ThemedText
                style={[
                  styles.ruleNameArabic,
                  {
                    color: rule.color,
                    fontFamily: Fonts?.spiritual ?? "Amiri-Regular",
                  },
                ]}
              >
                {rule.nameArabic}
              </ThemedText>
            </View>
            <ThemedText
              style={[styles.ruleDescription, { color: theme.textSecondary }]}
            >
              {rule.description}
            </ThemedText>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function TajweedGuideScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.headerTitle}>Tajweed Guide</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            Color-coded rules for Quranic recitation
          </ThemedText>
        </Animated.View>
      </View>

      {/* Rule list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {TAJWEED_RULES.map((rule, index) => (
          <RuleCard key={rule.id} rule={rule} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
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
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },

  // Rule card
  ruleCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  ruleContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  ruleNameArabic: {
    fontSize: 20,
  },
  ruleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
