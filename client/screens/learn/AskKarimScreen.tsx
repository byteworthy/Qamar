import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import * as Sentry from "@sentry/react-native";
import { useAppState, selectIsOffline } from "@/stores/app-state";

// =============================================================================
// TYPES
// =============================================================================

interface Citation {
  type: "quran" | "hadith" | "concept";
  reference: string;
  text: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: number;
}

// =============================================================================
// QUICK PROMPTS
// =============================================================================

const QUICK_PROMPTS = [
  {
    text: "What does the Quran say about patience?",
    icon: "book-open" as const,
  },
  {
    text: "Explain the concept of Tawakkul",
    icon: "compass" as const,
  },
  {
    text: "Help me understand Surah Al-Fatiha",
    icon: "sunrise" as const,
  },
  {
    text: "What are the morning adhkar?",
    icon: "sun" as const,
  },
  {
    text: "How did the Prophet deal with sadness?",
    icon: "heart" as const,
  },
];

// =============================================================================
// TYPING INDICATOR
// =============================================================================

function TypingIndicator({ theme }: { theme: ReturnType<typeof useTheme>["theme"] }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;
    dot1.value = withRepeat(
      withSequence(
        withTiming(-6, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    const timer2 = setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(-6, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, 150);
    const timer3 = setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(-6, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, 300);
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const animStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const animStyle2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const animStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  const dotStyle = {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: NoorColors.gold,
    marginHorizontal: 3,
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.messageBubbleAssistant,
        { backgroundColor: theme.glassSurface, borderColor: theme.glassStroke },
      ]}
    >
      <View style={styles.typingContainer}>
        <Animated.View style={[dotStyle, animStyle1]} />
        <Animated.View style={[dotStyle, animStyle2]} />
        <Animated.View style={[dotStyle, animStyle3]} />
      </View>
    </Animated.View>
  );
}

// =============================================================================
// CITATION CARD
// =============================================================================

function CitationCard({
  citation,
  theme,
}: {
  citation: Citation;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const isQuran = citation.type === "quran";
  const isHadith = citation.type === "hadith";

  const iconName = isQuran ? "book-open" : isHadith ? "bookmark" : "info";
  const label = isQuran ? "Quran" : isHadith ? "Hadith" : "Concept";
  const accentColor = isQuran ? NoorColors.emerald : isHadith ? NoorColors.gold : NoorColors.twilightLight;

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(100)}>
      <View
        style={[
          styles.citationCard,
          {
            backgroundColor: theme.glassSurface,
            borderColor: accentColor + "40",
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={styles.citationHeader}>
          <Feather name={iconName} size={14} color={accentColor} />
          <ThemedText style={[styles.citationLabel, { color: accentColor }]}>
            {label}
          </ThemedText>
          <ThemedText style={[styles.citationRef, { color: theme.textSecondary }]}>
            {citation.reference}
          </ThemedText>
        </View>
        <ThemedText style={[styles.citationText, { color: theme.text }]}>
          {citation.text}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

function MessageBubble({
  message,
  theme,
  index,
}: {
  message: ChatMessage;
  theme: ReturnType<typeof useTheme>["theme"];
  index: number;
}) {
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={FadeInUp.duration(250).delay(Math.min(index * 50, 200))}
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
      ]}
    >
      {!isUser && (
        <View style={[styles.avatarContainer, { backgroundColor: NoorColors.gold + "20" }]}>
          <ThemedText style={styles.avatarText}>K</ThemedText>
        </View>
      )}
      <View
        style={[
          isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          isUser
            ? { backgroundColor: NoorColors.gold + "18", borderColor: NoorColors.gold + "30" }
            : { backgroundColor: theme.glassSurface, borderColor: theme.glassStroke },
        ]}
      >
        <ThemedText style={[styles.messageText, { color: theme.text }]}>
          {message.content}
        </ThemedText>
      </View>
      {message.citations && message.citations.length > 0 && (
        <View style={styles.citationsContainer}>
          {message.citations.map((citation, i) => (
            <CitationCard key={`${message.id}-cite-${i}`} citation={citation} theme={theme} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function AskKarimScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const isOffline = useAppState(selectIsOffline);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const conversationHistory = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);
      Keyboard.dismiss();

      Sentry.startSpan(
        { name: "ask_karim.message_sent", op: "ui.action" },
        () => {},
      );

      try {
        const response = await fetch("/api/companion/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: conversationHistory.current,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          citations: data.citations,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        conversationHistory.current = [
          ...conversationHistory.current,
          { role: "user" as const, content: text.trim() },
          { role: "assistant" as const, content: data.response },
        ].slice(-20);
      } catch {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check your connection and try again, inshaAllah.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSend = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.headerInner}>
          <View style={[styles.headerAvatar, { backgroundColor: NoorColors.gold + "20" }]}>
            <ThemedText style={styles.headerAvatarText}>K</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.headerTitle} accessibilityRole="header">
              Karim
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Your Islamic knowledge companion
            </ThemedText>
          </View>
        </Animated.View>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View
          style={[
            styles.offlineBanner,
            { backgroundColor: NoorColors.gold + "18", borderColor: NoorColors.gold + "30" },
          ]}
        >
          <Feather name="wifi-off" size={14} color={NoorColors.gold} />
          <ThemedText style={[styles.offlineBannerText, { color: NoorColors.gold }]}>
            You're offline. Karim needs a connection to respond.
          </ThemedText>
        </View>
      )}

      {/* Messages or Empty State */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isEmpty && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Animated.View entering={FadeIn.duration(400)} style={styles.emptyHeader}>
              <View style={[styles.emptyAvatar, { backgroundColor: NoorColors.gold + "15" }]}>
                <ThemedText style={styles.emptyAvatarText}>{"\u2728"}</ThemedText>
              </View>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                Assalamu Alaikum
              </ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                I'm Karim, your companion for Islamic reflection and learning. Ask me anything or choose a topic below.
              </ThemedText>
            </Animated.View>

            <View style={styles.quickPromptsGrid}>
              {QUICK_PROMPTS.map((prompt, index) => (
                <Animated.View
                  key={prompt.text}
                  entering={FadeInUp.duration(300).delay(150 + index * 80)}
                >
                  <Pressable
                    onPress={() => sendMessage(prompt.text)}
                    style={({ pressed }) => [
                      styles.quickPromptCard,
                      {
                        backgroundColor: theme.glassSurface,
                        borderColor: theme.glassStroke,
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={prompt.text}
                  >
                    <Feather
                      name={prompt.icon}
                      size={16}
                      color={NoorColors.gold}
                      style={styles.quickPromptIcon}
                    />
                    <ThemedText
                      style={[styles.quickPromptText, { color: theme.text }]}
                      numberOfLines={2}
                    >
                      {prompt.text}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id} message={msg} theme={theme} index={index} />
            ))}
            {isLoading && <TypingIndicator theme={theme} />}
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Ask Karim anything..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={5000}
            editable={!isLoading}
            returnKeyType="default"
            blurOnSubmit={false}
            accessibilityLabel="Message input"
            accessibilityHint="Type a question or message for Karim"
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading || isOffline}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isLoading && !isOffline
                    ? NoorColors.gold
                    : theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={NoorColors.background} />
            ) : (
              <Feather
                name="arrow-up"
                size={18}
                color={inputText.trim() ? NoorColors.background : theme.textSecondary}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontSize: 16, fontWeight: "700", color: NoorColors.gold },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, opacity: 0.8 },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  offlineBannerText: { fontSize: 13, fontWeight: "500", flex: 1 },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: "center" },

  emptyState: { alignItems: "center", paddingHorizontal: 8 },
  emptyHeader: { alignItems: "center", marginBottom: 32 },
  emptyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyAvatarText: { fontSize: 28 },
  emptyTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },

  quickPromptsGrid: { width: "100%", gap: 10 },
  quickPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  quickPromptIcon: { flexShrink: 0 },
  quickPromptText: { fontSize: 14, lineHeight: 20, flex: 1 },

  messagesContainer: { gap: 4, paddingBottom: 8 },
  messageRow: { marginBottom: 8 },
  messageRowUser: { alignItems: "flex-end" },
  messageRowAssistant: { alignItems: "flex-start" },
  messageBubbleUser: {
    maxWidth: "82%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderWidth: 1,
  },
  messageBubbleAssistant: {
    maxWidth: "88%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    marginLeft: 40,
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    bottom: 0,
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: NoorColors.gold },
  messageText: { fontSize: 15, lineHeight: 22 },

  citationsContainer: {
    marginTop: 8,
    marginLeft: 40,
    gap: 8,
    maxWidth: "88%",
  },
  citationCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  citationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  citationLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  citationRef: { fontSize: 11, flex: 1, textAlign: "right" },
  citationText: { fontSize: 13, lineHeight: 19, fontStyle: "italic" },

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },

  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    maxHeight: 100,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
