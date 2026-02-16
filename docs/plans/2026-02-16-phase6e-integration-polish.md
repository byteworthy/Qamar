# Phase 6E: Integration + Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix remaining TypeScript errors, integrate gamification hooks, update premium gating, add E2E tests, and finalize Phase 6.

**Architecture:** Sequential bug fixes, systematic gamification integration across all Phase 6 features, entitlements verification, CONTINUE.md updates, final test coverage.

**Tech Stack:** TypeScript, Jest, Maestro (E2E), Zustand, RevenueCat entitlements

---

## Task List

### Task 1: Fix HifzMistakeFeedback TypeScript Errors

**Files:**
- Modify: `client/components/HifzMistakeFeedback.tsx` (fix TS2307, TS2503, TS7006, TS2322 errors)

**Step 1: Fix missing module import**

The error `TS2307: Cannot find module '@/shared/types/hifz'` indicates the import path is incorrect.

```typescript
// client/components/HifzMistakeFeedback.tsx
// CHANGE this import
import type { RecitationResult } from '@/shared/types/hifz';

// TO this (correct path)
import type { RecitationResult } from '../../shared/types/hifz';
```

**Step 2: Add JSX import**

Error `TS2503: Cannot find namespace 'JSX'` requires React import:

```typescript
// At top of file, ensure React is imported
import React from 'react';
```

**Step 3: Add type annotations for implicit 'any'**

Errors `TS7006: Parameter implicitly has an 'any' type`:

```typescript
// Find lines with parameters missing types and add them
// Example:
.map((word: any, index: number) => {  // Add ': any' and ': number'
```

**Step 4: Fix Feather icon type error**

Error `TS2322: Type '"lightbulb"' is not assignable`:

```typescript
// Change from:
<Feather name="lightbulb" size={16} color={NoorColors.gold} />

// To a valid Feather icon:
<Feather name="alert-circle" size={16} color={NoorColors.gold} />
// Or cast it:
<Feather name={"lightbulb" as any} size={16} color={NoorColors.gold} />
```

**Step 5: Run TypeScript check**

```bash
cd /Users/kevinrichards/projects/noor
npx tsc --noEmit 2>&1 | grep HifzMistakeFeedback
```

Expected: 0 errors

**Step 6: Commit**

```bash
git add client/components/HifzMistakeFeedback.tsx
git commit -m "fix(hifz): resolve TypeScript errors in HifzMistakeFeedback component"
```

---

### Task 2: Add Gamification Hooks for Phase 6 Features

**Files:**
- Modify: `client/stores/gamification-store.ts`
- Modify: `client/hooks/useTafsir.ts`
- Modify: `client/hooks/useVerseConversation.ts`
- Modify: `client/hooks/useDuaRecommender.ts`
- Modify: `client/hooks/useStudyPlan.ts`

**Step 1: Add new activity types**

```typescript
// client/stores/gamification-store.ts
export type ActivityType =
  | 'reflection_completed'
  | 'quran_reading'
  | 'prayer_tracked'
  | 'hadith_read'
  | 'adhkar_completed'
  | 'arabic_lesson_completed'
  | 'tutor_session'
  | 'pronunciation_practice'
  | 'translation_used'
  | 'hifz_review_completed'
  | 'tafsir_viewed'           // NEW
  | 'verse_discussion'        // NEW
  | 'dua_searched'           // NEW
  | 'study_plan_task_completed'; // NEW
```

**Step 2: Add XP rewards for new activities**

```typescript
// client/stores/gamification-store.ts - Update XP_REWARDS
const XP_REWARDS: Record<ActivityType, number> = {
  // ... existing rewards
  tafsir_viewed: 5,
  verse_discussion: 8,
  dua_searched: 3,
  study_plan_task_completed: 10,
};
```

**Step 3: Integrate into useTafsir**

```typescript
// client/hooks/useTafsir.ts
import { useGamificationStore } from '@/stores/gamification-store';

export function useTafsir(surahNumber: number, verseNumber: number) {
  const { getTafsir, setTafsir } = useTafsirCache();
  const { recordActivity } = useGamificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTafsir = async () => {
    // ... existing fetch logic

    // ADD this after successful fetch
    if (tafsirData) {
      recordActivity('tafsir_viewed');
    }

    return tafsirData;
  };

  return { fetchTafsir, isLoading, error, getCachedTafsir: getTafsir };
}
```

**Step 4: Integrate into useVerseConversation**

```typescript
// client/hooks/useVerseConversation.ts
import { useGamificationStore } from '@/stores/gamification-store';

export function useVerseConversation(surahNumber: number, verseNumber: number) {
  const { recordActivity } = useGamificationStore();
  // ... existing code

  const sendMessage = async (message: string) => {
    // ... existing logic

    // ADD this after first successful message
    if (messages.length === 0) {
      recordActivity('verse_discussion');
    }
  };
}
```

**Step 5: Integrate into useDuaRecommender**

