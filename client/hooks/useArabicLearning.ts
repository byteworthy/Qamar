import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// TYPES
// ============================================================================

export interface Flashcard {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category: "alphabet" | "vocabulary" | "phrase";
  difficulty: number;
  stability: number;
  nextReview: string; // ISO date
  state: "new" | "learning" | "review" | "relearning";
  reviewCount: number;
}

export interface ReviewResult {
  cardId: string;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  reviewedAt: string;
}

export interface LearningProgress {
  totalCards: number;
  cardsLearned: number;
  cardsDue: number;
  streak: number;
  accuracy: number;
  minutesStudied: number;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleArabic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  phrases: ConversationPhrase[];
}

export interface ConversationPhrase {
  arabic: string;
  transliteration: string;
  english: string;
  audioUrl?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const USE_MOCK_DATA = false;

const MOCK_FLASHCARDS: Flashcard[] = [
  // 28 Arabic Letters
  {
    id: "1",
    arabic: "أ",
    transliteration: "Alif",
    english: "A",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "2",
    arabic: "ب",
    transliteration: "Ba",
    english: "B",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "3",
    arabic: "ت",
    transliteration: "Ta",
    english: "T",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "4",
    arabic: "ث",
    transliteration: "Tha",
    english: "Th",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "5",
    arabic: "ج",
    transliteration: "Jim",
    english: "J",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "6",
    arabic: "ح",
    transliteration: "Ha",
    english: "H",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "7",
    arabic: "خ",
    transliteration: "Kha",
    english: "Kh",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "8",
    arabic: "د",
    transliteration: "Dal",
    english: "D",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "9",
    arabic: "ذ",
    transliteration: "Dhal",
    english: "Dh",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "10",
    arabic: "ر",
    transliteration: "Ra",
    english: "R",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "11",
    arabic: "ز",
    transliteration: "Zay",
    english: "Z",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "12",
    arabic: "س",
    transliteration: "Sin",
    english: "S",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "13",
    arabic: "ش",
    transliteration: "Shin",
    english: "Sh",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "14",
    arabic: "ص",
    transliteration: "Sad",
    english: "S",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "15",
    arabic: "ض",
    transliteration: "Dad",
    english: "D",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "16",
    arabic: "ط",
    transliteration: "Ta",
    english: "T",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "17",
    arabic: "ظ",
    transliteration: "Dha",
    english: "Dh",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "18",
    arabic: "ع",
    transliteration: "Ain",
    english: "A",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "19",
    arabic: "غ",
    transliteration: "Ghain",
    english: "Gh",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "20",
    arabic: "ف",
    transliteration: "Fa",
    english: "F",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "21",
    arabic: "ق",
    transliteration: "Qaf",
    english: "Q",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "22",
    arabic: "ك",
    transliteration: "Kaf",
    english: "K",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "23",
    arabic: "ل",
    transliteration: "Lam",
    english: "L",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "24",
    arabic: "م",
    transliteration: "Mim",
    english: "M",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "25",
    arabic: "ن",
    transliteration: "Nun",
    english: "N",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "26",
    arabic: "ه",
    transliteration: "Ha",
    english: "H",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "27",
    arabic: "و",
    transliteration: "Waw",
    english: "W",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "28",
    arabic: "ي",
    transliteration: "Ya",
    english: "Y",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  // 20 Common Vocabulary Words
  {
    id: "29",
    arabic: "سلام",
    transliteration: "Salaam",
    english: "Peace",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "30",
    arabic: "كتاب",
    transliteration: "Kitaab",
    english: "Book",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "31",
    arabic: "ماء",
    transliteration: "Maa",
    english: "Water",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "32",
    arabic: "بيت",
    transliteration: "Bayt",
    english: "House",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "33",
    arabic: "قلب",
    transliteration: "Qalb",
    english: "Heart",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "34",
    arabic: "نور",
    transliteration: "Noor",
    english: "Light",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "35",
    arabic: "علم",
    transliteration: "Ilm",
    english: "Knowledge",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "36",
    arabic: "صبر",
    transliteration: "Sabr",
    english: "Patience",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "37",
    arabic: "رحمة",
    transliteration: "Rahma",
    english: "Mercy",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "38",
    arabic: "شكر",
    transliteration: "Shukr",
    english: "Gratitude",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "39",
    arabic: "دعاء",
    transliteration: "Duaa",
    english: "Supplication",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "40",
    arabic: "مسجد",
    transliteration: "Masjid",
    english: "Mosque",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "41",
    arabic: "قرآن",
    transliteration: "Quran",
    english: "Quran",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "42",
    arabic: "صلاة",
    transliteration: "Salah",
    english: "Prayer",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "43",
    arabic: "إيمان",
    transliteration: "Iman",
    english: "Faith",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "44",
    arabic: "توبة",
    transliteration: "Tawbah",
    english: "Repentance",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "45",
    arabic: "جنة",
    transliteration: "Jannah",
    english: "Paradise",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "46",
    arabic: "حق",
    transliteration: "Haqq",
    english: "Truth",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "47",
    arabic: "أمانة",
    transliteration: "Amanah",
    english: "Trust",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
  {
    id: "48",
    arabic: "تقوى",
    transliteration: "Taqwa",
    english: "God-consciousness",
    category: "vocabulary",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
  },
];

const MOCK_PROGRESS: LearningProgress = {
  totalCards: 78,
  cardsLearned: 12,
  cardsDue: 5,
  streak: 3,
  accuracy: 0.82,
  minutesStudied: 45,
};

const MOCK_SCENARIOS: ConversationScenario[] = [
  {
    id: "1",
    title: "Greetings",
    titleArabic: "التحيات",
    difficulty: "beginner",
    phrases: [
      {
        arabic: "السلام عليكم",
        transliteration: "As-salamu alaykum",
        english: "Peace be upon you",
      },
      {
        arabic: "وعليكم السلام",
        transliteration: "Wa alaykum as-salam",
        english: "And upon you peace",
      },
    ],
  },
  {
    id: "2",
    title: "At the Mosque",
    titleArabic: "في المسجد",
    difficulty: "beginner",
    phrases: [
      {
        arabic: "أين المسجد؟",
        transliteration: "Ayna al-masjid?",
        english: "Where is the mosque?",
      },
      {
        arabic: "الصلاة قريبة",
        transliteration: "As-salah qaribah",
        english: "Prayer is soon",
      },
    ],
  },
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchDueCards(): Promise<Flashcard[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_FLASHCARDS.filter(
      (c) => new Date(c.nextReview) <= new Date()
    );
  }

  const response = await fetch("/api/arabic/flashcards/due");
  if (!response.ok) throw new Error("Failed to fetch due cards");
  return response.json();
}

async function fetchAllCards(): Promise<Flashcard[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_FLASHCARDS;
  }

  const response = await fetch("/api/arabic/flashcards");
  if (!response.ok) throw new Error("Failed to fetch flashcards");
  return response.json();
}

async function submitReview(result: ReviewResult): Promise<Flashcard> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 200));
    const card = MOCK_FLASHCARDS.find((c) => c.id === result.cardId);
    if (!card) throw new Error("Card not found");

    // Simple FSRS-like scheduling
    const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 };
    const days = intervals[result.rating];
    const next = new Date();
    next.setDate(next.getDate() + days);

    card.nextReview = next.toISOString();
    card.state = result.rating >= 3 ? "review" : "relearning";
    card.reviewCount++;
    return card;
  }

  const response = await fetch("/api/arabic/flashcards/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
  if (!response.ok) throw new Error("Failed to submit review");
  return response.json();
}

