/**
 * WordByWordPlayer Component
 *
 * Renders each word of a Quran verse as a separate tappable element with
 * word-level audio playback and real-time highlighting. The currently playing
 * word is highlighted in gold to track along with the recitation.
 *
 * Usage:
 * <WordByWordPlayer
 *   surahNumber={1}
 *   verseNumber={1}
 *   arabicText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
 * />
 */

import React, { useMemo } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useWordByWordAudio } from "@/hooks/useWordByWordAudio";
import { NoorColors } from "@/constants/theme/colors";
import { BorderRadius, Spacing, Fonts } from "@/constants/theme";

// =============================================================================
// TYPES
// =============================================================================

interface WordByWordPlayerProps {
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  style?: ViewStyle;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface WordProps {
  word: string;
  index: number;
  isActive: boolean;
  onPress: () => void;
}

function AnimatedWord({ word, index, isActive, onPress }: WordProps) {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isActive ? `${NoorColors.gold}20` : "transparent",
        { duration: 200 }
      ),
    };
  }, [isActive]);

  const textColor = isActive ? NoorColors.gold : theme.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play word ${index}`}
      accessibilityHint="Tap to play this word"
    >
      <Animated.View style={[styles.wordContainer, animatedStyle]}>
        <ThemedText
          style={[
            styles.arabicWord,
            { color: textColor },
          ]}
        >
          {word}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WordByWordPlayer({
  surahNumber,
  verseNumber,
  arabicText,
  style,
}: WordByWordPlayerProps) {
  const { theme } = useTheme();
  const {
    isPlaying,
    currentWordIndex,
    isLoading,
    error,
    playAll,
    playWord,
    stop,
  } = useWordByWordAudio();

  const words = useMemo(() => arabicText.split(/\s+/).filter(Boolean), [arabicText]);
  const wordCount = words.length;

  function handleTogglePlayback(): void {
    if (isPlaying) {
      stop();
    } else {
      playAll(surahNumber, verseNumber, wordCount);
    }
  }

  function handleWordPress(wordIndex: number): void {
    playWord(surahNumber, verseNumber, wordIndex);
  }

  function getPlayButtonIcon(): "play" | "square" {
    if (isPlaying) return "square";
    return "play";
  }

  return (
    <View style={[styles.container, style]}>
      {/* Play/Stop button */}
      <Pressable
        onPress={handleTogglePlayback}
        style={[styles.playButton, { backgroundColor: theme.backgroundSecondary }]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Stop playback" : "Play all words"}
        accessibilityHint={
          isPlaying
            ? "Stops word-by-word audio playback"
            : "Plays each word of the verse sequentially"
        }
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={NoorColors.gold} />
        ) : (
          <Feather
            name={getPlayButtonIcon()}
            size={20}
            color={NoorColors.gold}
          />
        )}
      </Pressable>

      {/* Error message */}
      {error && (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}

      {/* Arabic words grid (right-to-left) */}
      <View style={styles.wordsContainer}>
        {words.map((word, index) => {
          // Word indices are 1-based in the audio CDN
          const wordIndex = index + 1;
          const isActive = isPlaying && currentWordIndex === wordIndex;

          return (
            <AnimatedWord
              key={`${verseNumber}-${wordIndex}`}
              word={word}
              index={wordIndex}
              isActive={isActive}
              onPress={() => handleWordPress(wordIndex)}
            />
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  wordsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  wordContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  arabicWord: {
    fontFamily: Fonts?.spiritual ?? "Amiri-Regular",
    fontSize: 26,
    lineHeight: 44,
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
});
