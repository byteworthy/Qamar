# iOS App Store Screenshot Specifications

## Required Sizes
- 6.7" iPhone (iPhone 16 Pro Max): 1290 x 2796 px — REQUIRED
- 6.5" iPhone (iPhone 15 Plus): 1284 x 2778 px — optional (can use 6.7")
- 5.5" iPhone (older): 1242 x 2208 px — optional

## Screenshot Order (6-8 screenshots recommended)

### 1. Hero Shot: Quran Reader (01-hero-quran.png)
- Screen: VerseReaderScreen showing Al-Fatiha
- State: Tajweed colors enabled, word-by-word mode with first word highlighted
- Overlay text: "Read the Quran with tajweed & word-by-word audio"
- Why first: Shows core value immediately

### 2. Learn Hub (02-learn-hub.png)
- Screen: LearnTabScreen showing feature card grid
- State: All feature cards visible (Hifz, Study Plan, Arabic Tutor, etc.)
- Overlay text: "Everything you need in one app"
- Why: Shows breadth of features

### 3. Hifz Memorization (03-hifz.png)
- Screen: HifzDashboardScreen
- State: Progress map with some filled cells (shows progress tracking)
- Overlay text: "Memorize the Quran with spaced repetition"
- Why: Unique differentiator vs competitors

### 4. Prayer Times (04-prayer.png)
- Screen: Prayer times screen
- State: Today's prayer times displayed beautifully
- Overlay text: "Never miss prayer"
- Why: Core Islamic app feature

### 5. Arabic Tutor (05-arabic-tutor.png)
- Screen: ArabicTutorScreen chat interface
- State: Active conversation visible (scroll to show multiple messages)
- Overlay text: "Learn Arabic with personalized coaching"
- Why: Shows conversational AI feature

### 6. Study Plan (06-study-plan.png)
- Screen: StudyPlanScreen weekly calendar view
- State: 5-day plan with some completed tasks (checkmarks visible)
- Overlay text: "Personalized weekly study plans"
- Why: Shows modern learning tech

### 7. Quran Audio (07-quran-audio.png)
- Screen: Reciter selection or audio playback controls
- State: 8 reciters visible with Alafasy selected
- Overlay text: "8 world-class reciters"
- Why: Shows audio quality/choice

### 8. Dark Mode (08-dark-mode.png)
- Screen: Any main screen in dark mode (Quran reader looks best)
- State: Dark theme enabled, looks premium
- Overlay text: "Beautiful in any light"
- Why: Shows dark mode support, looks premium

## How to Take Screenshots

### Using iOS Simulator:
1. Run: `npm run ios` (opens in simulator)
2. Navigate to target screen
3. Set up the desired state
4. Press Cmd+S in Simulator (or use Hardware menu > Screenshot)
5. Screenshots saved to Desktop by default

### Apply Device Frames:
1. Use Figma + Apple Design Resources (free)
2. Or use https://shotbot.io (paid, simpler)
3. Export at 1290 x 2796 px

### Overlay Text:
- Font: SF Pro Display Bold or similar
- Color: White with subtle text shadow
- Position: Bottom 25% of screen
- Keep it short (< 30 chars per line)

## Tools Needed
- Xcode iOS Simulator (included with Xcode)
- Figma (free) or Shotbot ($)
- Optional: Canva for overlay text

## Quality Checklist
- [ ] Status bar is clean (full signal, full battery, 9:41 AM)
- [ ] No debug UI elements visible
- [ ] Text is readable at App Store thumbnail size
- [ ] Colors look accurate on both light/dark App Store backgrounds
- [ ] No personal data visible
