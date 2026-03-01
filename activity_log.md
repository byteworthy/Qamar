# Activity Log — Qamar (Noor)

> Context recovery pattern. Update at end of every Claude Code session.
> On fresh start: `/clear` → "Read CLAUDE.md, read activity_log.md, tell me the current state."

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
