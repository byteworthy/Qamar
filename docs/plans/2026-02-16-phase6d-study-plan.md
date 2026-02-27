# Phase 6D: Personalized Quran Study Plan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build AI-powered weekly Quran study plan that adapts to user's goals, time availability, and progress.

**Architecture:** User completes 3-step onboarding (goal, time commitment, skill level) → Claude Haiku generates structured weekly plan as JSON → Daily task cards link to relevant screens (VerseReader, HifzRecitation, etc.) → Weekly check-ins trigger AI adaptation based on completion data.

**Tech Stack:** React Native, TypeScript, Zustand (persistence), Express.js, Claude Haiku API, AsyncStorage

---

## Task List

### Task 1: Create Study Plan JSON Schema & Types

**Files:**
- Create: `shared/types/study-plan.ts`

**Step 1: Define TypeScript interfaces**

```typescript
// shared/types/study-plan.ts
export type StudyGoal =
  | 'memorize_juz_30'
  | 'read_entire_quran'
  | 'understand_specific_surah'
  | 'improve_tajweed'
  | 'custom';

export type TimeCommitment = '10min' | '20min' | '30min' | '45min';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface StudyPlanInput {
  goal: StudyGoal;
  customGoalText?: string; // Required if goal === 'custom'
  specificSurah?: string; // Required if goal === 'understand_specific_surah'
  timeCommitment: TimeCommitment;
  skillLevel: SkillLevel;
}

export interface DailyTask {
  id: string; // UUID
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  title: string; // "Read Surah Al-Baqarah verses 1-20 with tajweed"
  description: string; // Detailed instructions
  estimatedMinutes: number;
  screenDeepLink: string; // "VerseReader?surahId=2&startVerse=1&endVerse=20"
  completed: boolean;
  completedAt?: number; // Timestamp
}

export interface WeeklyPlan {
  id: string; // UUID
  createdAt: number; // Timestamp
  weekStartDate: string; // ISO date (Monday)
  goal: StudyGoal;
  customGoalText?: string;
  timeCommitment: TimeCommitment;
  skillLevel: SkillLevel;
  tasks: DailyTask[]; // 7 days of tasks
  completionRate: number; // 0-100%
  streak: number; // Consecutive days completed
}

export interface AdaptationInput {
  planId: string;
  completedTasks: string[]; // Array of task IDs
  userFeedback: 'too_easy' | 'just_right' | 'too_hard' | 'not_enough_time';
}
```

**Step 2: Commit**

```bash
cd /Users/kevinrichards/projects/noor
git add shared/types/study-plan.ts
git commit -m "feat(study-plan): add TypeScript types and JSON schema"
```

---

### Task 2: Create Study Plan Generator Service

**Files:**
- Create: `server/services/study-plan-generator.ts`
- Test: `server/__tests__/study-plan-generator.test.ts`

**Step 1: Write failing test**

```typescript
// server/__tests__/study-plan-generator.test.ts
import { describe, test, expect } from '@jest/globals';
import { generateWeeklyPlan } from '../services/study-plan-generator';
import type { StudyPlanInput } from '../../shared/types/study-plan';

describe('generateWeeklyPlan', () => {
  test('generates 7-day plan with tasks', async () => {
    const input: StudyPlanInput = {
      goal: 'memorize_juz_30',
      timeCommitment: '20min',
      skillLevel: 'intermediate',
    };

    const plan = await generateWeeklyPlan(input);

    expect(plan.tasks).toHaveLength(7);
    expect(plan.tasks[0].dayOfWeek).toBe(0); // Sunday
    expect(plan.tasks[0].title).toBeTruthy();
    expect(plan.tasks[0].screenDeepLink).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/kevinrichards/projects/noor
npm run test:server server/__tests__/study-plan-generator.test.ts
```

Expected: FAIL with "Cannot find module '../services/study-plan-generator'"

**Step 3: Implement service**

