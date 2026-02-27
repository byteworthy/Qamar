# Qamar Phase 6: Hifz Memorization System + Deep AI Features

**Date:** 2026-02-16
**Status:** Approved
**Goal:** Leapfrog Tarteel AI on memorization. Build an AI moat no competitor can replicate.

---

## Target Audience

Young Western Muslims (18-35), English-speaking, tech-savvy. Already frustrated with Muslim Pro (ad-heavy, no innovation) and aware of Tarteel (memorization-only, no broader Islamic companion features). Qamar's play: match Tarteel on hifz, beat them on everything else, then surpass them with AI depth.

## Competitive Positioning

| Capability | Tarteel AI | Qamar (after Phase 6) |
|-----------|-----------|---------------------|
| Memorization mistake detection | Yes (premium) | Yes (free for 1 juz, Plus for all) |
| Hidden verse mode | Yes | Yes + peek word/ayah |
| Spaced repetition (FSRS) | No (basic goals only) | **Yes — predicts which verses you'll forget** |
| AI mistake analysis | No (just flags errors) | **Yes — explains why + drills to fix** |
| Hifz circle (teacher/student) | No | **Yes (Pro tier)** |
| Juz progress dashboard | Basic | **Visual 30-juz map, color-coded** |
| AI Tafsir | No | **Yes** |
| AI Dua recommender | No | **Yes (RAG-powered)** |
| Personalized study plans | No | **Yes** |
| AI verse conversation | No | **Yes** |
| Arabic tutor | No | Yes (existing) |
| Pronunciation coach | Similar | Yes (existing) |
| Prayer times, hadith, adhkar | No | Yes (existing) |
| Structured reflection | No | Yes (existing) |

---

## Feature 1: Hifz Memorization System

### Two Modes

**Recitation Mode (test yourself):**
1. User selects surah + verse range (or picks from review queue)
2. Verse text is hidden on screen
3. User recites from memory — STT transcribes via `@react-native-voice/voice`
4. Pronunciation scorer compares transcription to expected text (Levenshtein + char diff)
5. Word-level results: green (correct), red (mistake), yellow (skipped)
6. "Peek" button reveals next word or full ayah
7. User rates difficulty: Again / Hard / Good / Easy
8. FSRS algorithm schedules next review

**Review Mode (spaced repetition):**
- FSRS algorithm (already used for flashcards) adapted for verse-level reviews
- Each memorized verse is a review "card" with its own FSRS state
- Daily review queue: verses due today, sorted by urgency
- Dashboard shows upcoming reviews for the week

### Hifz Circle Mode (Pro)

- Teacher creates a circle, invites students by code
- Teacher assigns: "Memorize Surah Al-Mulk verses 1-10 by Friday"
- Student records recitation within Qamar
- AI pre-grades the recitation (score + mistake report)
- Teacher reviews AI grade, adds personal feedback
- Progress visible to both teacher and student

### Juz Progress Dashboard

- 30-cell grid, one per juz
- Color states:
  - Gray: not started
  - Blue: in progress (some verses memorized)
  - Green: memorized + reviewed within FSRS schedule
  - Yellow: memorized but overdue for review
  - Red: memorized but significantly overdue (risk of forgetting)
- Tap any juz to see verse-level breakdown
- Overall stats: total verses memorized, review streak, estimated completion date

### New Files