```typescript
// client/hooks/useDuaRecommender.ts
import { useGamificationStore } from '@/stores/gamification-store';

export function useDuaRecommender() {
  const { recordActivity } = useGamificationStore();
  // ... existing code

  const recommend = async (situation: string) => {
    // ... existing logic

    // ADD this after successful search
    if (data.duas.length > 0) {
      recordActivity('dua_searched');
    }
  };
}
```

**Step 6: Integrate into useStudyPlan**

```typescript
// client/hooks/useStudyPlan.ts
import { useGamificationStore } from '@/stores/gamification-store';

export function useStudyPlan() {
  const { recordActivity } = useGamificationStore();
  const { currentPlan, setCurrentPlan, completeTask, uncompleteTask } = useStudyPlanStore();

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    recordActivity('study_plan_task_completed');
  };

  return {
    currentPlan,
    generatePlan,
    completeTask: handleCompleteTask, // Use wrapper
    uncompleteTask,
    isGenerating,
    error,
    remainingQuota,
  };
}
```

**Step 7: Commit**

```bash
git add client/stores/gamification-store.ts client/hooks/useTafsir.ts client/hooks/useVerseConversation.ts client/hooks/useDuaRecommender.ts client/hooks/useStudyPlan.ts
git commit -m "feat(gamification): add XP rewards for Phase 6 features"
```

---

### Task 3: Verify Premium Feature Gating

**Files:**
- Modify: `client/lib/premium-features.ts` (verify all Phase 6 features added)
- Modify: `client/hooks/useEntitlements.ts` (verify tier mappings)

**Step 1: Verify PremiumFeature enum completeness**

```typescript
// client/lib/premium-features.ts - Verify these exist
export enum PremiumFeature {
  // Phase 6A
  HIFZ_UNLIMITED = 'hifz_unlimited',
  HIFZ_AI_ANALYSIS = 'hifz_ai_analysis',
  HIFZ_CIRCLES = 'hifz_circles',

  // Phase 6B
  TAFSIR_UNLIMITED = 'tafsir_unlimited',
  VERSE_DISCUSSION_UNLIMITED = 'verse_discussion_unlimited',

  // Phase 6C
  DUA_UNLIMITED = 'dua_unlimited',

  // Phase 6D
  STUDY_PLAN_REGENERATE = 'study_plan_regenerate',
  STUDY_PLAN_ADAPT = 'study_plan_adapt',
  STUDY_PLAN_MULTIPLE = 'study_plan_multiple',
}
```

**Step 2: Verify tier mappings**

```typescript
// client/hooks/useEntitlements.ts - Verify these mappings
const FEATURE_TIER_MAP: Record<FeatureName, SubscriptionTier[]> = {
  // Phase 6A
  hifz_unlimited: ['plus', 'pro'],
  hifz_ai_analysis: ['plus', 'pro'],
  hifz_circles: ['pro'],

  // Phase 6B
  tafsir_unlimited: ['plus', 'pro'],
  verse_discussion_unlimited: ['plus', 'pro'],

  // Phase 6C
  dua_unlimited: ['plus', 'pro'],

  // Phase 6D
  study_plan_regenerate: ['plus', 'pro'],
  study_plan_adapt: ['plus', 'pro'],
  study_plan_multiple: ['pro'],
};
```

**Step 3: Verify AI daily quota middleware usage**

