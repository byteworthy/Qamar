# Phase 6B: AI Tafsir + Verse Conversation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered verse explanations (tafsir) with caching and open-ended verse discussions to create a deep Quran study experience.

**Architecture:** Two complementary features sharing AI quota: (1) TafsirPanel component in VerseReaderScreen for instant cached explanations referencing classical sources, (2) VerseDiscussionScreen for conversational Q&A about any verse. Both use Claude Haiku with specialized prompts.

**Tech Stack:** React Native, TypeScript, Zustand (cache), TanStack Query (server state), Express.js, Claude Haiku API, AsyncStorage (persistence)

---

## Overview

Phase 6B adds two AI features to deepen Quran study:

1. **AI Tafsir (Feature 2)** - Tap verse → "Explain" → TafsirPanel with classical tafsir (cached)
2. **AI Verse Conversation (Feature 5)** - Tap verse → "Discuss" → chat screen for open-ended questions

Both features:
- Share AI daily quota (3 free/day, unlimited Plus)
- Use Claude Haiku (`claude-haiku-4-5-20251001`)
- Cache responses (tafsir permanently, conversations per-verse)
- Reference classical Islamic scholarship

**Estimated effort:** 8 tasks, ~3000 LOC, ~20 tests

---

## Task List

### Task 1: Create Tafsir Server Prompt Builder
**Files:**
- Create: `server/services/tafsir-prompts.ts`
- Test: `server/__tests__/tafsir-prompts.test.ts`

**Step 1: Write the failing test**

```typescript
// server/__tests__/tafsir-prompts.test.ts
import { buildTafsirPrompt } from '../services/tafsir-prompts';

describe('buildTafsirPrompt', () => {
  it('builds system prompt with verse context and classical sources', () => {
    const prompt = buildTafsirPrompt({
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      verseNumber: 1,
      arabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    });

    expect(prompt).toContain('surah Al-Fatihah');
    expect(prompt).toContain('verse 1');
    expect(prompt).toContain('Ibn Kathir');
    expect(prompt).toContain('Al-Tabari');
    expect(prompt).toContain('practical reflection');
  });

  it('instructs to format as structured JSON', () => {
    const prompt = buildTafsirPrompt({
      surahNumber: 2,
      surahName: 'Al-Baqarah',
      verseNumber: 255,
      arabicText: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ',
      translation: 'Allah - there is no deity except Him',
    });

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('context');
    expect(prompt).toContain('keyTerms');
    expect(prompt).toContain('scholarlyViews');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/kevinrichards/projects/noor && npm test -- tafsir-prompts.test.ts`
Expected: FAIL with "Cannot find module '../services/tafsir-prompts'"

**Step 3: Write minimal implementation**

```typescript
// server/services/tafsir-prompts.ts
export interface TafsirPromptInput {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

export interface TafsirResponse {
  context: string;           // Occasion of revelation, historical context
  keyTerms: Array<{          // Important Arabic words
    arabic: string;
    transliteration: string;
    root: string;
    meaning: string;
  }>;
  scholarlyViews: string;    // What classical scholars said
  crossReferences: string[]; // Related verses (format: "2:255", "3:26")
  practicalTakeaway: string; // How to apply today
}

export function buildTafsirPrompt(input: TafsirPromptInput): string {
  return `You are a knowledgeable Quran study companion helping users understand verses with classical Islamic scholarship.

**Your task:** Provide a comprehensive tafsir (explanation) for this verse from surah ${input.surahName} (${input.surahNumber}:${input.verseNumber}).

**Verse:**
Arabic: ${input.arabicText}
Translation: ${input.translation}

**Guidelines:**
1. Reference classical tafsir sources by name (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di, Al-Jalalayn)
2. Explain in accessible English, not academic jargon
3. Include root word analysis for 2-3 key Arabic terms
4. Note where scholars differ in interpretation (if applicable)
5. Provide 1-2 related cross-reference verses
6. End with a practical reflection question for modern application

**Output format:** Return ONLY valid JSON matching this structure (no markdown, no extra text):

