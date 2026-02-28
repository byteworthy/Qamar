/**
 * Islamic Context Service for Qamar Companion
 *
 * Detects Islamic queries and fetches relevant Quran/Hadith context
 * for enriching AI companion responses. Uses keyword matching for now;
 * RAG-based retrieval can replace this later.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface IslamicContext {
  relevantVerse?: {
    arabic: string;
    translation: string;
    reference: string;
  };
  relevantHadith?: {
    text: string;
    source: string;
  };
  islamicConcept?: string;
}

// =============================================================================
// KEYWORD DETECTION
// =============================================================================

const ISLAMIC_KEYWORDS = [
  "quran",
  "qur'an",
  "prayer",
  "salah",
  "salat",
  "hadith",
  "sunnah",
  "dua",
  "du'a",
  "allah",
  "prophet",
  "muhammad",
  "sunnah",
  "fiqh",
  "halal",
  "haram",
  "ramadan",
  "fasting",
  "sawm",
  "zakat",
  "hajj",
  "umrah",
  "wudu",
  "ablution",
  "mosque",
  "masjid",
  "imam",
  "jannah",
  "akhira",
  "hereafter",
  "tawbah",
  "repentance",
  "forgiveness",
  "istighfar",
  "dhikr",
  "remembrance",
  "tawakkul",
  "trust in allah",
  "sabr",
  "patience",
  "shukr",
  "gratitude",
  "qadr",
  "destiny",
  "decree",
  "iman",
  "faith",
  "taqwa",
  "jihad",
  "nafs",
  "soul",
  "ruh",
  "spirit",
  "waswasa",
  "shaytan",
  "ibadah",
  "worship",
  "seerah",
  "sahaba",
  "companions",
  "scholar",
  "islamic",
  "muslim",
  "islam",
];

/**
 * Detect if a user message relates to Islamic topics
 */
export function detectIslamicQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return ISLAMIC_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// =============================================================================
// LOCAL QURAN/HADITH DATA
// =============================================================================

interface VerseEntry {
  arabic: string;
  translation: string;
  reference: string;
  keywords: string[];
}

interface HadithEntry {
  text: string;
  source: string;
  keywords: string[];
}

const VERSE_DATABASE: VerseEntry[] = [
  {
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translation: "And your Lord is going to give you, and you will be satisfied.",
    reference: "Surah Ad-Duha 93:5",
    keywords: ["hope", "patience", "sabr", "hardship", "struggle", "waiting", "trust"],
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship comes ease.",
    reference: "Surah Ash-Sharh 94:5",
    keywords: ["hardship", "ease", "difficulty", "struggle", "patience", "sabr", "pain"],
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Verily, in the remembrance of Allah do hearts find rest.",
    reference: "Surah Ar-Ra'd 13:28",
    keywords: ["anxiety", "peace", "calm", "dhikr", "remembrance", "heart", "rest", "worry"],
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond that it can bear.",
    reference: "Surah Al-Baqarah 2:286",
    keywords: ["overwhelm", "burden", "capacity", "strength", "too much", "can't handle"],
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah - then He is sufficient for him.",
    reference: "Surah At-Talaq 65:3",
    keywords: ["trust", "tawakkul", "reliance", "fear", "scared", "alone", "sufficient"],
  },
  {
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    translation: "Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah.",
    reference: "Surah Az-Zumar 39:53",
    keywords: ["sin", "guilt", "shame", "forgiveness", "tawbah", "repentance", "mercy", "despair", "hope"],
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    reference: "Surah Al-Baqarah 2:153",
    keywords: ["patience", "sabr", "endurance", "waiting", "test", "trial"],
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    translation: "And when My servants ask you concerning Me - indeed I am near.",
    reference: "Surah Al-Baqarah 2:186",
    keywords: ["dua", "prayer", "lonely", "loneliness", "alone", "close", "near", "allah"],
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "And say, My Lord, increase me in knowledge.",
    reference: "Surah Ta-Ha 20:114",
    keywords: ["knowledge", "learning", "quran", "study", "understanding", "wisdom"],
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "So remember Me; I will remember you.",
    reference: "Surah Al-Baqarah 2:152",
    keywords: ["dhikr", "remembrance", "worship", "connection", "ibadah"],
  },
];

