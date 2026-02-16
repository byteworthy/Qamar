/**
 * HifzPeekOverlay Component
 *
 * Full-screen overlay that appears during hidden verse recitation mode.
 * Allows users to reveal hints (next word or full ayah) when struggling with memorization.
 *
 * Features:
 * - Dimmed background overlay with tap-to-dismiss
 * - Two reveal actions: next word or full ayah
 * - Displays revealed text with fade-in animation
 * - Glassmorphism card design
 * - Accessible with proper ARIA labels
 *
 * Usage:
 * <HifzPeekOverlay
 *   visible={showPeek}
 *   onRevealWord={handleRevealWord}
 *   onRevealAyah={handleRevealAyah}
 *   onDismiss={handleDismiss}
 *   revealedText={revealedArabicText}
 * />
 */

import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { GlassCard } from "./GlassCard";
import { useTheme } from "@/hooks/useTheme";

export interface HifzPeekOverlayProps {
  visible: boolean;
  onRevealWord: () => void;
  onRevealAyah: () => void;
  onDismiss: () => void;
  revealedText?: string;
}

export function HifzPeekOverlay({
  visible,
  onRevealWord,
  onRevealAyah,
  onDismiss,
  revealedText,
}: HifzPeekOverlayProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={styles.background}
        onPress={onDismiss}
        testID="hifz-peek-overlay-background"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <GlassCard elevated style={styles.card}>
            {/* Title */}
            <ThemedText type="h3" style={styles.title}>
              Need a hint?
            </ThemedText>

            {/* Description */}
            <ThemedText type="body" style={styles.description}>
              Tap to reveal the next word or show the full ayah
            </ThemedText>

            {/* Revealed Text (if provided) */}
            {revealedText && (
              <Animated.View entering={FadeIn} style={styles.revealedContainer}>
                <ThemedText
                  style={[
                    styles.revealedText,
                    { color: theme.primary },
                  ]}
                >
                  {revealedText}
                </ThemedText>
              </Animated.View>
            )}

            {/* Reveal Buttons */}
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={onRevealWord}
                accessibilityRole="button"
                accessibilityLabel="Reveal next word"
                accessibilityHint="Shows the next word in the ayah as a hint"
              >
                <ThemedText
                  style={[
                    styles.buttonText,
                    { color: theme.onPrimary },
                  ]}
                >
                  Reveal Next Word
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={onRevealAyah}
                accessibilityRole="button"
                accessibilityLabel="Reveal full ayah"
                accessibilityHint="Shows the complete ayah text"
              >
                <ThemedText style={styles.buttonText}>
                  Reveal Full Ayah
                </ThemedText>
              </Pressable>
            </View>

            {/* Cancel Button */}
            <Pressable
              style={styles.cancelButton}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Close the hint overlay"
            >
              <ThemedText
                type="body"
                style={[styles.cancelText, { color: theme.textSecondary }]}
              >
                Cancel
              </ThemedText>
            </Pressable>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 320,
    maxWidth: "90%",
    padding: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  revealedContainer: {
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  revealedText: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    // No additional styling needed
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
  },
});