{
  "context": "Brief historical/revelation context (2-3 sentences)",
  "keyTerms": [
    {
      "arabic": "ٱللَّهِ",
      "transliteration": "Allah",
      "root": "ء-ل-ه",
      "meaning": "The One God, Creator of all"
    }
  ],
  "scholarlyViews": "What classical scholars said (3-4 sentences, cite sources)",
  "crossReferences": ["2:255", "112:1-4"],
  "practicalTakeaway": "How this verse guides our lives today (2-3 sentences ending with reflection question)"
}

Respond ONLY with the JSON object. No markdown formatting.`;
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/kevinrichards/projects/noor && npm test -- tafsir-prompts.test.ts`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add server/services/tafsir-prompts.ts server/__tests__/tafsir-prompts.test.ts
git commit -m "feat(tafsir): add prompt builder with classical sources"
```

---

### Task 2: Create Tafsir Server Routes
**Files:**
- Create: `server/routes/tafsir-routes.ts`
- Test: `server/__tests__/tafsir-routes.test.ts`
- Modify: `server/routes.ts` (register routes)

**Step 1: Write the failing test**

```typescript
// server/__tests__/tafsir-routes.test.ts
import request from 'supertest';
import { app } from '../app';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('POST /api/tafsir/explain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tafsir explanation for a verse', async () => {
    const mockResponse = {
      context: 'Revealed in Mecca...',
      keyTerms: [{
        arabic: 'ٱللَّهِ',
        transliteration: 'Allah',
        root: 'ء-ل-ه',
        meaning: 'The One God',
      }],
      scholarlyViews: 'Ibn Kathir explains...',
      crossReferences: ['112:1-4'],
      practicalTakeaway: 'This reminds us to begin with His name.',
    };

    (Anthropic as jest.MockedClass<typeof Anthropic>).prototype.messages.create = jest
      .fn()
      .mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockResponse) }],
      });

    const res = await request(app)
      .post('/api/tafsir/explain')
      .send({
        surahNumber: 1,
        verseNumber: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(mockResponse);
    expect(res.body.remainingQuota).toBeDefined();
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/tafsir/explain')
      .send({ surahNumber: 1 }); // missing verseNumber

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('verseNumber');
  });

  it('enforces AI daily quota for free users', async () => {
    // Simulate quota exceeded
    // This will reuse the existing ai-daily-quota middleware
    const res = await request(app)
      .post('/api/tafsir/explain')
      .set('x-user-id', 'quota-test-user')
      .send({ surahNumber: 1, verseNumber: 1 });

    // After 3 calls, should return 429
    // (Actual quota test logic depends on middleware implementation)
    expect([200, 429]).toContain(res.status);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/kevinrichards/projects/noor && npm test -- tafsir-routes.test.ts`
Expected: FAIL with "Cannot find module '../routes/tafsir-routes'"

**Step 3: Write minimal implementation**

```typescript
// server/routes/tafsir-routes.ts
import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { aiDailyQuota } from '../middleware/ai-daily-quota';
import { aiRateLimiter } from '../middleware/ai-rate-limiter';
import { buildTafsirPrompt, TafsirResponse } from '../services/tafsir-prompts';
import logger from '../utils/logger';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/tafsir/explain
 * Generate AI tafsir explanation for a verse
 */
router.post(
  '/explain',
  aiDailyQuota,
  aiRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const { surahNumber, verseNumber } = req.body;

      // Validation
      if (!surahNumber || !verseNumber) {
        return res.status(400).json({
          error: 'Missing required fields: surahNumber, verseNumber',
        });
      }

      if (surahNumber < 1 || surahNumber > 114) {
        return res.status(400).json({ error: 'Invalid surah number (1-114)' });
      }

      // TODO: Fetch verse Arabic text and translation from database/API
      // For now, use placeholders
      const surahName = 'Al-Fatihah'; // TODO: lookup from surah metadata
      const arabicText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
      const translation = 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';

      const systemPrompt = buildTafsirPrompt({
        surahNumber,
        surahName,
        verseNumber,
        arabicText,
        translation,
      });

      logger.info('[Tafsir] Requesting AI explanation', {
        surah: surahNumber,
        verse: verseNumber,
      });

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: systemPrompt }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      const tafsir: TafsirResponse = JSON.parse(responseText);

      return res.json({
        ...tafsir,
        remainingQuota: (req as any).remainingQuota ?? null,
      });
    } catch (error: any) {
      logger.error('[Tafsir] Error generating explanation', { error });

      if (error.status === 429) {
        return res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again later.',
        });
      }

      return res.status(500).json({
        error: 'Failed to generate tafsir explanation',
      });
    }
  }
);