const HADITH_DATABASE: HadithEntry[] = [
  {
    text: "Wondrous is the affair of the believer, for there is good for him in every matter. If he is joyful, he is grateful and that is good for him. If he is harmed, he is patient and that is good for him.",
    source: "Sahih Muslim 2999",
    keywords: ["patience", "sabr", "gratitude", "shukr", "hardship", "test", "trial", "struggle"],
  },
  {
    text: "Allah does not look at your forms and possessions, but He looks at your hearts and your deeds.",
    source: "Sahih Muslim 2564",
    keywords: ["heart", "intention", "worth", "appearance", "self-worth", "comparison", "niyyah"],
  },
  {
    text: "Take advantage of five before five: your youth before your old age, your health before your illness, your wealth before your poverty, your free time before your busyness, and your life before your death.",
    source: "Shu'ab al-Iman (al-Bayhaqi) 10248",
    keywords: ["time", "youth", "health", "productivity", "purpose", "life", "motivation"],
  },
  {
    text: "The supplication of a Muslim for his brother in his absence will certainly be answered. Every time he makes a supplication for good for his brother, the angel appointed for this particular task says: Ameen! May it be for you too.",
    source: "Sahih Muslim 2733",
    keywords: ["dua", "prayer", "brother", "sister", "community", "supplication"],
  },
  {
    text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.",
    source: "Sahih al-Bukhari 6125",
    keywords: ["ease", "kindness", "gentleness", "mercy", "prophet", "sunnah", "difficulty"],
  },
  {
    text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: "Sahih al-Bukhari 6464",
    keywords: ["consistency", "deeds", "worship", "small", "ibadah", "overwhelm", "practice"],
  },
  {
    text: "Verily, with patience comes victory, with distress comes relief, and with hardship comes ease.",
    source: "Musnad Ahmad 2803",
    keywords: ["patience", "sabr", "victory", "relief", "hardship", "ease", "hope"],
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih al-Bukhari 13",
    keywords: ["faith", "iman", "brotherhood", "love", "community", "muslim"],
  },
  {
    text: "Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.",
    source: "Sahih Muslim 2699",
    keywords: ["knowledge", "learning", "study", "quran", "hadith", "education", "paradise"],
  },
  {
    text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
    source: "Sahih al-Bukhari 6114",
    keywords: ["anger", "strength", "self-control", "patience", "nafs", "emotion"],
  },
];

const CONCEPT_DATABASE: Array<{ concept: string; keywords: string[] }> = [
  { concept: "Tawakkul (trust in Allah) - placing reliance on Allah while taking appropriate action", keywords: ["trust", "tawakkul", "reliance", "fear", "control", "anxiety", "future"] },
  { concept: "Sabr (patience) - steadfastness through difficulty, knowing relief comes from Allah", keywords: ["patience", "sabr", "endure", "waiting", "hardship", "struggle"] },
  { concept: "Shukr (gratitude) - recognizing and appreciating Allah's blessings in all circumstances", keywords: ["gratitude", "shukr", "thankful", "blessing", "grateful"] },
  { concept: "Tawbah (repentance) - returning to Allah with sincerity, knowing His mercy exceeds all sin", keywords: ["repentance", "tawbah", "sin", "forgiveness", "guilt", "shame", "return"] },
  { concept: "Dhikr (remembrance) - calming the heart through conscious remembrance of Allah", keywords: ["dhikr", "remembrance", "peace", "calm", "anxiety", "heart", "rest"] },
  { concept: "Ihsan (excellence) - worshipping Allah as though you see Him, for He sees you", keywords: ["ihsan", "excellence", "worship", "sincerity", "mindfulness", "presence"] },
  { concept: "Qadr (divine decree) - trusting that Allah's plan encompasses what we cannot see", keywords: ["qadr", "destiny", "decree", "fate", "plan", "why", "purpose"] },
  { concept: "Istighfar (seeking forgiveness) - a means of relief, provision, and spiritual cleansing", keywords: ["istighfar", "forgiveness", "relief", "cleansing", "mistake", "sin"] },
];

// =============================================================================
// CONTEXT FETCHING
// =============================================================================

/**
 * Search local Quran/Hadith data for content relevant to the query.
 * Uses simple keyword overlap scoring.
 */
export async function fetchIslamicContext(
  query: string,
): Promise<IslamicContext> {
  const lower = query.toLowerCase();
  const queryWords = lower
    .replace(/[^\w\s']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const result: IslamicContext = {};

  // Score and find best matching verse
  let bestVerseScore = 0;
  let bestVerse: VerseEntry | undefined;

  for (const verse of VERSE_DATABASE) {
    let score = 0;
    for (const keyword of verse.keywords) {
      if (lower.includes(keyword)) {
        score += 2;
      }
      for (const word of queryWords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 1;
        }
      }
    }
    if (score > bestVerseScore) {
      bestVerseScore = score;
      bestVerse = verse;
    }
  }

  if (bestVerse && bestVerseScore >= 2) {
    result.relevantVerse = {
      arabic: bestVerse.arabic,
      translation: bestVerse.translation,
      reference: bestVerse.reference,
    };
  }

  // Score and find best matching hadith
  let bestHadithScore = 0;
  let bestHadith: HadithEntry | undefined;

  for (const hadith of HADITH_DATABASE) {
    let score = 0;
    for (const keyword of hadith.keywords) {
      if (lower.includes(keyword)) {
        score += 2;
      }
      for (const word of queryWords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 1;
        }
      }
    }
    if (score > bestHadithScore) {
      bestHadithScore = score;
      bestHadith = hadith;
    }
  }

  if (bestHadith && bestHadithScore >= 2) {
    result.relevantHadith = {
      text: bestHadith.text,
      source: bestHadith.source,
    };
  }

  // Score and find best matching concept
  let bestConceptScore = 0;
  let bestConcept: string | undefined;

  for (const entry of CONCEPT_DATABASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += 2;
      }
    }
    if (score > bestConceptScore) {
      bestConceptScore = score;
      bestConcept = entry.concept;
    }
  }

  if (bestConcept && bestConceptScore >= 2) {
    result.islamicConcept = bestConcept;
  }

  return result;
}