| File | Purpose |
|------|---------|
| `client/stores/hifz-store.ts` | Zustand + persist: memorized verses, juz progress, FSRS state, review queue |
| `client/services/hifz/fsrs-scheduler.ts` | FSRS algorithm for verse-level spaced repetition scheduling |
| `client/services/hifz/recitation-checker.ts` | Compare STT output to expected verse text, produce word-level mistake report |
| `client/hooks/useHifzRecitation.ts` | Full recitation flow: hide, recite, STT, score, rate, schedule next review |
| `client/hooks/useHifzProgress.ts` | Juz map state, verse-level status queries, completion stats |
| `client/hooks/useHifzReviewQueue.ts` | Today's due reviews, upcoming schedule |
| `client/screens/learn/HifzDashboardScreen.tsx` | Juz progress map, daily review queue, streak stats |
| `client/screens/learn/HifzRecitationScreen.tsx` | Hidden verse mode with peek, record, STT, mistake feedback, rate difficulty |
| `client/components/JuzProgressMap.tsx` | Visual 30-juz grid with color-coded cells |
| `client/components/HifzMistakeFeedback.tsx` | Word-level colored results + AI tips panel |
| `client/components/HifzPeekOverlay.tsx` | Tap-to-reveal word/ayah overlay |
| `server/routes/hifz-routes.ts` | `POST /api/hifz/analyze-mistakes` (AI analysis), hifz circle sync endpoints |
| `server/services/hifz-prompts.ts` | Claude system prompts for mistake analysis and hifz coaching |

### Navigation

- New route: `HifzDashboard: undefined`
- New route: `HifzRecitation: { surahNumber: number; startVerse: number; endVerse: number }`
- Learn tab: new "Hifz" feature card (icon: `book`)

### Pricing

| Capability | Free | Plus ($2.99) | Pro |
|-----------|------|-------------|-----|
| Track memorization | 1 juz | All 30 juz | All 30 juz |
| Mistake detection | Basic (correct/wrong) | Full word-level | Full word-level |
| FSRS spaced repetition | No | Yes | Yes |
| Mistake history | No | Yes | Yes |
| AI mistake analysis | No | No | Yes |
| Hifz circles | No | No | Yes |

---

## Feature 2: AI Tafsir (Verse Explanation)

### UX Flow

1. User taps verse in VerseReaderScreen
2. "Explain" button appears in verse action bar
3. TafsirPanel slides up below the verse
4. Shows: occasion of revelation, key Arabic word roots, scholarly interpretations, related cross-references, practical takeaway
5. Cached in AsyncStorage per verse (subsequent taps are instant, no API cost)

### System Prompt Approach

Claude is instructed to:
- Reference classical tafsir sources by name (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di)
- Explain in accessible English, not academic jargon
- Include root word analysis for key Arabic terms
- Note where scholars differ in interpretation
- End with a practical reflection question

### New Files

| File | Purpose |
|------|---------|
| `server/services/tafsir-prompts.ts` | System prompt for tafsir generation |
| `server/routes/tafsir-routes.ts` | `POST /api/tafsir/explain` — surah + verse in, structured explanation out |
| `client/hooks/useTafsir.ts` | Fetch + AsyncStorage cache per verse key |
| `client/components/TafsirPanel.tsx` | Slide-up panel: sections for context, language, scholars, application |

### Navigation

No new screen needed. TafsirPanel renders inline within VerseReaderScreen.

### Pricing

Shares existing AI daily quota (3 free/day, unlimited Plus). Cached responses don't count against quota.

---

## Feature 3: AI Dua Recommender

### UX Flow

