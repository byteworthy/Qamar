import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as quranApi from "../services/quranApi";

// ============================================================================
// TYPES
// ============================================================================

export interface Surah {
  id: number;
  name: string; // Arabic name
  transliteration: string; // English transliteration
  translation: string; // English translation
  numberOfVerses: number;
  revelationPlace: "Makkah" | "Madinah";
}

export interface Verse {
  id: number;
  surahId: number;
  verseNumber: number;
  textArabic: string;
  textEnglish: string;
}

export interface Bookmark {
  id: string;
  surahId: number;
  verseNumber: number;
  createdAt: string;
}

// ============================================================================
// MOCK DATA FLAG - Toggle this to switch between mock and real API
// ============================================================================

const USE_MOCK_DATA = true;

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SURAHS: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    transliteration: "Al-Fatihah",
    translation: "The Opening",
    numberOfVerses: 7,
    revelationPlace: "Makkah",
  },
  {
    id: 2,
    name: "البقرة",
    transliteration: "Al-Baqarah",
    translation: "The Cow",
    numberOfVerses: 286,
    revelationPlace: "Madinah",
  },
  {
    id: 112,
    name: "الإخلاص",
    transliteration: "Al-Ikhlas",
    translation: "The Sincerity",
    numberOfVerses: 4,
    revelationPlace: "Makkah",
  },
  {
    id: 113,
    name: "الفلق",
    transliteration: "Al-Falaq",
    translation: "The Daybreak",
    numberOfVerses: 5,
    revelationPlace: "Makkah",
  },
  {
    id: 114,
    name: "الناس",
    transliteration: "An-Nas",
    translation: "Mankind",
    numberOfVerses: 6,
    revelationPlace: "Makkah",
  },
];

