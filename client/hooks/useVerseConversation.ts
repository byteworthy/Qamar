import { useState } from "react";
import {
  useVerseConversationStore,
  ConversationMessage,
} from "@/stores/verse-conversation-store";
import { useGamification } from "@/stores/gamification-store";

export function useVerseConversation(surahNumber: number, verseNumber: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage, getConversation, clearConversation } =
    useVerseConversationStore();
  const { recordActivity } = useGamification();

  const messages = getConversation(surahNumber, verseNumber);

  const sendMessage = async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message to store immediately
    const userMsg: ConversationMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    addMessage(surahNumber, verseNumber, userMsg);

    try {
      const response = await fetch("/api/verse/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber,
          verseNumber,
          message: userMessage,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      // Add assistant response to store
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      addMessage(surahNumber, verseNumber, assistantMsg);

      // Record gamification activity on first message
      if (messages.length === 0) {
        recordActivity("verse_discussion");
      }
    } catch (err: any) {
      setError(err.message);
      // Remove the user message we optimistically added
      clearConversation(surahNumber, verseNumber);
      messages
        .slice(0, -1)
        .forEach((msg) => addMessage(surahNumber, verseNumber, msg));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    clearConversation(surahNumber, verseNumber);
  };

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    error,
  };
}
