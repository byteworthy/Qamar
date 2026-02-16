/**
 * ArabicTutorScreen
 *
 * AI-powered Arabic language tutor with four learning modes:
 * vocabulary, grammar, conversation, and Quran words.
 */

import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp, FadeInDown, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { NoorColors } from "@/constants/theme/colors";
import { useAITutor, TutorMode, TutorMessage } from "@/hooks/useAITutor";
import { useGamification } from "@/stores/gamification-store";

// ============================================================
// Types & Constants
// ============================================================

interface ModeOption {
  key: TutorMode;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const MODE_OPTIONS: ModeOption[] = [
  { key: "vocabulary", label: "Vocabulary", icon: "book-open" },
  { key: "grammar", label: "Grammar", icon: "edit-3" },
  { key: "conversation", label: "Conversation", icon: "message-circle" },
  { key: "quran_words", label: "Quran Words", icon: "feather" },
];

const QUICK_PROMPTS: Record<TutorMode, string[]> = {
  vocabulary: [
    "Teach me 5 common Arabic greetings",
    "What does 'mashallah' mean?",
    "Daily vocabulary for the mosque",
  ],
  grammar: [
    "Explain Arabic verb conjugation basics",
    "How do Arabic pronouns work?",
    "What are the Arabic cases (i'rab)?",
  ],
  conversation: [
    "Let's practice ordering food in Arabic",
    "Help me introduce myself in Arabic",
    "Practice asking for directions",
  ],
  quran_words: [
    "Explain the word 'taqwa' in the Quran",
    "Break down Ayat al-Kursi word by word",
    "What does 'falah' mean in Surah Al-Mu'minun?",
  ],
};

const MODE_EMPTY_TITLES: Record<TutorMode, string> = {
  vocabulary: "Build Your Arabic Vocabulary",
  grammar: "Master Arabic Grammar",
  conversation: "Practice Real Conversations",
  quran_words: "Understand Quranic Arabic",
};

const MODE_EMPTY_SUBTITLES: Record<TutorMode, string> = {
  vocabulary: "Learn everyday words and phrases with your AI tutor.",
  grammar: "Understand the structure and rules of Arabic language.",
  conversation: "Practice speaking and comprehension in real-world scenarios.",
  quran_words: "Dive deep into the vocabulary of the Holy Quran.",
};

// ============================================================
// Typing Indicator Component
// ============================================================

function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.typingRow}>
      <View style={styles.typingDots}>
        <Animated.View
          entering={FadeIn.delay(0).duration(400)}
          style={styles.typingDot}
        />
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.typingDot}
        />
        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={styles.typingDot}
        />
      </View>
    </Animated.View>
  );
}

// ============================================================
// Main Screen
// ============================================================