const MOCK_VERSES: Record<number, Verse[]> = {
  1: [
    {
      id: 1,
      surahId: 1,
      verseNumber: 1,
      textArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      textEnglish:
        "In the name of Allah, the Most Gracious, the Most Merciful.",
    },
    {
      id: 2,
      surahId: 1,
      verseNumber: 2,
      textArabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      textEnglish:
        "All praise is due to Allah, Lord of all the worlds.",
    },
    {
      id: 3,
      surahId: 1,
      verseNumber: 3,
      textArabic: "الرَّحْمَٰنِ الرَّحِيمِ",
      textEnglish: "The Most Gracious, the Most Merciful.",
    },
    {
      id: 4,
      surahId: 1,
      verseNumber: 4,
      textArabic: "مَالِكِ يَوْمِ الدِّينِ",
      textEnglish: "Master of the Day of Judgment.",
    },
    {
      id: 5,
      surahId: 1,
      verseNumber: 5,
      textArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      textEnglish: "You alone we worship, and You alone we ask for help.",
    },
    {
      id: 6,
      surahId: 1,
      verseNumber: 6,
      textArabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      textEnglish: "Guide us on the Straight Path.",
    },
    {
      id: 7,
      surahId: 1,
      verseNumber: 7,
      textArabic:
        "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      textEnglish:
        "The path of those You have blessed, not of those who have earned Your anger or those who are astray.",
    },
  ],
  2: [
    {
      id: 8,
      surahId: 2,
      verseNumber: 1,
      textArabic: "الم",
      textEnglish: "Alif-Lam-Mim.",
    },
    {
      id: 9,
      surahId: 2,
      verseNumber: 2,
      textArabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      textEnglish:
        "This is the Book! There is no doubt about it—a guide for those mindful of Allah.",
    },
    {
      id: 10,
      surahId: 2,
      verseNumber: 3,
      textArabic:
        "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
      textEnglish:
        "Who believe in the unseen, establish prayer, and donate from what We have provided for them.",
    },
    {
      id: 11,
      surahId: 2,
      verseNumber: 4,
      textArabic:
        "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
      textEnglish:
        "And who believe in what has been revealed to you and what was revealed before you, and have sure faith in the Hereafter.",
    },
    {
      id: 12,
      surahId: 2,
      verseNumber: 5,
      textArabic: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
      textEnglish:
        "It is they who are truly guided by their Lord, and it is they who will be successful.",
    },
    {
      id: 13,
      surahId: 2,
      verseNumber: 6,
      textArabic:
        "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ",
      textEnglish:
        "As for those who persist in disbelief, it is the same whether you warn them or not—they will never believe.",
    },
    {
      id: 14,
      surahId: 2,
      verseNumber: 7,
      textArabic:
        "خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ",
      textEnglish:
        "Allah has sealed their hearts and their hearing, and their sight is covered. They will suffer a tremendous punishment.",
    },
    {
      id: 15,
      surahId: 2,
      verseNumber: 8,
      textArabic:
        "وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ",
      textEnglish:
        "And there are some who say, 'We believe in Allah and the Last Day,' yet they are not true believers.",
    },
    {
      id: 16,
      surahId: 2,
      verseNumber: 9,
      textArabic:
        "يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ",
      textEnglish:
        "They seek to deceive Allah and the believers, yet they only deceive themselves, but they fail to perceive it.",
    },
    {
      id: 17,
      surahId: 2,
      verseNumber: 10,
      textArabic:
        "فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ",
      textEnglish:
        "There is sickness in their hearts, and Allah only lets their sickness increase. They will suffer a painful punishment for their lies.",
    },
  ],
  112: [
    {
      id: 6222,
      surahId: 112,
      verseNumber: 1,
      textArabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      textEnglish: "Say, 'He is Allah—One and Indivisible;",
    },
    {
      id: 6223,
      surahId: 112,
      verseNumber: 2,
      textArabic: "اللَّهُ الصَّمَدُ",
      textEnglish: "Allah—the Sustainer needed by all.",
    },
    {
      id: 6224,
      surahId: 112,
      verseNumber: 3,
      textArabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      textEnglish: "He has never had offspring, nor was He born.",
    },
    {
      id: 6225,
      surahId: 112,
      verseNumber: 4,
      textArabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      textEnglish: "And there is none comparable to Him.'",
    },
  ],
  113: [
    {
      id: 6226,
      surahId: 113,
      verseNumber: 1,
      textArabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      textEnglish: "Say, 'I seek refuge in the Lord of daybreak",
    },
    {
      id: 6227,
      surahId: 113,
      verseNumber: 2,
      textArabic: "مِن شَرِّ مَا خَلَقَ",
      textEnglish: "from the evil of whatever He has created,",
    },
    {
      id: 6228,
      surahId: 113,
      verseNumber: 3,
      textArabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      textEnglish: "and from the evil of the night when it grows dark,",
    },
    {
      id: 6229,
      surahId: 113,
      verseNumber: 4,
      textArabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
      textEnglish: "and from the evil of those who practice witchcraft,",
    },
    {
      id: 6230,
      surahId: 113,
      verseNumber: 5,
      textArabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      textEnglish: "and from the evil of an envier when they envy.'",
    },
  ],
  114: [
    {
      id: 6231,
      surahId: 114,
      verseNumber: 1,
      textArabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      textEnglish: "Say, 'I seek refuge in the Lord of humankind,",
    },
    {
      id: 6232,
      surahId: 114,
      verseNumber: 2,
      textArabic: "مَلِكِ النَّاسِ",
      textEnglish: "the Master of humankind,",
    },
    {
      id: 6233,
      surahId: 114,
      verseNumber: 3,
      textArabic: "إِلَٰهِ النَّاسِ",
      textEnglish: "the God of humankind,",
    },
    {
      id: 6234,
      surahId: 114,
      verseNumber: 4,
      textArabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
      textEnglish: "from the evil of the lurking whisperer—",
    },
    {
      id: 6235,
      surahId: 114,
      verseNumber: 5,
      textArabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
      textEnglish: "who whispers into the hearts of humankind—",
    },
    {
      id: 6236,
      surahId: 114,
      verseNumber: 6,
      textArabic: "مِنَ الْجِنَّةِ وَالنَّاسِ",
      textEnglish: "from among jinn and humankind.'",
    },
  ],
};

