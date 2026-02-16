# Phase 6C: AI Dua Recommender Implementation Plan

> **For Claude:** Execute with parallel implementation - this runs alongside Phase 6B.

**Goal:** Build AI-powered dua recommendation system that searches authentic sources and returns duas with Arabic, transliteration, sources, and TTS playback.

**Architecture:** User describes situation → RAG search of knowledge base (6,241 docs) → Claude formats 2-3 authentic duas → Display with TTSButton + save to favorites. Shares AI daily quota.

**Tech Stack:** React Native, TypeScript, Zustand (favorites), Express.js, Claude Haiku API, RAG search, AsyncStorage

---

## Task List

### Task 1: Create Dua Recommender Server Service
**Files:**
- Create: `server/services/dua-recommender.ts`
- Test: `server/__tests__/dua-recommender.test.ts`

Create `searchDuasInRAG(situation: string)` that searches the existing knowledge base and `formatDuasWithClaude(situation: string, ragResults: any[])` that calls Claude Haiku to format as structured JSON array with fields: arabic, transliteration, translation, source, category.

**Authenticity guardrail in prompt:** Only Quran, Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Tirmidhi, Hisn al-Muslim. Always cite source. Never fabricate.

### Task 2: Create Dua Server Routes
**Files:**
- Create: `server/routes/dua-routes.ts`
- Test: `server/__tests__/dua-routes.test.ts`
- Modify: `server/routes.ts`

POST /api/duas/recommend endpoint with aiDailyQuota + aiRateLimiter middleware. Validates situation field, calls dua-recommender service, returns array of duas + remainingQuota.

### Task 3: Create Dua Favorites Store
**Files:**
- Create: `client/stores/dua-favorites-store.ts`

Zustand store with AsyncStorage persistence. State: favorites array (each: id, arabic, transliteration, translation, source, savedAt). Actions: addFavorite, removeFavorite, getFavorites, isFavorite.

### Task 4: Create DuaCard Component
**Files:**
- Create: `client/components/DuaCard.tsx`

GlassCard displaying:
- Arabic text (Amiri font, large, right-aligned)
- Transliteration (italic, smaller)
- English translation
- Source badge (e.g., "Sahih Bukhari #1234")
- Row of action buttons: TTSButton (plays Arabic) + Save/Unsave bookmark button

### Task 5: Create useDuaRecommender Hook
**Files:**
- Create: `client/hooks/useDuaRecommender.ts`

Hook with: recommend(situation), isLoading, error, duas array. Calls POST /api/duas/recommend, stores results in local state.

### Task 6: Create DuaFinderScreen
**Files:**
- Create: `client/screens/learn/DuaFinderScreen.tsx`

Chat-style input at top (TextInput + search button). Below: ScrollView rendering DuaCard for each result. Empty state: common categories as chips (Anxiety, Gratitude, Travel, Before Eating, Morning, Evening). Uses useDuaRecommender + useDuaFavorites.

### Task 7: Navigation Integration
**Files:**
- Modify: `client/navigation/types.ts`
- Modify: `client/navigation/RootStackNavigator.tsx`
- Modify: `client/screens/learn/LearnTabScreen.tsx`

Add DuaFinder route, register screen, add "Find a Dua" feature card to Learn tab (icon: heart, gradient: brown tones).

---

## Success Criteria

✅ RAG search returns authentic duas from knowledge base
✅ Claude formats with source citations (never fabricates)
✅ DuaCard shows Arabic (Amiri font) + transliteration + translation + source
✅ TTS plays Arabic pronunciation
✅ Save/unsave functionality persists to favorites
✅ AI daily quota enforced (shares with tafsir/conversation/tutor)
✅ TypeScript check passes
✅ All tests passing