export default function ArabicTutorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = React.useState("");
  const recordActivity = useGamification((s) => s.recordActivity);
  const hasRecordedSession = useRef(false);

  const {
    messages,
    isLoading,
    error,
    mode,
    remainingQuota,
    setMode,
    sendMessage,
    clearChat,
  } = useAITutor();

  // ============================
  // Auto-scroll to bottom
  // ============================

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  // ============================
  // Handlers
  // ============================

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    await sendMessage(text);
    if (!hasRecordedSession.current) {
      recordActivity("tutor_session");
      hasRecordedSession.current = true;
    }
  }, [inputText, isLoading, sendMessage, recordActivity]);

  const handleQuickPrompt = useCallback(
    async (prompt: string) => {
      if (isLoading) return;
      setInputText("");
      await sendMessage(prompt);
      if (!hasRecordedSession.current) {
        recordActivity("tutor_session");
        hasRecordedSession.current = true;
      }
    },
    [isLoading, sendMessage, recordActivity]
  );

  // ============================
  // Show quota badge
  // ============================

  const showQuotaBadge = remainingQuota !== null && remainingQuota <= 3;

  // ============================================================
  // Render: Mode Selector
  // ============================================================

  const renderModeSelector = () => (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <FlatList
        horizontal
        data={MODE_OPTIONS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeListContent}
        renderItem={({ item }) => {
          const isActive = mode === item.key;
          return (
            <TouchableOpacity
              onPress={() => setMode(item.key)}
              activeOpacity={0.7}
              style={[
                styles.modePill,
                {
                  backgroundColor: isActive
                    ? NoorColors.gold
                    : theme.glassSurface,
                  borderColor: isActive
                    ? NoorColors.gold
                    : theme.glassStroke,
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={14}
                color={isActive ? "#FFFFFF" : theme.text}
                style={styles.modePillIcon}
              />
              <ThemedText
                style={[
                  styles.modePillText,
                  { color: isActive ? "#FFFFFF" : theme.text },
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          );
        }}
      />
    </Animated.View>
  );

  // ============================================================
  // Render: Empty State
  // ============================================================

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInUp.duration(500).delay(200)}
      style={styles.emptyContainer}
    >
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: NoorColors.gold + "18" },
        ]}
      >
        <Feather name="globe" size={32} color={NoorColors.gold} />
      </View>
      <ThemedText style={styles.emptyTitle}>
        {MODE_EMPTY_TITLES[mode]}
      </ThemedText>
      <ThemedText
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        {MODE_EMPTY_SUBTITLES[mode]}
      </ThemedText>

      <View style={styles.quickPromptsContainer}>
        <ThemedText
          style={[styles.quickPromptsLabel, { color: theme.textSecondary }]}
        >
          Try asking:
        </ThemedText>
        {QUICK_PROMPTS[mode].map((prompt, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleQuickPrompt(prompt)}
            activeOpacity={0.7}
          >
            <GlassCard
              style={{ ...styles.quickPromptCard, borderColor: theme.glassStroke }}
            >
              <ThemedText style={styles.quickPromptText}>{prompt}</ThemedText>
              <Feather
                name="arrow-right"
                size={14}
                color={NoorColors.gold}
              />
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  // ============================================================
  // Render: Message Bubble
  // ============================================================

  const renderMessage = (message: TutorMessage, index: number) => {
    const isUser = message.role === "user";

    return (
      <Animated.View
        key={message.id}
        entering={FadeInUp.duration(300).delay(index === messages.length - 1 ? 100 : 0)}
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {/* Assistant avatar */}
        {!isUser && (
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: NoorColors.gold + "18" },
            ]}
          >
            <ThemedText
              style={[styles.avatarText, { color: NoorColors.gold }]}
            >
              M
            </ThemedText>
          </View>
        )}

        {/* Bubble */}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? {
                  backgroundColor: NoorColors.gold + "18",
                  borderColor: NoorColors.gold + "30",
                }
              : {
                  backgroundColor: theme.glassSurface,
                  borderColor: theme.glassStroke,
                },
            isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          ]}
        >
          <ThemedText style={styles.messageText}>{message.content}</ThemedText>
        </View>
      </Animated.View>
    );
  };

  // ============================================================
  // Render: Error Banner
  // ============================================================

  const renderError = () => {
    if (!error) return null;
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.errorBanner, { backgroundColor: theme.error + "18" }]}
      >
        <Feather name="alert-circle" size={16} color={theme.error} />
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          {error}
        </ThemedText>
      </Animated.View>
    );
  };

  // ============================================================
  // Main Render
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* ==== Header ==== */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerTitle}>Arabic Tutor</ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
          >
            AI-powered language learning
          </ThemedText>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={clearChat}
            style={[
              styles.clearButton,
              { backgroundColor: theme.glassSurface },
            ]}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ==== Mode Selector ==== */}
      {renderModeSelector()}

      {/* ==== Error Banner ==== */}
      {renderError()}

      {/* ==== Chat Area ==== */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={[
          styles.chatContent,
          messages.length === 0 && styles.chatContentEmpty,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </ScrollView>

      {/* ==== Input Bar ==== */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom + 8,
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.border,
          },
        ]}
      >
        {/* Quota badge */}
        {showQuotaBadge && (
          <View style={styles.quotaBadgeRow}>
            <View
              style={[
                styles.quotaBadge,
                { backgroundColor: NoorColors.gold + "18" },
              ]}
            >
              <ThemedText
                style={[styles.quotaBadgeText, { color: NoorColors.gold }]}
              >
                {remainingQuota} of 3 free today
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.glassSurface,
                borderColor: theme.glassStroke,
                color: theme.text,
              },
            ]}
            placeholder="Ask your Arabic tutor..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={3000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isLoading
                    ? NoorColors.gold
                    : theme.glassSurface,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.textSecondary} />
            ) : (
              <Feather
                name="send"
                size={18}
                color={
                  inputText.trim() ? "#FFFFFF" : theme.textSecondary
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ==== Header ====
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==== Mode Selector ====
  modeListContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modePillIcon: {
    marginRight: 6,
  },
  modePillText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ==== Error Banner ====
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },

  // ==== Chat Area ====
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  chatContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // ==== Empty State ====
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  quickPromptsContainer: {
    width: "100%",
  },
  quickPromptsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  quickPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },

  // ==== Messages ====
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // ==== Typing Indicator ====
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 36,
    marginBottom: 12,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: NoorColors.gold,
    opacity: 0.6,
  },

  // ==== Input Bar ====
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quotaBadgeRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  quotaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quotaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