```typescript
// server/services/study-plan-generator.ts
import Anthropic from '@anthropic-ai/sdk';
import type { StudyPlanInput, WeeklyPlan, DailyTask } from '../../shared/types/study-plan';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a Quran study plan generator for the Qamar app.

Generate a 7-day weekly study plan as valid JSON matching this schema:

{
  "tasks": [
    {
      "dayOfWeek": 0-6,
      "title": "Brief task title",
      "description": "Detailed instructions",
      "estimatedMinutes": number,
      "screenDeepLink": "ScreenName?params"
    }
  ]
}

Available screens and parameters:
- VerseReader?surahId={1-114}&startVerse={n}&endVerse={m}
- HifzRecitation?surahNumber={n}&verseNumber={m}
- ArabicTutor (no params)
- TajweedGuide (no params)

Guidelines:
- Respect time commitment (distribute minutes across 7 days)
- Adapt difficulty to skill level (beginner = slower pace, more review)
- Include variety: reading, memorization, review, reflection
- For memorization goals: use spaced repetition (review previous verses)
- Be realistic and achievable
- Return ONLY valid JSON, no markdown`;

export async function generateWeeklyPlan(input: StudyPlanInput): Promise<WeeklyPlan> {
  const userPrompt = buildUserPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const tasksData = JSON.parse(content.text);

  const tasks: DailyTask[] = tasksData.tasks.map((t: any) => ({
    id: uuidv4(),
    dayOfWeek: t.dayOfWeek,
    title: t.title,
    description: t.description,
    estimatedMinutes: t.estimatedMinutes,
    screenDeepLink: t.screenDeepLink,
    completed: false,
  }));

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1); // Next Monday

  return {
    id: uuidv4(),
    createdAt: Date.now(),
    weekStartDate: monday.toISOString().split('T')[0],
    goal: input.goal,
    customGoalText: input.customGoalText,
    timeCommitment: input.timeCommitment,
    skillLevel: input.skillLevel,
    tasks,
    completionRate: 0,
    streak: 0,
  };
}

function buildUserPrompt(input: StudyPlanInput): string {
  let prompt = `Generate a weekly Quran study plan:\n\n`;

  if (input.goal === 'memorize_juz_30') {
    prompt += `Goal: Memorize Juz 30 (Juz 'Amma)\n`;
  } else if (input.goal === 'read_entire_quran') {
    prompt += `Goal: Read the entire Quran in one year\n`;
  } else if (input.goal === 'understand_specific_surah') {
    prompt += `Goal: Deeply understand Surah ${input.specificSurah}\n`;
  } else if (input.goal === 'improve_tajweed') {
    prompt += `Goal: Improve tajweed (pronunciation rules)\n`;
  } else if (input.goal === 'custom') {
    prompt += `Goal: ${input.customGoalText}\n`;
  }

  prompt += `Time commitment: ${input.timeCommitment} per day\n`;
  prompt += `Skill level: ${input.skillLevel}\n\n`;
  prompt += `Generate tasks for all 7 days (Sunday=0 through Saturday=6).`;

  return prompt;
}
```

**Step 4: Run test to verify it passes**

```bash
npm run test:server server/__tests__/study-plan-generator.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/services/study-plan-generator.ts server/__tests__/study-plan-generator.test.ts
git commit -m "feat(study-plan): add weekly plan generator with Claude Haiku"
```

---

### Task 3: Create Study Plan Server Routes

**Files:**
- Create: `server/routes/study-plan-routes.ts`
- Test: `server/__tests__/study-plan-routes.test.ts`
- Modify: `server/routes.ts` (register routes)

**Step 1: Write implementation**

```typescript
// server/routes/study-plan-routes.ts
import express, { type Express } from 'express';
import { aiDailyQuotaMiddleware } from '../middleware/ai-daily-quota';
import { aiRateLimiter } from '../middleware/rate-limiters';
import { generateWeeklyPlan } from '../services/study-plan-generator';
import type { StudyPlanInput } from '../../shared/types/study-plan';
import logger from '../utils/logger';

