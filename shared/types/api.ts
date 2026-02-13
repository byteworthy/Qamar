// shared/types/api.ts

// ============= Common Types =============

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============= User Types =============

export interface User {
  id: string;
  email: string;
  stripeCustomerId: string;
  subscriptionStatus:
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "inactive";
  stripeSubscriptionId?: string;
  subscriptionTier?: string;
  trialEndsAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSettings {
  notifications: {
    enabled: boolean;
    email?: boolean;
    push?: boolean;
  };
  theme?: "light" | "dark" | "auto";
  language?: string;
}

export interface UserResponse {
  user: User;
}

export interface UpdateSettingsRequest {
  settings: UserSettings;
}

export interface UpdateSettingsResponse {
  success: boolean;
  settings: UserSettings;
}

// ============= Reflection Types =============

export interface Reflection {
  id: string;
  userId: string;
  thought: string;
  reframe: string;
  intention?: string;
  emotionalState: string;
  emotionalIntensity?: number;
  distortions: string[];
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReflectionRequest {
  thought: string;
  reframe: string;
  intention?: string;
  emotionalState: string;
  emotionalIntensity?: number;
  distortions: string[];
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
  };
}

export interface CreateReflectionResponse {
  reflection: Reflection;
}

export interface GetReflectionsResponse extends PaginatedResponse<Reflection> {}

export interface GetReflectionResponse {
  reflection: Reflection;
}

export interface DeleteReflectionResponse {
  success: boolean;
}

// ============= Analysis Types =============

export interface ToneAnalysis {
  tone: string;
  empathy: number;
  clinical: number;
  supportive: number;
  judgment?: number;
  dismissiveness?: number;
}

export interface AnalyzeThoughtRequest {
  thought: string;
  context?: string;
}

export interface AnalyzeThoughtResponse {
  emotionalState: string;
  emotionalIntensity: number;
  distortions: {
    type: string;
    confidence: number;
    evidence: string;
  }[];
  toneAnalysis: ToneAnalysis;
  crisisDetected?: boolean;
  resources?: {
    name: string;
    phone: string;
    url?: string;
  }[];
}

// ============= Reframe Types =============

export interface ReframeRequest {
  thought: string;
  analysis: {
    emotionalState: string;
    distortions: string[];
    intensity?: number;
  };
  islamicContext?: boolean;
}

export interface ReframeResponse {
  reframe: string;
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
    dua?: string;
  };
  tone: {
    compliant: boolean;
    score: number;
  };
}

// ============= Practice Types =============

export interface PracticeRequest {
  emotionalState: string;
  intensity: "low" | "medium" | "high";
  preference?: "breathing" | "grounding" | "mindfulness";
}

export interface Practice {
  type: string;
  title: string;
  description: string;
  steps: string[];
  duration: number;
  islamicElement?: {
    verse?: string;
    dua?: string;
  };
}

export interface PracticeResponse {
  practice: Practice;
  duration: number;
}

// ============= Insights Types =============