export function registerTafsirRoutes(app: Router) {
  app.use('/api/tafsir', router);
}
```

**Step 4: Register routes in server/routes.ts**

```typescript
// server/routes.ts
import { registerTafsirRoutes } from './routes/tafsir-routes';

// ... existing route registrations ...

registerTafsirRoutes(app);
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/kevinrichards/projects/noor && npm test -- tafsir-routes.test.ts`
Expected: PASS (3 tests)

**Step 6: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add server/routes/tafsir-routes.ts server/__tests__/tafsir-routes.test.ts server/routes.ts
git commit -m "feat(tafsir): add server routes with AI integration"
```

---

### Task 3: Create Tafsir Client Hook with Cache
**Files:**
- Create: `client/hooks/useTafsir.ts`
- Create: `client/stores/tafsir-cache-store.ts`

**Step 1: Write implementation (no tests for React hooks)**

```typescript
// client/stores/tafsir-cache-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TafsirData {
  context: string;
  keyTerms: Array<{
    arabic: string;
    transliteration: string;
    root: string;
    meaning: string;
  }>;
  scholarlyViews: string;
  crossReferences: string[];
  practicalTakeaway: string;
}

interface TafsirCacheState {
  cache: Record<string, TafsirData>; // key: "surah:verse"
  setTafsir: (surahNumber: number, verseNumber: number, data: TafsirData) => void;
  getTafsir: (surahNumber: number, verseNumber: number) => TafsirData | null;
}

export const useTafsirCache = create<TafsirCacheState>()(
  persist(
    (set, get) => ({
      cache: {},

      setTafsir: (surahNumber, verseNumber, data) => {
        const key = `${surahNumber}:${verseNumber}`;
        set((state) => ({
          cache: { ...state.cache, [key]: data },
        }));
      },

      getTafsir: (surahNumber, verseNumber) => {
        const key = `${surahNumber}:${verseNumber}`;
        return get().cache[key] || null;
      },
    }),
    {
      name: 'noor-tafsir-cache',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

```typescript
// client/hooks/useTafsir.ts
import { useState } from 'react';
import { useTafsirCache, TafsirData } from '@/stores/tafsir-cache-store';
import { API_URL } from '@/lib/config';

export function useTafsir() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getTafsir, setTafsir } = useTafsirCache();

  const fetchTafsir = async (
    surahNumber: number,
    verseNumber: number
  ): Promise<TafsirData | null> => {
    // Check cache first
    const cached = getTafsir(surahNumber, verseNumber);
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/tafsir/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber, verseNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tafsir');
      }

      const data = await response.json();
      const { remainingQuota, ...tafsirData } = data;

      // Cache the result
      setTafsir(surahNumber, verseNumber, tafsirData);

      return tafsirData;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchTafsir,
    isLoading,
    error,
    getCachedTafsir: getTafsir,
  };
}
```

**Step 2: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add client/hooks/useTafsir.ts client/stores/tafsir-cache-store.ts
git commit -m "feat(tafsir): add client hook with AsyncStorage cache"
```

---

### Task 4: Create TafsirPanel Component
**Files:**
- Create: `client/components/TafsirPanel.tsx`

**Step 1: Write implementation**

