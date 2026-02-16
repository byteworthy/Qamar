import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VerseConversationState {
  conversations: Record<string, ConversationMessage[]>; // key: "surah:verse"
  addMessage: (surahNumber: number, verseNumber: number, message: ConversationMessage) => void;
  getConversation: (surahNumber: number, verseNumber: number) => ConversationMessage[];
  clearConversation: (surahNumber: number, verseNumber: number) => void;
}

export const useVerseConversationStore = create<VerseConversationState>()(
  persist(
    (set, get) => ({
      conversations: {},

      addMessage: (surahNumber, verseNumber, message) => {
        const key = `${surahNumber}:${verseNumber}`;
        set((state) => ({
          conversations: {
            ...state.conversations,
            [key]: [...(state.conversations[key] || []), message],
          },
        }));
      },

      getConversation: (surahNumber, verseNumber) => {
        const key = `${surahNumber}:${verseNumber}`;
        return get().conversations[key] || [];
      },

      clearConversation: (surahNumber, verseNumber) => {
        const key = `${surahNumber}:${verseNumber}`;
        set((state) => {
          const newConversations = { ...state.conversations };
          delete newConversations[key];
          return { conversations: newConversations };
        });
      },
    }),
    {
      name: 'noor-verse-conversations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