export interface InsightsSummaryRequest {
  reflectionIds?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface InsightsSummaryResponse {
  summary: string;
  patterns: {
    type: string;
    frequency: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  progress: {
    emotionalRegulation: number;
    distortionAwareness: number;
    copingSkills: number;
  };
  recommendations: string[];
}

// ============= Billing Types =============

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface BillingPortalRequest {
  returnUrl: string;
}

export interface BillingPortalResponse {
  url: string;
}

// ============= Health Check =============

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version?: string;
  database?: "connected" | "disconnected";
}

// ============= Quran Types =============

/**
 * Represents a single Surah (chapter) in the Quran
 */
export interface Surah {
  id: number;
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
}

/**
 * Represents a single verse (ayah) from the Quran
 */
export interface Verse {
  id: string;
  surahNumber: number;
  verseNumber: number;
  textArabic: string;
  textTranslation: string;
  translationLanguage: string; // ISO code: 'en', 'ur', 'fr', etc.
  transliteration?: string;
  juz?: number;
  hizb?: number;
  page?: number;
}

/**
 * Translation metadata
 */
export interface Translation {
  id: string;
  language: string; // ISO code
  languageName: string;
  translator: string;
  isPremium: boolean; // Some translations require premium
}

/**
 * Quran bookmark saved by user
 */
export interface QuranBookmark {
  id: string;
  userId: string;
  surahNumber: number;
  verseNumber: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Quran search result
 */
export interface QuranSearchResult {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  textArabic: string;
  textTranslation: string;
  highlight?: {
    start: number;
    end: number;
  };
  relevanceScore?: number;
}

// Quran API Requests/Responses

export interface GetSurahsResponse {
  surahs: Surah[];
}

export interface GetVersesRequest {
  surahNumber: number;
  translation?: string; // ISO language code
  includeTransliteration?: boolean;
}

export interface GetVersesResponse {
  surah: Surah;
  verses: Verse[];
  translation: Translation;
}

export interface SearchQuranRequest {
  query: string;
  translation?: string;
  limit?: number;
  surahFilter?: number; // Search within specific surah
}

export interface SearchQuranResponse extends PaginatedResponse<QuranSearchResult> {}

export interface CreateBookmarkRequest {
  surahNumber: number;
  verseNumber: number;
  note?: string;
}

export interface CreateBookmarkResponse {
  bookmark: QuranBookmark;
}

export interface GetBookmarksResponse extends PaginatedResponse<QuranBookmark> {}

export interface DeleteBookmarkResponse {
  success: boolean;
}

export interface GetTranslationsResponse {
  translations: Translation[];
}

// ============= Prayer Times Types =============

/**
 * Prayer times for a single day
 */
export interface PrayerTimes {
  date: string; // ISO date string
  fajr: string; // ISO datetime string
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight?: string;
  qiyam?: string;
}

/**
 * User's prayer settings
 */
export interface PrayerSettings {
  id: string;
  userId: string;
  calculationMethod: string; // MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Jafari
  asrCalculation: "Standard" | "Hanafi";
  highLatitudeRule: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    timezone?: string;
  };
  notificationsEnabled: boolean;
  notificationMinutesBefore: number; // 0, 5, 10, 15, 30
  createdAt: string;
  updatedAt?: string;
}

/**
 * Qibla direction information
 */
export interface QiblaDirection {
  direction: number; // Degrees from North (0-360)
  distance: number; // Distance to Kaaba in km
}

// Prayer API Requests/Responses

export interface GetPrayerTimesRequest {
  latitude: number;
  longitude: number;
  date?: string; // YYYY-MM-DD, defaults to today
  calculationMethod?: string;
}

export interface GetPrayerTimesResponse {
  prayerTimes: PrayerTimes;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

export interface GetPrayerSettingsResponse {
  settings: PrayerSettings;
}

export interface UpdatePrayerSettingsRequest {
  calculationMethod?: string;
  asrCalculation?: "Standard" | "Hanafi";
  highLatitudeRule?:
    | "MiddleOfTheNight"
    | "SeventhOfTheNight"
    | "TwilightAngle";
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  notificationsEnabled?: boolean;
  notificationMinutesBefore?: number;
}

export interface UpdatePrayerSettingsResponse {
  settings: PrayerSettings;
}

export interface GetQiblaDirectionRequest {
  latitude: number;
  longitude: number;
}

export interface GetQiblaDirectionResponse {
  qibla: QiblaDirection;
}

// ============= Arabic Learning Types =============

/**
 * Vocabulary card for Arabic learning
 */
export interface VocabularyCard {
  id: string;
  word: string; // Arabic word
  transliteration: string;
  translation: string;
  level: number; // 1-5 difficulty
  category: string; // greetings, prayers, daily-life, etc.
  exampleSentence?: {
    arabic: string;
    transliteration: string;
    translation: string;
  };
  audioUrl?: string; // URL to pronunciation audio (premium)
}

/**
 * FSRS (Free Spaced Repetition Scheduler) review data
 * Algorithm for optimal flashcard scheduling
 */
export interface FSRSReview {
  id: string;
  userId: string;
  cardId: string;
  difficulty: number; // 0-10 scale
  stability: number; // Memory stability in days
  retrievability: number; // 0-1, likelihood of recall
  lastReviewDate: string;
  nextReviewDate: string;
  reviewCount: number;
  lapseCount: number;
  state: "New" | "Learning" | "Review" | "Relearning";
}

/**
 * Conversation scenario for AI practice
 */
export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  level: number; // 1-5
  isPremium: boolean;
  estimatedDuration: number; // minutes
  vocabulary: string[]; // List of word IDs covered
  imageUrl?: string;
}

/**
 * AI conversation message
 */
export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  feedback?: {
    grammarCorrections?: string[];
    vocabularySuggestions?: string[];
    pronunciationTips?: string[];
  };
  timestamp: string;
}