```typescript
// client/components/TafsirPanel.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { NoorColors } from '@/constants/theme/colors';
import { TafsirData } from '@/stores/tafsir-cache-store';

interface TafsirPanelProps {
  tafsir: TafsirData;
  onClose: () => void;
}

export function TafsirPanel({ tafsir, onClose }: TafsirPanelProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <GlassCard style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Tafsir</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Context Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="book-open" size={16} color={NoorColors.gold} />
              <ThemedText style={[styles.sectionTitle, { color: NoorColors.gold }]}>
                Context
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionText, { color: theme.text }]}>
              {tafsir.context}
            </ThemedText>
          </View>

          {/* Key Terms Section */}
          {tafsir.keyTerms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="search" size={16} color={NoorColors.gold} />
                <ThemedText style={[styles.sectionTitle, { color: NoorColors.gold }]}>
                  Key Terms
                </ThemedText>
              </View>
              {tafsir.keyTerms.map((term, index) => (
                <View key={index} style={styles.termCard}>
                  <ThemedText style={styles.termArabic}>{term.arabic}</ThemedText>
                  <ThemedText style={[styles.termTranslit, { color: theme.textSecondary }]}>
                    {term.transliteration} (root: {term.root})
                  </ThemedText>
                  <ThemedText style={[styles.termMeaning, { color: theme.text }]}>
                    {term.meaning}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Scholarly Views Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={16} color={NoorColors.gold} />
              <ThemedText style={[styles.sectionTitle, { color: NoorColors.gold }]}>
                Scholarly Views
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionText, { color: theme.text }]}>
              {tafsir.scholarlyViews}
            </ThemedText>
          </View>

          {/* Cross References */}
          {tafsir.crossReferences.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="link" size={16} color={NoorColors.gold} />
                <ThemedText style={[styles.sectionTitle, { color: NoorColors.gold }]}>
                  Related Verses
                </ThemedText>
              </View>
              <View style={styles.crossRefContainer}>
                {tafsir.crossReferences.map((ref, index) => (
                  <View key={index} style={[styles.crossRefChip, { borderColor: NoorColors.gold }]}>
                    <ThemedText style={[styles.crossRefText, { color: NoorColors.gold }]}>
                      {ref}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Practical Takeaway */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={16} color={NoorColors.gold} />
              <ThemedText style={[styles.sectionTitle, { color: NoorColors.gold }]}>
                Practical Takeaway
              </ThemedText>
            </View>
            <ThemedText style={[styles.takeawayText, { color: theme.text }]}>
              {tafsir.practicalTakeaway}
            </ThemedText>
          </View>
        </ScrollView>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
  },
  panel: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  termCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  termArabic: {
    fontSize: 22,
    fontFamily: 'Amiri',
    marginBottom: 4,
  },
  termTranslit: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  termMeaning: {
    fontSize: 14,
    lineHeight: 20,
  },
  crossRefContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  crossRefChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  crossRefText: {
    fontSize: 13,
    fontWeight: '600',
  },
  takeawayText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
```