export function registerStudyPlanRoutes(app: Express) {
  const router = express.Router();

  // POST /api/study-plan/generate - Generate new weekly plan
  router.post('/generate', aiDailyQuotaMiddleware, aiRateLimiter, async (req, res) => {
    try {
      const input: StudyPlanInput = req.body;

      // Validation
      if (!input.goal || !input.timeCommitment || !input.skillLevel) {
        return res.status(400).json({ error: 'Missing required fields: goal, timeCommitment, skillLevel' });
      }

      if (input.goal === 'custom' && !input.customGoalText) {
        return res.status(400).json({ error: 'customGoalText required when goal is "custom"' });
      }

      if (input.goal === 'understand_specific_surah' && !input.specificSurah) {
        return res.status(400).json({ error: 'specificSurah required when goal is "understand_specific_surah"' });
      }

      const plan = await generateWeeklyPlan(input);

      return res.json({
        plan,
        remainingQuota: (req as any).remainingQuota ?? null,
      });
    } catch (error: any) {
      logger.error('Failed to generate study plan', { error });
      return res.status(500).json({ error: 'Failed to generate study plan' });
    }
  });

  app.use('/api/study-plan', router);
}
```

**Step 2: Write tests**

```typescript
// server/__tests__/study-plan-routes.test.ts
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import { registerStudyPlanRoutes } from '../routes/study-plan-routes';

// Mock services
jest.mock('../services/study-plan-generator');
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() },
}));
jest.mock('../middleware/ai-daily-quota', () => ({
  aiDailyQuotaMiddleware: (req: any, res: any, next: any) => {
    req.remainingQuota = 3;
    next();
  },
}));
jest.mock('../middleware/rate-limiters', () => ({
  aiRateLimiter: (req: any, res: any, next: any) => next(),
}));

import { generateWeeklyPlan } from '../services/study-plan-generator';