async function fetchProgress(): Promise<LearningProgress> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_PROGRESS;
  }

  const response = await fetch("/api/arabic/progress");
  if (!response.ok) throw new Error("Failed to fetch progress");
  return response.json();
}

async function fetchScenarios(): Promise<ConversationScenario[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_SCENARIOS;
  }

  const response = await fetch("/api/arabic/scenarios");
  if (!response.ok) throw new Error("Failed to fetch scenarios");
  return response.json();
}

// ============================================================================
// HOOKS
// ============================================================================

export function useDueFlashcards() {
  return useQuery({
    queryKey: ["arabic", "flashcards", "due"],
    queryFn: fetchDueCards,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllFlashcards() {
  return useQuery({
    queryKey: ["arabic", "flashcards", "all"],
    queryFn: fetchAllCards,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result: ReviewResult) => submitReview(result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arabic", "flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["arabic", "progress"] });
    },
  });
}

export function useArabicProgress() {
  return useQuery({
    queryKey: ["arabic", "progress"],
    queryFn: fetchProgress,
    staleTime: 1000 * 60 * 5,
  });
}

export function useConversationScenarios() {
  return useQuery({
    queryKey: ["arabic", "scenarios"],
    queryFn: fetchScenarios,
    staleTime: 1000 * 60 * 60,
  });
}