1. User opens Dua Finder screen (from Learn tab or "Find a dua" shortcut)
2. Types situation: "I'm nervous about a medical procedure" or picks from common categories (anxiety, gratitude, travel, forgiveness, morning/evening, before eating, etc.)
3. AI searches RAG knowledge base (6,241 docs including adhkar/duas) first
4. Returns 2-3 relevant authentic duas, each with:
   - Arabic text (Amiri font)
   - Transliteration
   - English translation
   - Source (hadith reference: Sahih Bukhari #1234, Hisn al-Muslim #56)
   - TTSButton for pronunciation
   - "Save" button to add to personal favorites
5. User can follow up: "Do you have one specifically for before surgery?"

### Authenticity Guardrail

System prompt explicitly instructs Claude:
- Only recommend duas from Quran, Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Tirmidhi, or Hisn al-Muslim
- Always cite the source
- If no authentic dua matches the exact situation, recommend the closest match and explain
- Never fabricate a dua

### New Files

| File | Purpose |
|------|---------|
| `server/services/dua-recommender.ts` | RAG search + Claude formatting |
| `server/routes/dua-routes.ts` | `POST /api/duas/recommend` — situation string in, dua array out |
| `client/hooks/useDuaRecommender.ts` | recommend(situation), loading, results, favorites CRUD |
| `client/stores/dua-favorites-store.ts` | Zustand + persist: saved duas collection |
| `client/screens/learn/DuaFinderScreen.tsx` | Chat-style input + DuaCard results |
| `client/components/DuaCard.tsx` | Arabic + transliteration + translation + source + TTS + save |

### Navigation

- New route: `DuaFinder: undefined`
- Learn tab: new "Find a Dua" feature card (icon: `heart`)

### Pricing

Shares AI daily quota. Category browsing (pre-loaded common duas) is free and unlimited.

---

## Feature 4: Personalized Quran Study Plan

### UX Flow

**Onboarding (3 steps):**
1. **Goal:** Memorize Juz 30 / Read entire Quran in a year / Understand Surah Yusuf / Improve tajweed / Custom goal
2. **Time:** 10 min/day / 20 min/day / 30 min/day / 45+ min/day
3. **Level:** Beginner (learning Arabic alphabet) / Intermediate (can read slowly) / Advanced (fluent reader)

**Plan generation:**
- Claude generates a structured weekly plan as JSON
- Daily tasks: "Read Surah Al-Baqarah verses 1-20 with tajweed" / "Review memorized verses from yesterday" / "Arabic tutor: practice 5 new vocabulary words" / "Reflect on today's reading"
- Each task links to the relevant Qamar screen (VerseReader, HifzRecitation, ArabicTutor, etc.)

**Adaptation:**
- Weekly check-in: "How did this week go?" + completion data
- If behind: Claude adjusts pace, suggests catch-up strategy
- If ahead: Claude advances the plan
- If user changes goal: regenerate

### New Files

| File | Purpose |
|------|---------|
| `server/services/study-plan-generator.ts` | Claude prompt + JSON schema for plans |
| `server/routes/study-plan-routes.ts` | `POST /api/study-plan/generate`, `PUT /api/study-plan/adapt` |
| `client/stores/study-plan-store.ts` | Zustand + persist: current plan, task completion, streak |
| `client/hooks/useStudyPlan.ts` | Generate, fetch, complete task, trigger weekly adaptation |
| `client/screens/learn/StudyPlanScreen.tsx` | Weekly calendar view with daily task cards |
| `client/components/StudyPlanOnboarding.tsx` | 3-step goal/time/level picker |
| `client/components/DailyTaskCard.tsx` | Task title + linked screen + completion toggle |

### Navigation

- New route: `StudyPlan: undefined`
- Learn tab: new "My Study Plan" feature card (icon: `calendar`) — or promoted to top of Learn tab

### Pricing

- Free: Generate 1 plan, no weekly adaptation
- Plus: Regenerate anytime, weekly AI adaptation
- Pro: Multiple concurrent plans

---

## Feature 5: AI Verse Conversation

### UX Flow

1. User taps verse in VerseReaderScreen
2. "Discuss" button in verse action bar
3. Opens VerseDiscussionScreen — chat UI with verse pinned at top
4. Pre-seeded system message: verse text + surah context
5. User asks anything: "Why was this revealed?", "What's the Arabic grammar?", "How does this relate to patience?", "What did Ibn Kathir say?"
6. Conversation persisted per verse in AsyncStorage (return later)

### System Prompt Approach

Claude is instructed to:
- Act as a knowledgeable, warm Quran study companion
- Draw from tafsir, Arabic linguistics, and historical context
- Cross-reference related verses when relevant
- Be honest about scholarly differences of opinion
- Avoid issuing fatawa (legal rulings) — redirect to qualified scholars

### New Files

| File | Purpose |
|------|---------|
| `server/services/verse-conversation-prompts.ts` | System prompt builder: verse text, surah name, position in surah |
| `server/routes/verse-conversation-routes.ts` | `POST /api/verse/discuss` — verse ref + message + history in, response out |
| `client/hooks/useVerseConversation.ts` | Per-verse chat state, sendMessage, history persistence |
| `client/screens/learn/VerseDiscussionScreen.tsx` | Chat UI following AskKarimScreen pattern, verse pinned at top |

### Navigation

- New route: `VerseDiscussion: { surahNumber: number; verseNumber: number }`
- Accessed from VerseReaderScreen verse action bar (no Learn tab card)

### Pricing

Shares AI daily quota.

---

## Server Cost Summary (at 1K users)

| Feature | Cost/call | Est. calls/day | Monthly |
|---------|----------|----------------|---------|
| Existing (tutor, pronunciation, translation) | varies | ~500 | ~$27 |
| Tafsir | ~$0.002 | ~200 (drops as cache fills) | ~$3 dropping to ~$0 |
| Dua Recommender | ~$0.003 | ~150 | ~$14 |
| Study Plan | ~$0.005 | ~30 (weekly gen) | ~$5 |
| Verse Conversation | ~$0.002 | ~300 | ~$18 |
| Hifz AI Analysis | ~$0.002 | ~200 | ~$12 |
| **Total** | | | **~$79/mo** |

All endpoints use Claude Haiku (`claude-haiku-4-5-20251001`). Tafsir caching makes that line item approach $0 over time as popular verses get cached.

---

## Updated Pricing Table

| Capability | Free | Plus ($2.99/mo) | Pro ($11.99/mo) |
|-----------|------|-----------------|-----------------|
| Quran reader (8 reciters, tajweed, word-by-word) | Yes | Yes | Yes |
| Prayer times, qibla, hadith, adhkar | Yes | Yes | Yes |
| TTS (on-device Arabic) | Yes | Yes | Yes |
| Translation (free APIs) | Yes | Yes | Yes |
| Basic gamification (streaks, badges) | Yes | Yes | Yes |
| AI calls (tutor, pronunciation, tafsir, dua, verse chat) | 3/day total | Unlimited | Unlimited |
| Hifz memorization tracking | 1 juz | All 30 juz | All 30 juz |
| FSRS spaced repetition | No | Yes | Yes |
| Mistake history | No | Yes | Yes |
| Study plan | 1 static plan | Weekly AI adaptation | Multiple plans |
| Reflection sessions | Limited | Unlimited | Unlimited |
| AI mistake analysis (hifz) | No | No | Yes |
| Hifz circle (teacher/student) | No | No | Yes |
| All reflection personas | No | No | Yes |
| Advanced analytics | No | No | Yes |

---

## Implementation Phases (Proposed)

### Phase 6A: Hifz Core (largest, most complex)
- Hifz store, FSRS scheduler, recitation checker
- HifzDashboardScreen, HifzRecitationScreen
- JuzProgressMap, HifzMistakeFeedback, PeekOverlay
- Server: hifz-routes, hifz-prompts
- Navigation + Learn tab card

### Phase 6B: AI Tafsir + Verse Conversation
- Tafsir: prompts, route, hook, TafsirPanel
- Verse Conversation: prompts, route, hook, VerseDiscussionScreen
- VerseReaderScreen: add "Explain" and "Discuss" buttons to verse actions
- These share patterns and can be built in parallel

### Phase 6C: Dua Recommender
- RAG integration for dua search
- Server: dua-recommender service, routes
- Client: DuaFinderScreen, DuaCard, favorites store
- Navigation + Learn tab card

### Phase 6D: Study Plan
- Onboarding flow, plan generation, adaptation
- Server: study-plan-generator, routes
- Client: StudyPlanScreen, onboarding, DailyTaskCard, store
- Integration with Hifz + other screens (task deep links)
- Navigation + Learn tab card

### Phase 6E: Integration + Polish
- Update entitlements for new gated features
- Gamification hooks (XP for hifz reviews, study plan completion)
- Update CONTINUE.md, tests, final TypeScript check

---

## New Dependencies

None. All features build on existing stack:
- STT: `@react-native-voice/voice` (installed)
- TTS: `expo-speech` (installed)
- Audio: `expo-av` (installed)
- AI: `@anthropic-ai/sdk` (installed)
- FSRS: Adapt existing flashcard FSRS logic
- RAG: Existing RAG engine for dua search