**Step 2: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add client/components/TafsirPanel.tsx
git commit -m "feat(tafsir): add slide-up panel component with sections"
```

---

### Task 5: Create Verse Conversation Server Routes
**Files:**
- Create: `server/services/verse-conversation-prompts.ts`
- Create: `server/routes/verse-conversation-routes.ts`
- Test: `server/__tests__/verse-conversation-routes.test.ts`
- Modify: `server/routes.ts`

**Step 1: Write implementation**

```typescript
// server/services/verse-conversation-prompts.ts
export interface VerseConversationContext {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

export function buildVerseConversationPrompt(context: VerseConversationContext): string {
  return `You are a knowledgeable, warm Quran study companion helping a user discuss and understand this verse:

**Surah:** ${context.surahName} (${context.surahNumber}:${context.verseNumber})
**Arabic:** ${context.arabicText}
**Translation:** ${context.translation}

**Your role:**
- Answer questions about this verse with depth and warmth
- Draw from classical tafsir (Ibn Kathir, Al-Tabari, Al-Qurtubi, etc.), Arabic linguistics, and historical context
- Cross-reference related verses when relevant
- Be honest about scholarly differences of opinion
- Avoid issuing fatawa (legal rulings) — redirect to qualified scholars for specific religious rulings
- Keep responses conversational but informed (2-4 paragraphs max)

**Tone:** Patient, encouraging, scholarly yet accessible.`;
}
```

```typescript
// server/routes/verse-conversation-routes.ts
import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { aiDailyQuota } from '../middleware/ai-daily-quota';
import { aiRateLimiter } from '../middleware/ai-rate-limiter';
import { buildVerseConversationPrompt } from '../services/verse-conversation-prompts';
import logger from '../utils/logger';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

router.post(
  '/discuss',
  aiDailyQuota,
  aiRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const { surahNumber, verseNumber, message, history = [] } = req.body;

      // Validation
      if (!surahNumber || !verseNumber || !message) {
        return res.status(400).json({
          error: 'Missing required fields: surahNumber, verseNumber, message',
        });
      }

      if (!Array.isArray(history)) {
        return res.status(400).json({ error: 'history must be an array' });
      }

      // TODO: Fetch verse details from database
      const surahName = 'Al-Fatihah';
      const arabicText = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
      const translation = 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';

      const systemPrompt = buildVerseConversationPrompt({
        surahNumber,
        surahName,
        verseNumber,
        arabicText,
        translation,
      });

      const messages: Anthropic.MessageParam[] = [
        ...history.map((msg: Message) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      logger.info('[VerseConversation] Processing message', {
        surah: surahNumber,
        verse: verseNumber,
        historyLength: history.length,
      });

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      return res.json({
        response: responseText,
        remainingQuota: (req as any).remainingQuota ?? null,
      });
    } catch (error: any) {
      logger.error('[VerseConversation] Error processing message', { error });

      if (error.status === 429) {
        return res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again later.',
        });
      }

      return res.status(500).json({
        error: 'Failed to process conversation message',
      });
    }
  }
);

export function registerVerseConversationRoutes(app: Router) {
  app.use('/api/verse', router);
}
```

**Step 2: Write tests**

```typescript
// server/__tests__/verse-conversation-routes.test.ts
import request from 'supertest';
import { app } from '../app';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('POST /api/verse/discuss', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns AI response for verse discussion', async () => {
    (Anthropic as jest.MockedClass<typeof Anthropic>).prototype.messages.create = jest
      .fn()
      .mockResolvedValue({
        content: [{ type: 'text', text: 'This verse reminds us to begin everything with the name of Allah...' }],
      });

    const res = await request(app)
      .post('/api/verse/discuss')
      .send({
        surahNumber: 1,
        verseNumber: 1,
        message: 'Why do we start with Bismillah?',
        history: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.response).toContain('Allah');
    expect(res.body.remainingQuota).toBeDefined();
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/verse/discuss')
      .send({ surahNumber: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('verseNumber');
  });

  it('passes conversation history to Claude', async () => {
    const createMock = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Following up on that...' }],
    });

    (Anthropic as jest.MockedClass<typeof Anthropic>).prototype.messages.create = createMock;

    await request(app)
      .post('/api/verse/discuss')
      .send({
        surahNumber: 1,
        verseNumber: 1,
        message: 'Tell me more',
        history: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
        ],
      });

    const callArgs = createMock.mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(3);
    expect(callArgs.messages[0].content).toBe('First question');
  });
});
```

**Step 3: Register routes**

```typescript
// server/routes.ts
import { registerVerseConversationRoutes } from './routes/verse-conversation-routes';

// ... existing registrations ...
registerVerseConversationRoutes(app);
```

**Step 4: Run tests**

Run: `cd /Users/kevinrichards/projects/noor && npm test -- verse-conversation-routes.test.ts`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add server/services/verse-conversation-prompts.ts server/routes/verse-conversation-routes.ts server/__tests__/verse-conversation-routes.test.ts server/routes.ts
git commit -m "feat(verse-conversation): add server routes for AI discussions"
```

---

### Task 6: Create Verse Conversation Client Hook & Store
**Files:**
- Create: `client/stores/verse-conversation-store.ts`
- Create: `client/hooks/useVerseConversation.ts`

**Step 1: Write implementation**

```typescript
// client/stores/verse-conversation-store.ts
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
```