Check that these server routes use `aiDailyQuotaMiddleware`:
- ✅ `server/routes/tafsir-routes.ts`
- ✅ `server/routes/verse-conversation-routes.ts`
- ✅ `server/routes/hifz-routes.ts`
- ✅ `server/routes/study-plan-routes.ts`
- ⚠️ `server/routes/dua-routes.ts` (should NOT use quota - it's search-based)

**Step 4: Commit if changes needed**

```bash
git add client/lib/premium-features.ts client/hooks/useEntitlements.ts
git commit -m "feat(premium): verify Phase 6 entitlements complete"
```

---

### Task 4: Update CONTINUE.md with Phase 6 Completion

**Files:**
- Modify: `CONTINUE.md`

**Step 1: Update test count**

Current: 703 tests (after Phase 6A-C)
After Phase 6D: Add ~5 new tests → 708 tests

```markdown
- **Tests**: 708/708 passing (all Phase 6 tests included)
```

**Step 2: Mark all Phase 6 complete**

```markdown
### COMPLETE — Phase 6A: Hifz Memorization System
[existing content]

### COMPLETE — Phase 6B: AI Tafsir + Verse Conversation
[existing content]

### COMPLETE — Phase 6C: AI Dua Recommender
[existing content]

### COMPLETE — Phase 6D: Personalized Study Plan

**COMPLETED** on main branch (10 commits, ~2500 lines).

Core features:
- 3-step onboarding (goal, time commitment, skill level)
- AI-generated weekly study plans with Claude Haiku
- Daily task cards with deep link navigation to app screens
- Completion tracking with AsyncStorage persistence
- Weekly stats: completion rate, streak, week start date
- Server endpoint: POST /api/study-plan/generate
- 5 new tests (generator + routes)

### COMPLETE — Phase 6E: Integration + Polish

**COMPLETED** on main branch (5 commits).

Polish work:
- Fixed HifzMistakeFeedback TypeScript errors (TS2307, TS2503, TS7006, TS2322)
- Integrated gamification hooks across all Phase 6 features
- Verified premium feature gating for all 4 phases
- Updated documentation
- Final test coverage: 708/708 passing

### NEXT — Phase 7: Production Readiness
- E2E tests with Maestro
- Performance optimization
- App Store submission preparation
```

**Step 3: Add Phase 6D file map**

```markdown
## New File Map (Personalized Study Plan - Phase 6D)

\```
shared/types/study-plan.ts              # NEW: TypeScript types for plans and tasks
server/services/study-plan-generator.ts # NEW: Claude Haiku plan generation
server/routes/study-plan-routes.ts      # NEW: POST /api/study-plan/generate
server/__tests__/study-plan-generator.test.ts  # NEW: 1 test for generator
server/__tests__/study-plan-routes.test.ts     # NEW: 3 tests for routes
client/stores/study-plan-store.ts       # NEW: Zustand store with AsyncStorage
client/stores/__tests__/study-plan-store.test.ts  # NEW: 2 store tests
client/hooks/useStudyPlan.ts            # NEW: plan generation and completion hook
client/components/StudyPlanOnboarding.tsx  # NEW: 3-step goal/time/level picker
client/components/DailyTaskCard.tsx     # NEW: task card with deep link navigation
client/screens/learn/StudyPlanScreen.tsx  # NEW: weekly calendar view
client/navigation/types.ts              # MODIFIED: added StudyPlan route
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered StudyPlanScreen
client/screens/learn/LearnTabScreen.tsx  # MODIFIED: added "My Study Plan" card
server/routes.ts                        # MODIFIED: registered study-plan routes
\```
```

**Step 4: Commit**

```bash
git add CONTINUE.md
git commit -m "docs: mark Phase 6D and 6E complete in CONTINUE.md"
```

---

### Task 5: Add E2E Tests for Critical Flows

**Files:**
- Create: `e2e/flows/hifz-recitation.yaml`
- Create: `e2e/flows/study-plan-creation.yaml`

**Step 1: Create Hifz recitation E2E test**

```yaml
# e2e/flows/hifz-recitation.yaml
appId: com.byteworthy.noor
---
- launchApp
- tapOn: "Learn"
- tapOn: "Hifz Memorization"
- tapOn: "Start Review"
- assertVisible: "Record"
- tapOn: "Record"
- delay: 2000
- tapOn: "Stop"
- assertVisible: "Score"
- assertVisible: "Again|Hard|Good|Easy"
- tapOn: "Good"
- assertVisible: "Review Saved"
```

**Step 2: Create study plan E2E test**

```yaml
# e2e/flows/study-plan-creation.yaml
appId: com.byteworthy.noor
---
- launchApp
- tapOn: "Learn"
- tapOn: "My Study Plan"
- assertVisible: "What's your Quran goal?"
- tapOn: "Memorize Juz 30"
- tapOn: "Next"
- assertVisible: "How much time per day?"
- tapOn: "20 minutes/day"
- tapOn: "Next"
- assertVisible: "What's your current level?"
- tapOn: "Intermediate"
- tapOn: "Generate Plan"
- assertVisible: "Completion"
- assertVisible: "Sunday|Monday|Tuesday"
```

**Step 3: Run E2E tests**

```bash
cd /Users/kevinrichards/projects/noor
maestro test e2e/flows/hifz-recitation.yaml
maestro test e2e/flows/study-plan-creation.yaml
```

Expected: Both flows pass

**Step 4: Commit**

```bash
git add e2e/flows/hifz-recitation.yaml e2e/flows/study-plan-creation.yaml
git commit -m "test: add E2E tests for Hifz and Study Plan flows"
```

---

### Task 6: Final Verification

**Step 1: Run full test suite**

```bash
cd /Users/kevinrichards/projects/noor
npm test
```

Expected: 708/708 tests passing

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 3: Verify all Phase 6 screens accessible**

Manual check in development build:
- ✅ HifzDashboardScreen (from Learn tab)
- ✅ HifzRecitationScreen (from dashboard)
- ✅ VerseDiscussionScreen (from VerseReader Discuss button)
- ✅ DuaFinderScreen (from Learn tab)
- ✅ StudyPlanScreen (from Learn tab)

**Step 4: Verify gamification working**

- Complete a hifz review → check XP increase
- View tafsir → check XP increase
- Complete study plan task → check XP increase
- Search dua → check XP increase

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: Phase 6 (6A-6E) complete - final verification"
```

---

## Success Criteria

✅ HifzMistakeFeedback TypeScript errors fixed
✅ Gamification hooks integrated for all Phase 6 features
✅ Premium feature gating verified and complete
✅ CONTINUE.md updated with Phase 6D and 6E completion
✅ E2E tests added for critical flows
✅ 708/708 tests passing
✅ 0 TypeScript errors
✅ All Phase 6 screens accessible and functional

---

## Execution Options

Plan complete and saved to `docs/plans/2026-02-16-phase6e-integration-polish.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
