<p align="center">
  <img src="assets/images/noor-icon.svg" width="120" alt="Noor" />
</p>

<h1 align="center">Noor</h1>

<p align="center">
  <strong>The AI-Powered Islamic Companion</strong><br/>
  Quran &middot; Arabic Learning &middot; Prayer &middot; Reflection
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-D4AF37?style=flat-square" />
  <img src="https://img.shields.io/badge/tests-675%20passing-00C853?style=flat-square" />
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-2d6cdf?style=flat-square" />
  <img src="https://img.shields.io/badge/offline-first-7c3aed?style=flat-square" />
</p>

---

One app instead of five. Noor combines a full Quran reader, AI Arabic tutor, pronunciation coach, prayer times, and guided reflection — all ad-free, offline-capable, and powered by AI.

---

## Features

<table>
<tr>
<td width="50%" valign="top">

**Quran**
- 8 reciters with dual-CDN fallback
- Word-by-word audio with highlighting
- Tajweed color-coding (17 rules)

**AI Arabic Suite**
- Conversational Arabic tutor (4 modes)
- Pronunciation coach with scoring
- Translation with root word analysis
- On-device text-to-speech

</td>
<td width="50%" valign="top">

**Prayer & Worship**
- Precise prayer times + qibla compass
- 100+ adhkar with counters
- Islamic calendar + Ramadan mode

**Learning & Growth**
- 356 vocab flashcards (FSRS)
- 200+ hadith (semantic search)
- Streaks, badges, gamification
- AI-guided personal reflection

</td>
</tr>
</table>

---

## What's Different

<table>
<tr>
<td align="center" width="33%"><strong>vs. Muslim Pro</strong><br/><br/>No ads. Ever.<br/>AI tutor + pronunciation coach.<br/>Word-by-word Quran audio.</td>
<td align="center" width="33%"><strong>vs. Tarteel</strong><br/><br/>Full companion, not just Quran.<br/>Prayer, hadith, reflection, flashcards.<br/>AI translation + root analysis.</td>
<td align="center" width="33%"><strong>Cost at 1K users</strong><br/><br/>~$27/mo total.<br/>All audio + TTS + tajweed = $0.<br/>AI via Claude Haiku ~$0.002/call.</td>
</tr>
</table>

---

## Quick Start

```bash
git clone https://github.com/byteworthy/Noor.git && cd Noor && npm install
cp .env.example .env       # Add ANTHROPIC_API_KEY + DATABASE_URL
npm run server:dev          # Terminal 1
npx expo start              # Terminal 2
```

```bash
npm test                    # 675 tests
npx tsc --noEmit            # 0 errors
```

---

## Tech Stack

```
React Native + Expo 54        Express.js + PostgreSQL        Railway + EAS Build
TypeScript 5.9                 Anthropic Claude (Haiku)       Sentry + RevenueCat
Zustand + TanStack Query       AES-256-GCM encryption         GitHub Actions CI
expo-speech / expo-av          RAG (6,241 docs)               expo-updates OTA
```

---

## Roadmap

- [x] Quran audio (8 reciters), word-by-word, tajweed, TTS, STT
- [x] AI Arabic tutor, pronunciation coach, translator
- [x] Navigation, premium gating, gamification — 675 tests passing
- [ ] **Next:** Hifz memorization (FSRS), AI tafsir, dua recommender, study plans

Design doc: [`docs/plans/2026-02-16-hifz-and-deep-ai-design.md`](docs/plans/2026-02-16-hifz-and-deep-ai-design.md)

---

<p align="center">
  <a href="SECURITY.md">Security</a> &middot;
  <a href="https://byteworthy.github.io/Noor/legal/privacy.html">Privacy</a> &middot;
  <a href="https://byteworthy.github.io/Noor/legal/terms.html">Terms</a> &middot;
  scale@getbyteworthy.com
</p>

<p align="center">
  <em>"Allah does not burden a soul beyond that it can bear."</em> — Quran 2:286
</p>