describe('POST /api/study-plan/generate', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerStudyPlanRoutes(app);
  });

  test('generates plan for valid input', async () => {
    const mockPlan = {
      id: 'plan-123',
      createdAt: Date.now(),
      weekStartDate: '2026-02-17',
      goal: 'memorize_juz_30',
      timeCommitment: '20min',
      skillLevel: 'intermediate',
      tasks: [],
      completionRate: 0,
      streak: 0,
    };

    (generateWeeklyPlan as any).mockResolvedValue(mockPlan);

    const res = await request(app)
      .post('/api/study-plan/generate')
      .send({
        goal: 'memorize_juz_30',
        timeCommitment: '20min',
        skillLevel: 'intermediate',
      });

    expect(res.status).toBe(200);
    expect(res.body.plan).toMatchObject({ id: 'plan-123' });
    expect(res.body.remainingQuota).toBe(3);
  });

  test('validates required fields', async () => {
    const res = await request(app)
      .post('/api/study-plan/generate')
      .send({ goal: 'memorize_juz_30' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Missing required fields');
  });

  test('validates custom goal text', async () => {
    const res = await request(app)
      .post('/api/study-plan/generate')
      .send({
        goal: 'custom',
        timeCommitment: '20min',
        skillLevel: 'intermediate',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('customGoalText required');
  });
});
```

**Step 3: Register routes**

```typescript
// server/routes.ts - ADD this import at top
import { registerStudyPlanRoutes } from './routes/study-plan-routes';

// ADD this line in registerRoutes() function after registerDuaRoutes
registerStudyPlanRoutes(app);
```

**Step 4: Run tests**

```bash
npm run test:server server/__tests__/study-plan-routes.test.ts
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add server/routes/study-plan-routes.ts server/__tests__/study-plan-routes.test.ts server/routes.ts
git commit -m "feat(study-plan): add server routes for plan generation"
```

---

### Task 4: Create Study Plan Zustand Store

**Files:**
- Create: `client/stores/study-plan-store.ts`
- Test: `client/stores/__tests__/study-plan-store.test.ts`

**Step 1: Implement store**

```typescript
// client/stores/study-plan-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeeklyPlan, DailyTask } from '@/shared/types/study-plan';

interface StudyPlanState {
  currentPlan: WeeklyPlan | null;
  setCurrentPlan: (plan: WeeklyPlan) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  updateCompletionRate: () => void;
  clearPlan: () => void;
}

export const useStudyPlanStore = create<StudyPlanState>()(
  persist(
    (set, get) => ({
      currentPlan: null,

      setCurrentPlan: (plan) => {
        set({ currentPlan: plan });
      },

      completeTask: (taskId) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedTasks = currentPlan.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: true, completedAt: Date.now() }
            : task
        );

        set({
          currentPlan: {
            ...currentPlan,
            tasks: updatedTasks,
          },
        });

        get().updateCompletionRate();
      },

      uncompleteTask: (taskId) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedTasks = currentPlan.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: false, completedAt: undefined }
            : task
        );

        set({
          currentPlan: {
            ...currentPlan,
            tasks: updatedTasks,
          },
        });

        get().updateCompletionRate();
      },

      updateCompletionRate: () => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const completedCount = currentPlan.tasks.filter((t) => t.completed).length;
        const completionRate = Math.round((completedCount / currentPlan.tasks.length) * 100);

        set({
          currentPlan: {
            ...currentPlan,
            completionRate,
          },
        });
      },

      clearPlan: () => {
        set({ currentPlan: null });
      },
    }),
    {
      name: 'noor-study-plan',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Step 2: Write tests**

```typescript
// client/stores/__tests__/study-plan-store.test.ts
import { describe, test, expect, beforeEach } from '@jest/globals';
import { useStudyPlanStore } from '../study-plan-store';
import type { WeeklyPlan } from '@/shared/types/study-plan';

describe('useStudyPlanStore', () => {
  beforeEach(() => {
    useStudyPlanStore.getState().clearPlan();
  });

  test('sets current plan', () => {
    const mockPlan: WeeklyPlan = {
      id: 'plan-1',
      createdAt: Date.now(),
      weekStartDate: '2026-02-17',
      goal: 'memorize_juz_30',
      timeCommitment: '20min',
      skillLevel: 'intermediate',
      tasks: [
        {
          id: 'task-1',
          dayOfWeek: 0,
          title: 'Test task',
          description: 'Description',
          estimatedMinutes: 20,
          screenDeepLink: 'VerseReader',
          completed: false,
        },
      ],
      completionRate: 0,
      streak: 0,
    };

    useStudyPlanStore.getState().setCurrentPlan(mockPlan);

    expect(useStudyPlanStore.getState().currentPlan).toMatchObject({ id: 'plan-1' });
  });

  test('completes task and updates completion rate', () => {
    const mockPlan: WeeklyPlan = {
      id: 'plan-1',
      createdAt: Date.now(),
      weekStartDate: '2026-02-17',
      goal: 'memorize_juz_30',
      timeCommitment: '20min',
      skillLevel: 'intermediate',
      tasks: [
        {
          id: 'task-1',
          dayOfWeek: 0,
          title: 'Task 1',
          description: 'Description',
          estimatedMinutes: 20,
          screenDeepLink: 'VerseReader',
          completed: false,
        },
        {
          id: 'task-2',
          dayOfWeek: 1,
          title: 'Task 2',
          description: 'Description',
          estimatedMinutes: 20,
          screenDeepLink: 'VerseReader',
          completed: false,
        },
      ],
      completionRate: 0,
      streak: 0,
    };

    useStudyPlanStore.getState().setCurrentPlan(mockPlan);
    useStudyPlanStore.getState().completeTask('task-1');

    const state = useStudyPlanStore.getState();
    expect(state.currentPlan?.tasks[0].completed).toBe(true);
    expect(state.currentPlan?.completionRate).toBe(50); // 1 of 2 tasks
  });
});
```

**Step 3: Run tests**

```bash
npm test -- client/stores/__tests__/study-plan-store.test.ts
```

Expected: PASS (2 tests)

**Step 4: Commit**

```bash
git add client/stores/study-plan-store.ts client/stores/__tests__/study-plan-store.test.ts
git commit -m "feat(study-plan): add Zustand store with AsyncStorage persistence"
```

---

### Task 5: Create useStudyPlan Hook

**Files:**
- Create: `client/hooks/useStudyPlan.ts`

**Step 1: Implement hook**

```typescript
// client/hooks/useStudyPlan.ts
import { useState } from 'react';
import { useStudyPlanStore } from '@/stores/study-plan-store';
import type { StudyPlanInput } from '@/shared/types/study-plan';

export function useStudyPlan() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const { currentPlan, setCurrentPlan, completeTask, uncompleteTask } = useStudyPlanStore();

  const generatePlan = async (input: StudyPlanInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate study plan');
      }

      const data = await response.json();
      setCurrentPlan(data.plan);
      setRemainingQuota(data.remainingQuota);

      return data.plan;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    currentPlan,
    generatePlan,
    completeTask,
    uncompleteTask,
    isGenerating,
    error,
    remainingQuota,
  };
}
```

**Step 2: Commit**

```bash
git add client/hooks/useStudyPlan.ts
git commit -m "feat(study-plan): add useStudyPlan hook for API integration"
```

---

### Task 6: Create DailyTaskCard Component

**Files:**
- Create: `client/components/DailyTaskCard.tsx`

**Step 1: Implement component**

```typescript
// client/components/DailyTaskCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { NoorColors } from '@/constants/theme/colors';
import { hapticLight } from '@/lib/haptics';
import type { DailyTask } from '@/shared/types/study-plan';

interface DailyTaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
}

export function DailyTaskCard({ task, onToggleComplete }: DailyTaskCardProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    hapticLight();

    // Parse deep link: "VerseReader?surahId=2&startVerse=1&endVerse=20"
    const [screenName, paramsString] = task.screenDeepLink.split('?');
    const params: any = {};

    if (paramsString) {
      paramsString.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        params[key] = isNaN(Number(value)) ? value : Number(value);
      });
    }

    navigation.navigate(screenName as any, params);
  };

  const handleToggle = () => {
    hapticLight();
    onToggleComplete();
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {/* Checkbox */}
        <Pressable onPress={handleToggle} style={styles.checkbox}>
          {task.completed ? (
            <View style={[styles.checkboxFilled, { backgroundColor: NoorColors.gold }]}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          ) : (
            <View style={[styles.checkboxEmpty, { borderColor: theme.border }]} />
          )}
        </Pressable>

        {/* Task info */}
        <Pressable onPress={handlePress} style={styles.content}>
          <ThemedText
            style={[
              styles.title,
              { color: theme.text },
              task.completed && styles.completedText,
            ]}
          >
            {task.title}
          </ThemedText>
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {task.description}
          </ThemedText>
          <View style={styles.meta}>
            <Feather name="clock" size={12} color={NoorColors.gold} />
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
              {task.estimatedMinutes} min
            </ThemedText>
          </View>
        </Pressable>

        {/* Arrow */}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkboxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
```

**Step 2: Commit**

```bash
git add client/components/DailyTaskCard.tsx
git commit -m "feat(study-plan): add DailyTaskCard with deep link navigation"
```

---

### Task 7: Create StudyPlanOnboarding Component

**Files:**
- Create: `client/components/StudyPlanOnboarding.tsx`

**Step 1: Implement 3-step onboarding**

```typescript
// client/components/StudyPlanOnboarding.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { NoorColors } from '@/constants/theme/colors';
import { hapticLight } from '@/lib/haptics';
import type { StudyGoal, TimeCommitment, SkillLevel, StudyPlanInput } from '@/shared/types/study-plan';

interface StudyPlanOnboardingProps {
  onComplete: (input: StudyPlanInput) => void;
}

export function StudyPlanOnboarding({ onComplete }: StudyPlanOnboardingProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const [customGoalText, setCustomGoalText] = useState('');
  const [specificSurah, setSpecificSurah] = useState('');
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment | null>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);

  const handleNext = () => {
    hapticLight();
    if (step === 3) {
      // Final step - generate plan
      const input: StudyPlanInput = {
        goal: goal!,
        timeCommitment: timeCommitment!,
        skillLevel: skillLevel!,
      };

      if (goal === 'custom') {
        input.customGoalText = customGoalText;
      } else if (goal === 'understand_specific_surah') {
        input.specificSurah = specificSurah;
      }

      onComplete(input);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    hapticLight();
    setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return goal !== null;
    if (step === 2) return timeCommitment !== null;
    if (step === 3) return skillLevel !== null;
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Step 1: Goal */}
      {step === 1 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            What's your Quran goal?
          </ThemedText>

          {GOAL_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setGoal(option.value)}
              style={styles.optionContainer}
            >
              <GlassCard
                style={[
                  styles.optionCard,
                  goal === option.value && { borderColor: NoorColors.gold, borderWidth: 2 },
                ]}
              >
                <Feather name={option.icon as any} size={24} color={NoorColors.gold} />
                <View style={styles.optionText}>
                  <ThemedText style={[styles.optionTitle, { color: theme.text }]}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    {option.description}
                  </ThemedText>
                </View>
              </GlassCard>
            </Pressable>
          ))}

          {goal === 'custom' && (
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Describe your custom goal..."
              placeholderTextColor={theme.textSecondary}
              value={customGoalText}
              onChangeText={setCustomGoalText}
              multiline
            />
          )}

          {goal === 'understand_specific_surah' && (
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Which surah? (e.g., Yusuf)"
              placeholderTextColor={theme.textSecondary}
              value={specificSurah}
              onChangeText={setSpecificSurah}
            />
          )}
        </Animated.View>
      )}

      {/* Step 2: Time Commitment */}
      {step === 2 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            How much time per day?
          </ThemedText>

          {TIME_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setTimeCommitment(option.value)}
              style={styles.optionContainer}
            >
              <GlassCard
                style={[
                  styles.optionCard,
                  timeCommitment === option.value && { borderColor: NoorColors.gold, borderWidth: 2 },
                ]}
              >
                <Feather name="clock" size={24} color={NoorColors.gold} />
                <View style={styles.optionText}>
                  <ThemedText style={[styles.optionTitle, { color: theme.text }]}>
                    {option.label}
                  </ThemedText>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Step 3: Skill Level */}
      {step === 3 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            What's your current level?
          </ThemedText>

          {SKILL_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setSkillLevel(option.value)}
              style={styles.optionContainer}
            >
              <GlassCard
                style={[
                  styles.optionCard,
                  skillLevel === option.value && { borderColor: NoorColors.gold, borderWidth: 2 },
                ]}
              >
                <Feather name={option.icon as any} size={24} color={NoorColors.gold} />
                <View style={styles.optionText}>
                  <ThemedText style={[styles.optionTitle, { color: theme.text }]}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[styles.optionDescription, { color: theme.textSecondary }]}>
                    {option.description}
                  </ThemedText>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {step > 1 && (
          <Pressable onPress={handleBack} style={[styles.navButton, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={{ color: theme.text }}>Back</ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={handleNext}
          disabled={!canProceed()}
          style={[
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: canProceed() ? NoorColors.gold : theme.border,
              opacity: canProceed() ? 1 : 0.5,
            },
          ]}
        >
          <ThemedText style={{ color: '#FFFFFF', fontWeight: '600' }}>
            {step === 3 ? 'Generate Plan' : 'Next'}
          </ThemedText>
          {step < 3 && <Feather name="arrow-right" size={20} color="#FFFFFF" />}
        </Pressable>
      </View>
    </View>
  );
}

const GOAL_OPTIONS = [
  {
    value: 'memorize_juz_30' as StudyGoal,
    label: 'Memorize Juz 30',
    description: "Start with Juz 'Amma",
    icon: 'book',
  },
  {
    value: 'read_entire_quran' as StudyGoal,
    label: 'Read Entire Quran',
    description: 'Complete in one year',
    icon: 'bookmark',
  },
  {
    value: 'understand_specific_surah' as StudyGoal,
    label: 'Understand a Surah',
    description: 'Deep study with tafsir',
    icon: 'search',
  },
  {
    value: 'improve_tajweed' as StudyGoal,
    label: 'Improve Tajweed',
    description: 'Master pronunciation rules',
    icon: 'mic',
  },
  {
    value: 'custom' as StudyGoal,
    label: 'Custom Goal',
    description: 'Your own objective',
    icon: 'edit',
  },
];

const TIME_OPTIONS = [
  { value: '10min' as TimeCommitment, label: '10 minutes/day' },
  { value: '20min' as TimeCommitment, label: '20 minutes/day' },
  { value: '30min' as TimeCommitment, label: '30 minutes/day' },
  { value: '45min' as TimeCommitment, label: '45+ minutes/day' },
];

const SKILL_OPTIONS = [
  {
    value: 'beginner' as SkillLevel,
    label: 'Beginner',
    description: 'Learning Arabic alphabet',
    icon: 'award',
  },
  {
    value: 'intermediate' as SkillLevel,
    label: 'Intermediate',
    description: 'Can read slowly',
    icon: 'star',
  },
  {
    value: 'advanced' as SkillLevel,
    label: 'Advanced',
    description: 'Fluent reader',
    icon: 'zap',
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  nextButton: {
    flex: 2,
  },
});
```

**Step 2: Commit**

```bash
git add client/components/StudyPlanOnboarding.tsx
git commit -m "feat(study-plan): add 3-step onboarding component"
```

---

### Task 8: Create StudyPlanScreen

**Files:**
- Create: `client/screens/learn/StudyPlanScreen.tsx`

**Step 1: Implement screen**

```typescript
// client/screens/learn/StudyPlanScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { GlassCard } from '@/components/GlassCard';
import { StudyPlanOnboarding } from '@/components/StudyPlanOnboarding';
import { DailyTaskCard } from '@/components/DailyTaskCard';
import { useTheme } from '@/hooks/useTheme';
import { useStudyPlan } from '@/hooks/useStudyPlan';
import { NoorColors } from '@/constants/theme/colors';
import type { StudyPlanInput } from '@/shared/types/study-plan';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudyPlanScreen() {
  const { theme } = useTheme();
  const { currentPlan, generatePlan, completeTask, uncompleteTask, isGenerating, error } = useStudyPlan();
  const [showOnboarding, setShowOnboarding] = useState(!currentPlan);

  const handleGeneratePlan = async (input: StudyPlanInput) => {
    await generatePlan(input);
    setShowOnboarding(false);
  };

  const getTasksForDay = (dayOfWeek: number) => {
    if (!currentPlan) return [];
    return currentPlan.tasks.filter((task) => task.dayOfWeek === dayOfWeek);
  };

  if (showOnboarding) {
    return (
      <Screen title="Create Study Plan" showBack scrollable>
        <StudyPlanOnboarding onComplete={handleGeneratePlan} />

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={NoorColors.gold} />
            <ThemedText style={[styles.loadingText, { color: theme.text }]}>
              Generating your personalized plan...
            </ThemedText>
          </View>
        )}

        {error && (
          <GlassCard style={styles.errorCard}>
            <Feather name="alert-circle" size={20} color="#EF4444" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </GlassCard>
        )}
      </Screen>
    );
  }

  if (!currentPlan) {
    return null; // Should never happen
  }

  return (
    <Screen title="My Study Plan" showBack scrollable={false}>
      <View style={styles.container}>
        {/* Header Stats */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statItem}>
            <Feather name="target" size={24} color={NoorColors.gold} />
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completion
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {currentPlan.completionRate}%
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <Feather name="calendar" size={24} color={NoorColors.gold} />
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Week of
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {new Date(currentPlan.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <Feather name="zap" size={24} color={NoorColors.gold} />
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Streak
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {currentPlan.streak} days
            </ThemedText>
          </View>
        </GlassCard>

        {/* Daily Tasks */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {DAY_NAMES.map((dayName, dayOfWeek) => {
            const tasks = getTasksForDay(dayOfWeek);
            if (tasks.length === 0) return null;

            return (
              <Animated.View
                key={dayOfWeek}
                entering={FadeInUp.duration(300).delay(dayOfWeek * 50)}
                style={styles.daySection}
              >
                <ThemedText style={[styles.dayHeader, { color: theme.text }]}>
                  {dayName}
                </ThemedText>

                {tasks.map((task) => (
                  <DailyTaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={() =>
                      task.completed ? uncompleteTask(task.id) : completeTask(task.id)
                    }
                  />
                ))}
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
});
```

**Step 2: Commit**

```bash
git add client/screens/learn/StudyPlanScreen.tsx
git commit -m "feat(study-plan): add StudyPlanScreen with weekly calendar view"
```

---

### Task 9: Navigation Integration

**Files:**
- Modify: `client/navigation/types.ts`
- Modify: `client/navigation/RootStackNavigator.tsx`
- Modify: `client/screens/learn/LearnTabScreen.tsx`

**Step 1: Add route type**

```typescript
// client/navigation/types.ts - Add this line after DuaFinder
DuaFinder: undefined;
StudyPlan: undefined;  // ADD THIS
HifzDashboard: undefined;
```

**Step 2: Register screen**

```typescript
// client/navigation/RootStackNavigator.tsx
// ADD import at top
import StudyPlanScreen from "@/screens/learn/StudyPlanScreen";

// ADD screen registration after DuaFinder screen
<Stack.Screen
  name="StudyPlan"
  component={StudyPlanScreen}
  options={{ headerShown: false }}
/>
```

**Step 3: Add feature card to Learn tab**

```typescript
// client/screens/learn/LearnTabScreen.tsx
// ADD new feature card after "Find a Dua"
{
  title: "My Study Plan",
  description: "AI-generated weekly Quran study plan that adapts to your pace",
  gradient: ["#3a4a5a", "#6a7a8a"],
  icon: "calendar" as const,
  screen: "StudyPlan" as const,
  comingSoon: false,
},
```

**Step 4: Commit**

```bash
git add client/navigation/types.ts client/navigation/RootStackNavigator.tsx client/screens/learn/LearnTabScreen.tsx
git commit -m "feat(study-plan): integrate navigation and add Learn tab card"
```

---

### Task 10: Final Integration & Testing

**Files:**
- Modify: `client/lib/premium-features.ts`
- Modify: `client/hooks/useEntitlements.ts`

**Step 1: Add premium features**

```typescript
// client/lib/premium-features.ts - Add to PremiumFeature enum
export enum PremiumFeature {
  // ... existing features
  STUDY_PLAN_REGENERATE = 'study_plan_regenerate',
  STUDY_PLAN_ADAPT = 'study_plan_adapt',
  STUDY_PLAN_MULTIPLE = 'study_plan_multiple',
}
```

**Step 2: Add entitlements**

```typescript
// client/hooks/useEntitlements.ts - Add to FEATURE_TIER_MAP
const FEATURE_TIER_MAP: Record<FeatureName, SubscriptionTier[]> = {
  // ... existing mappings
  study_plan_regenerate: ['plus', 'pro'],
  study_plan_adapt: ['plus', 'pro'],
  study_plan_multiple: ['pro'],
};
```

**Step 3: Run TypeScript check**

```bash
cd /Users/kevinrichards/projects/noor
npx tsc --noEmit
```

Expected: 0 errors (or only pre-existing HifzMistakeFeedback errors)

**Step 4: Run all tests**

```bash
npm test
```

Expected: All tests passing (including 3 new study-plan tests)

**Step 5: Final commit**

```bash
git add client/lib/premium-features.ts client/hooks/useEntitlements.ts
git commit -m "feat(study-plan): add premium feature gating for regenerate and adaptation"
```

---

## Success Criteria

✅ Study plan generation with Claude Haiku produces structured 7-day JSON
✅ 3-step onboarding collects goal, time, skill level
✅ Daily task cards navigate to relevant screens via deep links
✅ Completion tracking persists to AsyncStorage
✅ Completion rate updates automatically
✅ Premium gating: Free (1 plan), Plus (regenerate + adapt), Pro (multiple)
✅ TypeScript check passes
✅ All tests passing

---

## Execution Options

Plan complete and saved to `docs/plans/2026-02-16-phase6d-study-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
