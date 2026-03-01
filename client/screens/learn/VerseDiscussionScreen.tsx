import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { useVerseConversation } from "@/hooks/useVerseConversation";
import { useOfflineQuranVerses } from "@/hooks/useOfflineData";
import { QamarColors } from "@/constants/theme/colors";
import { RootStackParamList } from "@/navigation/types";

type VerseDiscussionRouteProp = RouteProp<
  RootStackParamList,
  "VerseDiscussion"
>;

export default function VerseDiscussionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<VerseDiscussionRouteProp>();
  const { surahNumber, verseNumber } = route.params;
  const { data: verses } = useOfflineQuranVerses(surahNumber);
  const verse = verses?.find((v) => v.verse_number === verseNumber);

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, sendMessage, clearHistory, isLoading, error } =
    useVerseConversation(surahNumber, verseNumber);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText("");
    await sendMessage(message);
  };

  return (
    <Screen
      title={`Discuss ${surahNumber}:${verseNumber}`}
      showBack
      scrollable={false}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* Verse Header */}
        <GlassCard style={styles.verseCard}>
          <ThemedText style={styles.verseReference}>
            Surah {surahNumber}, Verse {verseNumber}
          </ThemedText>
          <ThemedText style={[styles.verseArabic, { color: theme.text }]}>
            {verse?.arabic_text ?? "\u2026"}
          </ThemedText>
          <ThemedText
            style={[styles.verseTranslation, { color: theme.textSecondary }]}
          >
            {verse?.translation_en ?? "\u2026"}
          </ThemedText>
        </GlassCard>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Feather
                name="message-circle"
                size={48}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                Ask anything about this verse
              </ThemedText>
            </View>
          )}

          {messages.map((msg, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(300).delay(index * 50)}
            >
              <GlassCard
                style={
                  [
                    styles.messageCard,
                    msg.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ] as any
                }
              >
                <ThemedText style={[styles.messageText, { color: theme.text }]}>
                  {msg.content}
                </ThemedText>
              </GlassCard>
            </Animated.View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={QamarColors.gold} />
              <ThemedText
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Thinking...
              </ThemedText>
            </View>
          )}

          {error && (
            <GlassCard style={styles.errorCard}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </GlassCard>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundSecondary },
            ]}
            placeholder="Ask about this verse..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isLoading
                    ? QamarColors.gold
                    : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verseCard: {
    margin: 16,
    padding: 16,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  verseArabic: {
    fontSize: 24,
    fontFamily: "Amiri",
    marginBottom: 8,
    textAlign: "right",
  },
  verseTranslation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  messageCard: {
    marginBottom: 12,
    padding: 12,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  assistantMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