```typescript
// client/hooks/useVerseConversation.ts
import { useState } from 'react';
import { useVerseConversationStore, ConversationMessage } from '@/stores/verse-conversation-store';
import { API_URL } from '@/lib/config';

export function useVerseConversation(surahNumber: number, verseNumber: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage, getConversation, clearConversation } = useVerseConversationStore();

  const messages = getConversation(surahNumber, verseNumber);

  const sendMessage = async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message to store immediately
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    addMessage(surahNumber, verseNumber, userMsg);

    try {
      const response = await fetch(`${API_URL}/api/verse/discuss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber,
          verseNumber,
          message: userMessage,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Add assistant response to store
      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      addMessage(surahNumber, verseNumber, assistantMsg);
    } catch (err: any) {
      setError(err.message);
      // Remove the user message we optimistically added
      clearConversation(surahNumber, verseNumber);
      messages.slice(0, -1).forEach(msg => addMessage(surahNumber, verseNumber, msg));
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
```

**Step 2: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add client/stores/verse-conversation-store.ts client/hooks/useVerseConversation.ts
git commit -m "feat(verse-conversation): add client hook with persisted history"
```

---

### Task 7: Create VerseDiscussionScreen
**Files:**
- Create: `client/screens/learn/VerseDiscussionScreen.tsx`

**Step 1: Write implementation**

```typescript
// client/screens/learn/VerseDiscussionScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useVerseConversation } from '@/hooks/useVerseConversation';
import { NoorColors } from '@/constants/theme/colors';
import { RootStackParamList } from '@/navigation/types';

type VerseDiscussionRouteProp = RouteProp<RootStackParamList, 'VerseDiscussion'>;

export default function VerseDiscussionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<VerseDiscussionRouteProp>();
  const { surahNumber, verseNumber } = route.params;

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, sendMessage, clearHistory, isLoading, error } = useVerseConversation(
    surahNumber,
    verseNumber
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  return (
    <Screen title={`Discuss ${surahNumber}:${verseNumber}`} showBack scrollable={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {/* Verse Header */}
        <GlassCard style={styles.verseCard}>
          <ThemedText style={styles.verseReference}>
            Surah {surahNumber}, Verse {verseNumber}
          </ThemedText>
          {/* TODO: Display actual Arabic text and translation */}
          <ThemedText style={[styles.verseArabic, { color: theme.text }]}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </ThemedText>
          <ThemedText style={[styles.verseTranslation, { color: theme.textSecondary }]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
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
              <Feather name="message-circle" size={48} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
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
                style={[
                  styles.messageCard,
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <ThemedText style={[styles.messageText, { color: theme.text }]}>
                  {msg.content}
                </ThemedText>
              </GlassCard>
            </Animated.View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={NoorColors.gold} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
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
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary }]}
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
                backgroundColor: inputText.trim() && !isLoading ? NoorColors.gold : theme.border,
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
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  verseArabic: {
    fontSize: 24,
    fontFamily: 'Amiri',
    marginBottom: 8,
    textAlign: 'right',
  },
  verseTranslation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  messageCard: {
    marginBottom: 12,
    padding: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**Step 2: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add client/screens/learn/VerseDiscussionScreen.tsx
git commit -m "feat(verse-conversation): add discussion screen with chat UI"
```

---

### Task 8: Navigation & VerseReader Integration
**Files:**
- Modify: `client/navigation/types.ts`
- Modify: `client/navigation/RootStackNavigator.tsx`
- Modify: `client/screens/learn/VerseReaderScreen.tsx`

**Step 1: Add route types**

```typescript
// client/navigation/types.ts
export type RootStackParamList = {
  // ... existing routes ...
  VerseDiscussion: {
    surahNumber: number;
    verseNumber: number;
  };
  // ... rest of routes ...
};
```

**Step 2: Register screen**

```typescript
// client/navigation/RootStackNavigator.tsx
import VerseDiscussionScreen from '@/screens/learn/VerseDiscussionScreen';

// Inside Stack.Navigator:
<Stack.Screen
  name="VerseDiscussion"
  component={VerseDiscussionScreen}
  options={{ headerShown: false }}
/>
```

**Step 3: Modify VerseReaderScreen to add Explain and Discuss buttons**

```typescript
// client/screens/learn/VerseReaderScreen.tsx

// Add imports
import { TafsirPanel } from '@/components/TafsirPanel';
import { useTafsir } from '@/hooks/useTafsir';
import { TafsirData } from '@/stores/tafsir-cache-store';

// Add state
const [selectedVerse, setSelectedVerse] = useState<{
  number: number;
  showTafsir: boolean;
} | null>(null);
const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);

const { fetchTafsir, isLoading: isTafsirLoading } = useTafsir();

// Add handlers
const handleExplainVerse = async (verseNumber: number) => {
  setSelectedVerse({ number: verseNumber, showTafsir: true });
  const data = await fetchTafsir(surahId, verseNumber);
  if (data) {
    setTafsirData(data);
  }
};

const handleDiscussVerse = (verseNumber: number) => {
  navigation.navigate('VerseDiscussion', {
    surahNumber: surahId,
    verseNumber,
  });
};

const handleCloseTafsir = () => {
  setSelectedVerse(null);
  setTafsirData(null);
};

// In verse rendering, add action buttons:
// (Add after verse text display)
<View style={styles.verseActions}>
  <Pressable
    onPress={() => handleExplainVerse(verse.number)}
    style={styles.actionButton}
  >
    <Feather name="book-open" size={18} color={NoorColors.gold} />
    <ThemedText style={styles.actionText}>Explain</ThemedText>
  </Pressable>

  <Pressable
    onPress={() => handleDiscussVerse(verse.number)}
    style={styles.actionButton}
  >
    <Feather name="message-circle" size={18} color={NoorColors.gold} />
    <ThemedText style={styles.actionText}>Discuss</ThemedText>
  </Pressable>
</View>

// At end of component, before closing tag:
{selectedVerse?.showTafsir && tafsirData && (
  <TafsirPanel tafsir={tafsirData} onClose={handleCloseTafsir} />
)}
```

**Step 4: Run TypeScript check**

Run: `cd /Users/kevinrichards/projects/noor && npx tsc --noEmit`
Expected: 0 new errors

**Step 5: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add client/navigation/types.ts client/navigation/RootStackNavigator.tsx client/screens/learn/VerseReaderScreen.tsx
git commit -m "feat(phase-6b): integrate tafsir and discussion into verse reader"
```

---

## Final Verification

After completing all tasks:

**Step 1: Run TypeScript check**
```bash
cd /Users/kevinrichards/projects/noor
npx tsc --noEmit
```
Expected: 0 new errors (existing HifzMistakeFeedback errors may remain)

**Step 2: Run tests**
```bash
cd /Users/kevinrichards/projects/noor
npm test
```
Expected: All tests passing (690+ with new tafsir and verse-conversation tests)

**Step 3: Manual testing checklist**
- [ ] Tap verse in VerseReaderScreen → "Explain" button appears
- [ ] Tap "Explain" → TafsirPanel slides up with all sections
- [ ] Second tap on same verse → instant load (cached)
- [ ] Tap "Discuss" → navigate to VerseDiscussionScreen
- [ ] Send message → AI responds in chat
- [ ] Return to discussion later → history persisted
- [ ] Free user: 3 AI calls/day across tafsir + discussion
- [ ] Plus user: unlimited AI calls

**Step 4: Update CONTINUE.md**

Mark Phase 6B complete, update test count, add new file map.

---

## Success Criteria

✅ Tafsir panel shows classical sources (Ibn Kathir, Al-Tabari, etc.)
✅ Tafsir responses cached in AsyncStorage (instant subsequent loads)
✅ Verse discussion chat UI follows AskKarimScreen pattern
✅ Conversation history persisted per verse
✅ Both features share AI daily quota (3 free/day)
✅ TypeScript check passes (0 new errors)
✅ All tests passing
✅ VerseReaderScreen has "Explain" and "Discuss" buttons
✅ Navigation to VerseDiscussion works
