/**
 * TranslatorScreen
 *
 * Arabic <-> English translator with TTS playback and AI-powered explanations.
 */

import React, { useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Animated, { FadeInUp, FadeInDown, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { TTSButton } from "@/components/TTSButton";
import { NoorColors } from "@/constants/theme/colors";
import { useGamification } from "@/stores/gamification-store";

// ====================================================================
// TranslatorScreen
// ====================================================================

export default function TranslatorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    inputText,
    direction,
    result,
    explanation,
    isTranslating,
    isExplaining,
    error,
    remainingQuota,
    setInputText,
    toggleDirection,
    translate,
    explain,
    clear,
  } = useTranslation();
  const recordActivity = useGamification((s) => s.recordActivity);
  const hasRecordedTranslation = useRef(false);

  const isArabicInput = direction === "ar-en";
  const isArabicOutput = direction === "en-ar";

  // ====================================================================
  // Helpers
  // ====================================================================

  const placeholderText = isArabicInput
    ? "اكتب نص عربي..."
    : "Type English text...";

  const fromLabel = direction === "en-ar" ? "English" : "Arabic";
  const toLabel = direction === "en-ar" ? "Arabic" : "English";

  const outputLanguage = isArabicOutput ? "ar-SA" : "en-US";

  const handleTranslate = async () => {
    await translate();
    if (!hasRecordedTranslation.current) {
      recordActivity("translation_used");
      hasRecordedTranslation.current = true;
    }
  };

  const quotaLabel =
    remainingQuota !== null ? `${remainingQuota} of 3 free today` : null;

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==== Header ==== */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <ThemedText style={styles.headerTitle}>Translator</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Arabic ↔ English
          </ThemedText>
        </Animated.View>

        {/* ==== Direction Toggle ==== */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.directionRow}
        >
          <ThemedText
            style={[
              styles.directionLabel,
              { color: direction === "en-ar" ? NoorColors.gold : theme.textSecondary },
            ]}
          >
            {fromLabel}
          </ThemedText>

          <TouchableOpacity
            onPress={toggleDirection}
            style={[styles.swapButton, { borderColor: theme.border }]}
            activeOpacity={0.7}
            accessibilityLabel="Swap translation direction"
            accessibilityRole="button"
          >
            <Feather name="repeat" size={22} color={NoorColors.gold} />
          </TouchableOpacity>

          <ThemedText
            style={[
              styles.directionLabel,
              { color: direction === "ar-en" ? NoorColors.gold : theme.textSecondary },
            ]}
          >
            {toLabel}
          </ThemedText>
        </Animated.View>

        {/* ==== Input Area ==== */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  textAlign: isArabicInput ? "right" : "left",
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={placeholderText}
              placeholderTextColor={theme.textSecondary}
              multiline
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={clear}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear input"
                accessibilityRole="button"
              >
                <Feather name="x-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </GlassCard>
        </Animated.View>

        {/* ==== Translate Button ==== */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <TouchableOpacity
            onPress={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            activeOpacity={0.8}
            accessibilityLabel="Translate"
            accessibilityRole="button"
          >
            <LinearGradient
              colors={
                !inputText.trim() || isTranslating
                  ? ["#8a7a50", "#6b5e3e"]
                  : [NoorColors.gold, "#c7a84e"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.translateButton,
                (!inputText.trim() || isTranslating) && styles.translateButtonDisabled,
              ]}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.translateButtonText}>Translate</ThemedText>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ==== Error ==== */}
        {error && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color={theme.error} />
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {error}
            </ThemedText>
          </Animated.View>
        )}

        {/* ==== Result Area ==== */}
        {result && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <ThemedText
                  style={[
                    isArabicOutput ? styles.resultTextArabic : styles.resultTextEnglish,
                    {
                      color: theme.text,
                      textAlign: isArabicOutput ? "right" : "left",
                      flex: 1,
                    },
                  ]}
                >
                  {result.translatedText}
                </ThemedText>
                <TTSButton
                  text={result.translatedText}
                  language={outputLanguage}
                  size={24}
                  style={styles.ttsButton}
                />
              </View>

              {/* Transliteration (Arabic output only) */}
              {isArabicOutput && result.transliteration && (
                <ThemedText
                  style={[styles.transliteration, { color: theme.textSecondary }]}
                >
                  {result.transliteration}
                </ThemedText>
              )}

              {/* Explain Button */}
              <View style={styles.explainRow}>
                <TouchableOpacity
                  onPress={explain}
                  disabled={isExplaining}
                  style={[styles.explainButton, { borderColor: NoorColors.gold }]}
                  activeOpacity={0.7}
                  accessibilityLabel="Explain translation"
                  accessibilityRole="button"
                >
                  {isExplaining ? (
                    <ActivityIndicator size="small" color={NoorColors.gold} />
                  ) : (
                    <>
                      <Feather
                        name="help-circle"
                        size={16}
                        color={NoorColors.gold}
                        style={styles.explainIcon}
                      />
                      <ThemedText style={[styles.explainButtonText, { color: NoorColors.gold }]}>
                        Explain
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>

                {quotaLabel && (
                  <View style={[styles.quotaBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <ThemedText style={[styles.quotaText, { color: theme.textSecondary }]}>
                      {quotaLabel}
                    </ThemedText>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* ==== Explanation Area ==== */}
        {explanation && (
          <Animated.View entering={FadeInUp.duration(400)}>
            <GlassCard style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Feather name="zap" size={18} color={NoorColors.gold} />
                <ThemedText style={[styles.explanationTitle, { color: NoorColors.gold }]}>
                  AI Explanation
                </ThemedText>
              </View>
              <ThemedText style={[styles.explanationText, { color: theme.text }]}>
                {explanation}
              </ThemedText>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ====================================================================
// Styles
// ====================================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // ==== Header ====
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
  },

  // ==== Direction Toggle ====
  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 16,
  },
  directionLabel: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "center",
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==== Input ====
  inputCard: {
    marginBottom: 16,
    position: "relative",
  },
  textInput: {
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 4,
    paddingRight: 32,
  },
  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // ==== Translate Button ====
  translateButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  translateButtonDisabled: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // ==== Error ====
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // ==== Result ====
  resultCard: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  resultTextArabic: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 42,
  },
  resultTextEnglish: {
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 30,
  },
  ttsButton: {
    marginTop: 4,
  },
  transliteration: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 8,
  },

  // ==== Explain ====
  explainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  explainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 110,
  },
  explainIcon: {
    marginRight: 6,
  },
  explainButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  quotaBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  quotaText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ==== Explanation ====
  explanationCard: {
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
