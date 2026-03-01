/**
 * DuaCard Component
 *
 * Displays a dua (supplication) with Arabic text, transliteration, translation,
 * and source citation. Provides TTS playback and favorite toggling.
 *
 * Usage:
 * <DuaCard
 *   arabic="اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ"
 *   transliteration="Allahumma inni as'aluka al-jannah"
 *   translation="O Allah, I ask You for Paradise"
 *   source="Sahih Bukhari"
 *   id="dua-123"
 *   isFavorite={false}
 *   onToggleFavorite={() => {}}
 * />
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { TTSButton } from "@/components/TTSButton";
import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme/colors";
import { hapticLight } from "@/lib/haptics";

// =============================================================================
// TYPES
// =============================================================================

interface DuaCardProps {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  id?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DuaCard({
  arabic,
  transliteration,
  translation,
  source,
  isFavorite = false,
  onToggleFavorite,
}: DuaCardProps) {
  const { theme } = useTheme();

  function handleToggleFavorite(): void {
    if (onToggleFavorite) {
      hapticLight();
      onToggleFavorite();
    }
  }

  return (
    <GlassCard style={styles.card}>
      {/* Arabic Text */}
      <ThemedText style={styles.arabic}>{arabic}</ThemedText>

      {/* Transliteration */}
      <ThemedText
        style={[styles.transliteration, { color: theme.textSecondary }]}
      >
        {transliteration}
      </ThemedText>

      {/* English Translation */}
      <ThemedText style={[styles.translation, { color: theme.text }]}>
        {translation}
      </ThemedText>

      {/* Source Badge */}
      <View style={[styles.sourceBadge, { borderColor: NoorColors.gold }]}>
        <ThemedText style={[styles.sourceText, { color: NoorColors.gold }]}>
          {source}
        </ThemedText>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {/* TTS Button */}
        <TTSButton text={arabic} language="ar" size={22} />

        {/* Favorite Button */}
        {onToggleFavorite && (
          <Pressable
            onPress={handleToggleFavorite}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            style={styles.favoriteButton}
          >
            <Feather
              name="heart"
              size={22}
              color={isFavorite ? NoorColors.gold : theme.textSecondary}
              fill={isFavorite ? NoorColors.gold : "transparent"}
            />
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  arabic: {
    fontSize: 26,
    fontFamily: "Amiri",
    textAlign: "right",
    lineHeight: 42,
  },
  transliteration: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  translation: {
    fontSize: 15,
    lineHeight: 24,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 8,
  },
  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
