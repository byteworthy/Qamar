/**
 * useAITutor Hook
 *
 * Manages chat state for the Arabic Language Tutor.
 * Follows the same conversationHistory.current pattern as AskAmarScreen.
 */

import { useState, useCallback, useRef } from "react";
import { apiRequest } from "@/lib/query-client";
import * as Sentry from "@sentry/react-native";

// ============================================================
// Types
// ============================================================

export type TutorMode = "vocabulary" | "grammar" | "conversation" | "quran_words";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AITutorHook {
  messages: TutorMessage[];
  isLoading: boolean;
  error: string | null;
  mode: TutorMode;
  remainingQuota: number | null;
  setMode: (mode: TutorMode) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

// ============================================================
// Constants
// ============================================================

const MAX_CONVERSATION_HISTORY = 20;

// ============================================================
// Hook
// ============================================================

export function useAITutor(): AITutorHook {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setModeState] = useState<TutorMode>("vocabulary");
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const conversationHistory = useRef<Array<{ role: string; content: string }>>(
    []
  );

  // ============================
  // Generate unique message ID
  // ============================

  const generateId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // ============================
  // Send message
  // ============================

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const trimmed = text.trim();
      setError(null);

      // Add user message to state
      const userMessage: TutorMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Add to conversation history ref
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: "user", content: trimmed },
      ].slice(-MAX_CONVERSATION_HISTORY);

      setIsLoading(true);

      try {
        const response = await Sentry.startSpan(
          { name: "tutor.chat", op: "http.client" },
          async () => {
            return await apiRequest("POST", "/api/tutor/chat", {
              message: trimmed,
              mode,
              conversationHistory: conversationHistory.current,
            });
          }
        );

        if (response.status === 429) {
          setError(
            "You've reached the rate limit. Please wait a moment before trying again."
          );
          // Remove the user message we optimistically added
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          conversationHistory.current = conversationHistory.current.slice(0, -1);
          return;
        }

        if (response.status === 403) {
          setError(
            "You've used all your free questions for today. Upgrade to Qamar Plus for unlimited access."
          );
          // Remove the user message we optimistically added
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          conversationHistory.current = conversationHistory.current.slice(0, -1);
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Add assistant message to state
        const assistantMessage: TutorMessage = {
          id: generateId(),
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Add to conversation history ref
        conversationHistory.current = [
          ...conversationHistory.current,
          { role: "assistant", content: data.response },
        ].slice(-MAX_CONVERSATION_HISTORY);

        // Update remaining quota
        if (data.remainingQuota !== undefined) {
          setRemainingQuota(data.remainingQuota);
        }
      } catch (err) {
        Sentry.captureException(err);
        setError("Something went wrong. Please try again.");

        // Remove the user message we optimistically added
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        conversationHistory.current = conversationHistory.current.slice(0, -1);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, mode, generateId]
  );

  // ============================
  // Clear chat
  // ============================

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    conversationHistory.current = [];
  }, []);

  // ============================
  // Set mode (clears chat)
  // ============================

  const setMode = useCallback(
    (newMode: TutorMode) => {
      if (newMode === mode) return;
      setModeState(newMode);
      setMessages([]);
      setError(null);
      conversationHistory.current = [];
    },
    [mode]
  );

  return {
    messages,
    isLoading,
    error,
    mode,
    remainingQuota,
    setMode,
    sendMessage,
    clearChat,
  };
}
