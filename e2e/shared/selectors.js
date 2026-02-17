/**
 * E2E Test Selectors
 * Centralized testID constants for all interactive elements
 * Keep in sync with testID props in screen components
 */

// ─── Tab Bar ─────────────────────────────────────────────────
const TABS = {
  HOME: "tab-home",
  HISTORY: "tab-history",
  LEARN: "tab-learn",
  WORSHIP: "tab-worship",
  SETTINGS: "tab-settings",
};

// ─── Home Screen ─────────────────────────────────────────────
const HOME = {
  BEGIN_REFLECTION: "begin-reflection-button",
  STATS_CARD: "stats-card",
  DAILY_NOOR_CARD: "daily-noor-card",
  STREAK_DISPLAY: "streak-display",
};

// ─── Reflection Flow ─────────────────────────────────────────
const REFLECTION = {
  THOUGHT_INPUT: "thought-input",
  INTENSITY_1: "intensity-1",
  INTENSITY_2: "intensity-2",
  INTENSITY_3: "intensity-3",
  INTENSITY_4: "intensity-4",
  INTENSITY_5: "intensity-5",
  CONTINUE_BUTTON: "continue-button",
  CANCEL_BUTTON: "cancel-button",
  SUBMIT_BUTTON: "submit-button",
  SESSION_COMPLETE: "session-complete-screen",
};

// ─── History Screen ───────────────────────────────────────────
const HISTORY = {
  LIST: "reflection-list",
  EMPTY_STATE: "history-empty-state",
  ITEM: (index) => `reflection-item-${index}`,
  DETAIL: "reflection-detail",
};

// ─── Learn Screen ─────────────────────────────────────────────
const LEARN = {
  SCREEN: "learn-screen",
  QURAN_CARD: "learn-quran-card",
  HIFZ_CARD: "learn-hifz-card",
  ARABIC_TUTOR_CARD: "learn-arabic-tutor-card",
  PRONUNCIATION_CARD: "learn-pronunciation-card",
  TRANSLATOR_CARD: "learn-translator-card",
  STUDY_PLAN_CARD: "learn-study-plan-card",
};

// ─── Quran Reader ─────────────────────────────────────────────
const QURAN = {
  READER_SCREEN: "quran-reader-screen",
  SURAH_LIST: "surah-list",
  SURAH_ITEM: (number) => `surah-item-${number}`,
  VERSE_LIST: "verse-list",
  VERSE_ITEM: (number) => `verse-item-${number}`,
  PLAY_BUTTON: "audio-play-button",
  PAUSE_BUTTON: "audio-pause-button",
  TAJWEED_TOGGLE: "tajweed-toggle",
  WORD_BY_WORD_TOGGLE: "word-by-word-toggle",
  RECITER_PICKER: "reciter-picker",
};

// ─── Hifz ─────────────────────────────────────────────────────
const HIFZ = {
  DASHBOARD: "hifz-dashboard-screen",
  START_SESSION: "hifz-start-session",
  VERSE_DISPLAY: "hifz-verse-display",
  REVEAL_BUTTON: "hifz-reveal-button",
  EASY_BUTTON: "hifz-rating-easy",
  GOOD_BUTTON: "hifz-rating-good",
  HARD_BUTTON: "hifz-rating-hard",
  SESSION_COMPLETE: "hifz-session-complete",
};

// ─── Prayer Times ─────────────────────────────────────────────
const PRAYER = {
  SCREEN: "prayer-times-screen",
  FAJR: "prayer-fajr",
  DHUHR: "prayer-dhuhr",
  ASR: "prayer-asr",
  MAGHRIB: "prayer-maghrib",
  ISHA: "prayer-isha",
  QIBLA_BUTTON: "qibla-finder-button",
  QIBLA_COMPASS: "qibla-compass",
};

// ─── Settings Screen ──────────────────────────────────────────
const SETTINGS = {
  SCREEN: "settings-screen",
  SUBSCRIPTION_STATUS: "subscription-status",
  UPGRADE_BUTTON: "upgrade-button",
  THEME_TOGGLE: "theme-toggle",
  LANGUAGE_PICKER: "language-picker",
  PRIVACY_POLICY: "privacy-policy-link",
  TERMS_OF_SERVICE: "terms-of-service-link",
};

// ─── Pricing Screen ───────────────────────────────────────────
const PRICING = {
  SCREEN: "pricing-screen",
  FEATURES_LIST: "features-list",
  MONTHLY_PLAN: "plan-monthly",
  ANNUAL_PLAN: "plan-annual",
  SUBSCRIBE_BUTTON: "subscribe-button",
  RESTORE_BUTTON: "restore-purchases-button",
};

// ─── Offline Banner ───────────────────────────────────────────
const OFFLINE = {
  BANNER: "offline-banner",
  DISMISS: "offline-banner-dismiss",
};

// ─── Feature Preview Carousel ─────────────────────────────────
const ONBOARDING = {
  CAROUSEL: "feature-preview-carousel",
  GET_STARTED: "get-started-button",
};

// ─── Arabic Tutor ─────────────────────────────────────────────
const ARABIC_TUTOR = {
  SCREEN: "arabic-tutor-screen",
  CHAT_INPUT: "tutor-chat-input",
  SEND_BUTTON: "tutor-send-button",
  MESSAGE_LIST: "tutor-message-list",
  QUOTA_BADGE: "daily-quota-badge",
};

// ─── Dua Finder ───────────────────────────────────────────────
const DUA = {
  FINDER_SCREEN: "dua-finder-screen",
  SEARCH_INPUT: "dua-search-input",
  DUA_LIST: "dua-list",
  DUA_CARD: (index) => `dua-card-${index}`,
  FAVORITE_BUTTON: (index) => `dua-favorite-${index}`,
};

module.exports = {
  TABS,
  HOME,
  REFLECTION,
  HISTORY,
  LEARN,
  QURAN,
  HIFZ,
  PRAYER,
  SETTINGS,
  PRICING,
  OFFLINE,
  ONBOARDING,
  ARABIC_TUTOR,
  DUA,
};
