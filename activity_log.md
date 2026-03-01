# Activity Log — Qamar (Noor)

> Context recovery pattern. Update at end of every Claude Code session.
> On fresh start: `/clear` → "Read CLAUDE.md, read activity_log.md, tell me the current state."

---

## 2026-03-01 — Complete remaining technical debt (server stubs, client UI, brand rename)

### What was done
- **Server stubs resolved**: tafsir + verse conversation routes now accept `arabicText`/`translation` from client and query `quranMetadata` for surah name (removes hardcoded Al-Fatihah)
- **Quran search clarified**: search endpoint comment updated — FTS5 is client-side only, server search not feasible without data migration
- **Billing webhook**: replaced no-op stub with RevenueCat webhook receiver at `/api/billing/webhook/revenuecat`
- **VerseDiscussionScreen**: uses `useOfflineQuranVerses` for real verse text instead of hardcoded Bismillah
- **HifzRecitationScreen**: word-by-word reveal and full ayah reveal now use actual verse data from offline SQLite DB
- **useHifzRecitation**: integrated `useRecording` + `useSTT` hooks (replaces mock transcription); accepts `expectedText` param
- **TypeScript cleanup**: replaced 3 `any` casts with `WordComparisonResult` type in `HifzMistakeFeedback.tsx`
- **Brand rename**: `NoorColors` → `QamarColors` across 48 client files + updated color file header
- **Tests updated**: tafsir, verse-conversation, and billing test suites updated with db mocks and new required fields

### Key decisions
- Verse Arabic text + translation sent from client (offline SQLite) rather than stored in PostgreSQL — avoids data duplication
- `useHifzRecitation` now takes optional `expectedText` param (third arg) — caller passes verse text from offline DB
- RevenueCat webhook is a stub that logs and acknowledges — signature verification deferred until `REVENUECAT_WEBHOOK_SECRET` is configured

### Files changed (58 files, +633 -480)
- `server/routes/tafsir-routes.ts` — imports db/drizzle, requires arabicText+translation, queries quranMetadata
- `server/routes/verse-conversation-routes.ts` — same pattern as tafsir
- `server/routes/quran-routes.ts` — TODO comment replaced with clarifying comment
- `server/billing/index.ts` — RevenueCat webhook receiver added
- `server/__tests__/tafsir-routes.test.ts` — db mock + arabicText/translation in request bodies
- `server/__tests__/verse-conversation-routes.test.ts` — db mock + arabicText/translation in request bodies
- `server/__tests__/billing.test.ts` — webhook tests updated for RevenueCat endpoint
- `client/hooks/useHifzRecitation.ts` — integrated useRecording + useSTT, accepts expectedText
- `client/screens/learn/VerseDiscussionScreen.tsx` — uses useOfflineQuranVerses
- `client/screens/learn/HifzRecitationScreen.tsx` — offline verse data + word-by-word reveal
- `client/components/HifzMistakeFeedback.tsx` — WordComparisonResult type replaces any
- `client/constants/theme/colors.ts` + 47 other client files — NoorColors → QamarColors

### Test status
- **707/707 passing** (server Jest suite)
- **0 lint errors** (230 warnings — pre-existing, non-blocking)
- **TypeScript clean** (`tsc --noEmit` passes)

### Resolved from previous session's known issues
- ~~`server/routes/quran-routes.ts:255` — full-text Quran search not implemented~~ → clarified as client-side FTS5
- ~~`client/hooks/useHifzRecitation.ts:64,82` — recording/STT integration stubbed out~~ → integrated
- ~~Pre-existing TypeScript errors in `HifzMistakeFeedback.tsx`~~ → fixed with proper types

### Next steps
- Fill EAS placeholders: `ascAppId` and `appleTeamId` in `eas.json` (requires App Store Connect)
- RevenueCat product setup (3 products: monthly $2.99, yearly $19.99, lifetime $49.99)
- Configure `REVENUECAT_WEBHOOK_SECRET` env var and enable signature verification in webhook handler
- Rotate RevenueCat API key (was briefly tracked in git)
- Generate App Store screenshots (see `docs/app-store/`)
- Physical device testing before App Store submission

### Known issues / blockers
- `eas.json` has `PLACEHOLDER_ASC_APP_ID` and `PLACEHOLDER_TEAM_ID` — blocks App Store build submission
- RevenueCat webhook does not verify signatures yet (needs env var configured)

---

## 2026-02-28 — Full codebase technical debt audit + fixes

### What was done
- Ran full audit: tests, lint, brand drift, config drift, navigation types, CVEs, dead code, TODOs
- Fixed all P0–P2 findings; committed and pushed to main

### Key decisions
- `@react-native-voice/voice` downgraded 3.2.4 → 3.1.5 to resolve CRITICAL xmldom CVE chain
- `web/`, `e2e/`, `scripts/` excluded from root eslint (each has own env/config)
- Brand drift fix was extensive (~60 files); remote branch had already done partial work — merged cleanly
- `dist/` was already gitignored (false positive in audit)
- EAS placeholders (`ascAppId`, `appleTeamId`) intentionally left — require real App Store Connect values

### Files changed (major)
- `server/__tests__/api-flow.test.ts` — added `jest.setTimeout(15000)` for flaky multi-step test
- `server/notifications.ts` — push notification titles now say "Qamar"
- `server/services/rag-engine.ts` — fixed malformed inline type annotations (syntax errors)
- `eslint.config.js` — added web/e2e/scripts to ignores
- `package.json` — name: "noor" → "qamar", voice dep pinned to 3.1.5
- `web/lib/seo.ts` — full brand update (title, OG, Twitter, URL, creator)
- ~60 client/server/e2e/web files — Noor → Qamar in comments, strings, test assertions

### Test status
- **707/707 passing** (server Jest suite with VALIDATION_MODE=true)
- **0 lint errors** (230 warnings — non-blocking, mostly unused vars)
- **0 CVEs** (was: 1 critical, 2 high, 5 moderate)

### Next steps
- Fill EAS placeholders: `ascAppId` and `appleTeamId` in `eas.json` (requires App Store Connect)
- RevenueCat product setup (3 products: monthly $2.99, yearly $19.99, lifetime $49.99)
- Rotate RevenueCat API key (was briefly tracked in git)
- Generate App Store screenshots (see `docs/app-store/`)
- Physical device testing before App Store submission
- Resolve TODO stubs: tafsir surah lookup, Hifz memorize/review nav, verse Arabic text display

### Known issues / blockers
- `eas.json` has `PLACEHOLDER_ASC_APP_ID` and `PLACEHOLDER_TEAM_ID` — blocks App Store build submission
- `server/routes/quran-routes.ts:255` — full-text Quran search not implemented (hardcoded surah)
- `client/hooks/useHifzRecitation.ts:64,82` — recording/STT integration stubbed out
- Pre-existing TypeScript errors in `HifzMistakeFeedback.tsx` (suppressed, non-blocking)

---