/**
 * Active conversation session
 */
export interface ConversationSession {
  id: string;
  userId: string;
  scenarioId: string;
  messages: ConversationMessage[];
  startedAt: string;
  lastMessageAt: string;
  isCompleted: boolean;
}

// Arabic Learning API Requests/Responses

export interface GetVocabularyRequest extends PaginationParams {
  level?: number;
  category?: string;
}

export interface GetVocabularyResponse extends PaginatedResponse<VocabularyCard> {}

export interface GetFlashcardsForReviewRequest {
  limit?: number; // How many cards to review
}

export interface GetFlashcardsForReviewResponse {
  cards: VocabularyCard[];
  reviews: FSRSReview[];
  totalDue: number;
}

export interface SubmitFlashcardReviewRequest {
  cardId: string;
  rating: number; // 1-4 (Again, Hard, Good, Easy)
  timeTaken?: number; // seconds
}

export interface SubmitFlashcardReviewResponse {
  review: FSRSReview;
  nextCard?: VocabularyCard;
}

export interface GetConversationScenariosResponse {
  scenarios: ConversationScenario[];
}

export interface StartConversationRequest {
  scenarioId: string;
}

export interface StartConversationResponse {
  session: ConversationSession;
  initialMessage: ConversationMessage;
}

export interface SendConversationMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendConversationMessageResponse {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
}

export interface GetConversationHistoryResponse {
  sessions: ConversationSession[];
}

// ============= Hadith Types =============

/**
 * Hadith collection (e.g., Sahih Bukhari, Sahih Muslim)
 */
export interface HadithCollection {
  id: string;
  name: string;
  nameArabic: string;
  totalHadiths: number;
  description: string;
}

/**
 * Individual Hadith
 */
export interface Hadith {
  id: string;
  collectionId: string;
  bookNumber: number;
  hadithNumber: number;
  textArabic: string;
  textTranslation: string;
  translationLanguage: string;
  narrator: string;
  grade?: string; // Sahih, Hasan, Daif, etc.
  reference?: string;
}

/**
 * Hadith bookmark
 */
export interface HadithBookmark {
  id: string;
  userId: string;
  hadithId: string;
  note?: string;
  createdAt: string;
}

// Hadith API Requests/Responses

export interface GetHadithCollectionsResponse {
  collections: HadithCollection[];
}

export interface GetHadithsRequest extends PaginationParams {
  collectionId: string;
  bookNumber?: number;
}

export interface GetHadithsResponse extends PaginatedResponse<Hadith> {
  collection: HadithCollection;
}

export interface SearchHadithRequest {
  query: string;
  collectionId?: string;
  limit?: number;
}

export interface SearchHadithResponse extends PaginatedResponse<Hadith> {}

export interface GetHadithBookmarksResponse
  extends PaginatedResponse<HadithBookmark> {}

export interface CreateHadithBookmarkRequest {
  hadithId: string;
  note?: string;
}

export interface CreateHadithBookmarkResponse {
  bookmark: HadithBookmark;
}

// ============= Progress & Stats Types =============

/**
 * User's overall progress across all features
 */
export interface UserProgress {
  userId: string;
  quran: {
    totalVersesMastered: number;
    currentSurah?: number;
    currentVerse?: number;
    bookmarksCount: number;
    lastReadAt?: string;
  };
  arabic: {
    currentLevel: number;
    totalWordsLearned: number;
    streakDays: number;
    reviewsCompletedToday: number;
    dailyGoal: number;
    lastReviewAt?: string;
  };
  prayer: {
    consecutivePrayersTracked: number;
    totalPrayersTracked: number;
    streakDays: number;
    lastPrayerAt?: string;
  };
  cbt: {
    totalReflections: number;
    currentStreak: number;
    lastReflectionAt?: string;
  };
  updatedAt: string;
}

export interface GetUserProgressResponse {
  progress: UserProgress;
}

export interface UpdateProgressRequest {
  feature: "quran" | "arabic" | "prayer" | "cbt";
  action: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProgressResponse {
  progress: UserProgress;
}

// ============= Generic API Response Wrapper =============

export type ApiResponse<T> = T | ApiError;

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "string"
  );
}
