/**
 * PronunciationCoachScreen
 *
 * Full pronunciation coach screen for Arabic recitation practice.
 * Supports both standalone use (default Al-Fatiha verse 1) and
 * launching from the Quran reader with a specific surah/verse.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { Audio } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { AudioRecordButton } from "@/components/AudioRecordButton";
import { PronunciationFeedback } from "@/components/PronunciationFeedback";
import { NoorColors } from "@/constants/theme/colors";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useGamification } from "@/stores/gamification-store";

// ====================================================================
// Constants
// ====================================================================

const DEFAULT_ARABIC_TEXT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
const DEFAULT_SURAH = 1;
const DEFAULT_VERSE = 1;

// ====================================================================
// Route Params
// ====================================================================

type PronunciationCoachParams = {
  PronunciationCoach: {
    surahNumber?: number;
    verseNumber?: number;
    arabicText?: string;
  };
};

// ====================================================================
// Helpers
// ====================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ====================================================================
// Screen Component
// ====================================================================

export default function PronunciationCoachScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route =
    useRoute<RouteProp<PronunciationCoachParams, "PronunciationCoach">>();

  // Route params (optional)
  const surahNumber = route.params?.surahNumber ?? DEFAULT_SURAH;
  const verseNumber = route.params?.verseNumber ?? DEFAULT_VERSE;
  const initialArabicText = route.params?.arabicText ?? DEFAULT_ARABIC_TEXT;

  // Local state
  const [practiceText, setPracticeText] = useState(initialArabicText);
  const [customText, setCustomText] = useState("");
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  // Pronunciation hook
  const pronunciation = usePronunciation();
  const recordActivity = useGamification((s) => s.recordActivity);

  // Check mic permission on mount
  useEffect(() => {
    Audio.getPermissionsAsync().then(({ granted }) => {
      setMicPermission(granted);
    });
  }, []);

  // Determine which text to use for submission
  const activeText = customText.trim() || practiceText;

  // ==================================================================
  // Handlers
  // ==================================================================

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    const { granted } = await Audio.requestPermissionsAsync();
    setMicPermission(granted);
    if (!granted) {
      Alert.alert(
        "Microphone Access Needed",
        "Noor needs microphone access to listen to your recitation and provide pronunciation feedback. Please enable it in Settings.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
    }
    return granted;
  }, []);

  const handleRecordPress = useCallback(async () => {
    if (pronunciation.isRecording) {
      await pronunciation.stopPractice();
    } else {
      if (!micPermission) {
        const granted = await requestMicPermission();
        if (!granted) return;
      }
      await pronunciation.startPractice("ar-SA");
    }
  }, [pronunciation, micPermission, requestMicPermission]);

  const handleSubmit = useCallback(async () => {
    await pronunciation.submitForFeedback(activeText, surahNumber, verseNumber);
    recordActivity("pronunciation_practice");
  }, [pronunciation, activeText, surahNumber, verseNumber, recordActivity]);

  const handleTryAgain = useCallback(() => {
    pronunciation.reset();
  }, [pronunciation]);

  // ==================================================================
  // Derived state
  // ==================================================================

  const isProcessing =
    pronunciation.isTranscribing || pronunciation.isSubmitting;
  const canSubmit =
    !!pronunciation.transcript &&
    !pronunciation.isRecording &&
    !pronunciation.isSubmitting;
  const showFeedback = !!pronunciation.feedback;

  // ==================================================================
  // Render
  // ==================================================================

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top}
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
        {/* ============================================================
            Header
            ============================================================ */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.header}
        >
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Pronunciation Coach
          </ThemedText>
          <ThemedText
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Practice your Arabic recitation
          </ThemedText>
        </Animated.View>

        {/* ============================================================
            Practice Text Area
            ============================================================ */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <GlassCard style={styles.practiceCard}>
            <ThemedText style={[styles.arabicText, { color: theme.text }]}>
              {practiceText}
            </ThemedText>
          </GlassCard>

          <View
            style={[
              styles.customInputContainer,
              {
                borderColor: theme.border,
                backgroundColor: theme.glassSurface,
              },
            ]}
          >
            <TextInput
              style={[styles.customInput, { color: theme.text }]}
              placeholder="Or paste custom Arabic text here..."
              placeholderTextColor={theme.textSecondary}
              value={customText}
              onChangeText={setCustomText}
              multiline
              textAlign="right"
              editable={!pronunciation.isRecording}
            />
          </View>
        </Animated.View>

        {/* ============================================================
            Permission Priming
            ============================================================ */}
        {micPermission === false && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Pressable
              onPress={requestMicPermission}
              style={[
                styles.permissionBanner,
                { backgroundColor: NoorColors.gold + "15", borderColor: NoorColors.gold + "40" },
              ]}
            >
              <Feather name="mic" size={20} color={NoorColors.gold} />
              <View style={styles.permissionBannerText}>
                <ThemedText style={[styles.permissionTitle, { color: theme.text }]}>
                  Microphone access needed
                </ThemedText>
                <ThemedText style={[styles.permissionSubtitle, { color: theme.textSecondary }]}>
                  Tap to enable — we listen to your recitation to give personalized feedback.
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={theme.textSecondary} />
            </Pressable>
          </Animated.View>
        )}

        {/* ============================================================
            Record Section
            ============================================================ */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(300)}
          style={styles.recordSection}
        >
          {/* Duration timer (visible when recording) */}
          {pronunciation.isRecording && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.recordingInfo}
            >
              <View style={styles.recordingDot} />
              <ThemedText
                style={[styles.recordingLabel, { color: "#EF4444" }]}
              >
                Recording...
              </ThemedText>
              <ThemedText
                style={[
                  styles.durationText,
                  { color: theme.textSecondary },
                ]}
              >
                {formatDuration(pronunciation.duration)}
              </ThemedText>
            </Animated.View>
          )}

          {/* Record button */}
          <AudioRecordButton
            isRecording={pronunciation.isRecording}
            onPress={handleRecordPress}
            size={72}
            disabled={pronunciation.isSubmitting}
            style={styles.recordButton}
          />

          <ThemedText
            style={[styles.recordHint, { color: theme.textSecondary }]}
          >
            {pronunciation.isRecording
              ? "Tap to stop"
              : "Tap to start recording"}
          </ThemedText>

          {/* Transcription state */}
          {pronunciation.isTranscribing && !pronunciation.isRecording && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.statusRow}
            >
              <ActivityIndicator
                size="small"
                color={NoorColors.gold}
                style={styles.statusSpinner}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: theme.textSecondary },
                ]}
              >
                Transcribing...
              </ThemedText>
            </Animated.View>
          )}

          {/* Partial transcript while recording */}
          {pronunciation.isRecording && pronunciation.partialTranscript ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <ThemedText
                style={[
                  styles.partialTranscript,
                  { color: theme.textSecondary },
                ]}
              >
                {pronunciation.partialTranscript}
              </ThemedText>
            </Animated.View>
          ) : null}

          {/* Final transcript */}
          {pronunciation.transcript &&
            !pronunciation.isRecording &&
            !showFeedback && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                style={styles.transcriptCard}
              >
                <GlassCard style={styles.transcriptInner}>
                  <ThemedText
                    style={[
                      styles.transcriptLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Your recitation:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.transcriptText,
                      { color: theme.text },
                    ]}
                  >
                    {pronunciation.transcript}
                  </ThemedText>
                </GlassCard>
              </Animated.View>
            )}
        </Animated.View>

        {/* ============================================================
            Error
            ============================================================ */}
        {pronunciation.error && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.errorContainer,
              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
            ]}
          >
            <Feather
              name="alert-circle"
              size={16}
              color="#EF4444"
              style={styles.errorIcon}
            />
            <ThemedText style={[styles.errorText, { color: "#EF4444" }]}>
              {pronunciation.error}
            </ThemedText>
          </Animated.View>
        )}

        {/* ============================================================
            Submit Button
            ============================================================ */}
        {!showFeedback && (
          <Animated.View entering={FadeInUp.duration(400).delay(400)}>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: canSubmit
                    ? NoorColors.gold
                    : theme.border,
                  opacity: pressed && canSubmit ? 0.85 : 1,
                },
              ]}
            >
              {pronunciation.isSubmitting ? (
                <View style={styles.submitLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ThemedText style={styles.submitText}>
                    Analyzing...
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Feather
                    name="check-circle"
                    size={18}
                    color="#FFFFFF"
                    style={styles.submitIcon}
                  />
                  <ThemedText style={styles.submitText}>
                    Check Pronunciation
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </Animated.View>
        )}

        {/* ============================================================
            Feedback Section
            ============================================================ */}
        {showFeedback && pronunciation.feedback && (
          <>
            <PronunciationFeedback
              feedback={pronunciation.feedback}
              style={styles.feedbackSection}
            />

            {/* Quota indicator */}
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.quotaRow}
            >
              <Feather
                name="info"
                size={14}
                color={theme.textSecondary}
                style={styles.quotaIcon}
              />
              <ThemedText
                style={[styles.quotaText, { color: theme.textSecondary }]}
              >
                {pronunciation.feedback.remainingQuota} free checks remaining
              </ThemedText>
            </Animated.View>

            {/* Try Again button */}
            <Pressable
              onPress={handleTryAgain}
              style={({ pressed }) => [
                styles.tryAgainButton,
                {
                  borderColor: NoorColors.gold,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather
                name="refresh-cw"
                size={16}
                color={NoorColors.gold}
                style={styles.tryAgainIcon}
              />
              <ThemedText
                style={[styles.tryAgainText, { color: NoorColors.gold }]}
              >
                Try Again
              </ThemedText>
            </Pressable>
          </>
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

  // ---- Header ----
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
  },

  // ---- Practice text ----
  practiceCard: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 44,
    writingDirection: "rtl",
  },
  customInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    minHeight: 52,
  },
  customInput: {
    fontSize: 16,
    lineHeight: 24,
    writingDirection: "rtl",
  },

  // ---- Permission banner ----
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  permissionBannerText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  permissionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ---- Record section ----
  recordSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  recordButton: {
    marginBottom: 12,
  },
  recordHint: {
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 8,
  },

  // ---- Status row ----
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusSpinner: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // ---- Transcript ----
  partialTranscript: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
    paddingHorizontal: 16,
    writingDirection: "rtl",
  },
  transcriptCard: {
    marginTop: 16,
    width: "100%",
  },
  transcriptInner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  transcriptLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 32,
    writingDirection: "rtl",
  },

  // ---- Error ----
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },

  // ---- Submit button ----
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ---- Feedback ----
  feedbackSection: {
    marginBottom: 8,
  },

  // ---- Quota ----
  quotaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  quotaIcon: {
    marginRight: 6,
  },
  quotaText: {
    fontSize: 13,
    fontWeight: "400",
  },

  // ---- Try Again ----
  tryAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    marginBottom: 16,
  },
  tryAgainIcon: {
    marginRight: 8,
  },
  tryAgainText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