const MOCK_BOOKMARKS: Bookmark[] = [];

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchSurahs(): Promise<Surah[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_SURAHS;
  }

  // Real API: fetch all 114 surahs from Al Quran Cloud
  return quranApi.fetchAllSurahs();
}

async function fetchVerses(surahId: number): Promise<Verse[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_VERSES[surahId] || [];
  }

  // Real API: fetch surah with Arabic + English
  const { verses } = await quranApi.fetchSurah(surahId);
  return verses;
}

async function searchVerses(query: string): Promise<Verse[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const allVerses = Object.values(MOCK_VERSES).flat();
    return allVerses.filter(
      (verse) =>
        verse.textArabic.includes(query) ||
        verse.textEnglish.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Real API: search across all surahs
  return quranApi.searchQuran(query);
}

async function fetchBookmarks(): Promise<Bookmark[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_BOOKMARKS;
  }

  const response = await fetch("/api/quran/bookmarks");
  if (!response.ok) {
    throw new Error("Failed to fetch bookmarks");
  }
  return response.json();
}

async function createBookmark(
  surahId: number,
  verseNumber: number
): Promise<Bookmark> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      surahId,
      verseNumber,
      createdAt: new Date().toISOString(),
    };
    MOCK_BOOKMARKS.push(newBookmark);
    return newBookmark;
  }

  const response = await fetch("/api/quran/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surahId, verseNumber }),
  });
  if (!response.ok) {
    throw new Error("Failed to create bookmark");
  }
  return response.json();
}

async function deleteBookmark(bookmarkId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_BOOKMARKS.findIndex((b) => b.id === bookmarkId);
    if (index !== -1) {
      MOCK_BOOKMARKS.splice(index, 1);
    }
    return;
  }

  const response = await fetch(`/api/quran/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete bookmark");
  }
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Fetches the list of all surahs (chapters) in the Quran
 */
export function useQuranSurahs() {
  return useQuery({
    queryKey: ["quran", "surahs"],
    queryFn: fetchSurahs,
    staleTime: USE_MOCK_DATA ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24, // 24h for real API (data never changes)
    gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection for 24h
    retry: USE_MOCK_DATA ? 0 : 3,
  });
}

/**
 * Fetches all verses for a specific surah
 */
export function useQuranVerses(surahId: number) {
  return useQuery({
    queryKey: ["quran", "verses", surahId],
    queryFn: () => fetchVerses(surahId),
    enabled: surahId > 0,
    staleTime: USE_MOCK_DATA ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: USE_MOCK_DATA ? 0 : 3,
  });
}

/**
 * Searches verses by text (Arabic or English)
 */
export function useQuranSearch(query: string) {
  return useQuery({
    queryKey: ["quran", "search", query],
    queryFn: () => searchVerses(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: USE_MOCK_DATA ? 0 : 2,
  });
}

/**
 * Fetches audio data for a surah (Mishary Alafasy recitation).
 * Only available when USE_MOCK_DATA is false.
 */
export function useQuranAudio(surahNumber: number) {
  return useQuery({
    queryKey: ["quran", "audio", surahNumber],
    queryFn: () => quranApi.fetchSurahAudio(surahNumber),
    enabled: !USE_MOCK_DATA && surahNumber > 0,
    staleTime: 1000 * 60 * 60 * 24, // Audio URLs are stable
    gcTime: 1000 * 60 * 60 * 24,
    retry: 3,
  });
}

/**
 * Fetches user's bookmarked verses
 */
export function useQuranBookmarks() {
  return useQuery({
    queryKey: ["quran", "bookmarks"],
    queryFn: fetchBookmarks,
  });
}

/**
 * Creates a new bookmark
 */
export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surahId, verseNumber }: { surahId: number; verseNumber: number }) =>
      createBookmark(surahId, verseNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran", "bookmarks"] });
    },
  });
}

/**
 * Deletes a bookmark
 */
export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: string) => deleteBookmark(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran", "bookmarks"] });
    },
  });
}
