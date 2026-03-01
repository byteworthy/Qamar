/**
 * Islamic Knowledge Search Service
 *
 * Full-text keyword search across Quran verses and Hadiths using seed data.
 * No external dependencies (no Qdrant, no Ollama) - pure in-memory search
 * with keyword extraction, Islamic concept mapping, and structured citations.
 *
 * This is the lightweight, always-available complement to the vector-based
 * rag-engine.ts. It works offline and without model downloads.
 */

import * as fs from "fs";
import * as path from "path";

// =============================================================================
// TYPES
// =============================================================================

export interface Citation {
  type: "quran" | "hadith";
  reference: string;
  arabic: string;
  english: string;
  score: number;
}

export interface SearchResult {
  citations: Citation[];
  concepts: string[];
  query: string;
}

interface VerseRecord {
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translationEn: string;
}

interface HadithRecord {
  id: string;
  collectionId: string;
  hadithNumber: number;
  narrator: string;
  textArabic: string;
  textEnglish: string;
  grade: string;
  chapter: string;
  reference: string;
}

interface SurahRecord {
  number: number;
  nameEnglish: string;
}

// =============================================================================
// ISLAMIC CONCEPT MAP
// =============================================================================

/**
 * Maps Arabic/Islamic terms and English concepts to canonical search terms.
 * When a user asks about "tawakkul", we also search for "trust", "reliance", etc.
 */
const CONCEPT_MAP: Record<string, { english: string[]; description: string }> =
  {
    sabr: {
      english: [
        "patience",
        "perseverance",
        "endurance",
        "steadfast",
        "patient",
        "bear",
        "endure",
      ],
      description:
        "Sabr (patience) - steadfastness through difficulty, knowing relief comes from Allah",
    },
    tawakkul: {
      english: ["trust", "reliance", "rely", "depend", "sufficient", "enough"],
      description:
        "Tawakkul (trust in Allah) - reliance on Allah while taking appropriate action",
    },
    shukr: {
      english: [
        "gratitude",
        "grateful",
        "thankful",
        "thanks",
        "blessing",
        "appreciate",
      ],
      description:
        "Shukr (gratitude) - recognizing and appreciating Allah's blessings",
    },
    tawbah: {
      english: [
        "repentance",
        "repent",
        "forgiveness",
        "forgive",
        "sin",
        "return",
        "guilt",
      ],
      description: "Tawbah (repentance) - returning to Allah with sincerity",
    },
    taqwa: {
      english: [
        "consciousness",
        "piety",
        "mindful",
        "awareness",
        "fear",
        "god-fearing",
      ],
      description:
        "Taqwa (God-consciousness) - awareness of Allah in all actions",
    },
    ihsan: {
      english: ["excellence", "beauty", "perfection", "worship", "sincerity"],
      description:
        "Ihsan (excellence) - worshipping Allah as though you see Him",
    },
    dhikr: {
      english: [
        "remembrance",
        "remember",
        "mention",
        "mindfulness",
        "meditation",
        "calm",
      ],
      description:
        "Dhikr (remembrance) - calming the heart through remembrance of Allah",
    },
    qadr: {
      english: [
        "destiny",
        "decree",
        "fate",
        "predestination",
        "plan",
        "purpose",
        "will",
      ],
      description:
        "Qadr (divine decree) - trusting Allah's plan encompasses what we cannot see",
    },
    istighfar: {
      english: [
        "forgiveness",
        "seeking forgiveness",
        "astaghfirullah",
        "cleansing",
        "relief",
      ],
      description:
        "Istighfar (seeking forgiveness) - a means of relief and spiritual cleansing",
    },
    rizq: {
      english: [
        "provision",
        "sustenance",
        "wealth",
        "money",
        "livelihood",
        "income",
      ],
      description: "Rizq (provision) - all sustenance comes from Allah",
    },
    dua: {
      english: ["supplication", "prayer", "ask", "request", "call", "invoke"],
      description: "Dua (supplication) - calling upon Allah directly",
    },
    iman: {
      english: ["faith", "belief", "believe", "conviction", "trust"],
      description:
        "Iman (faith) - belief in Allah, His messengers, books, angels, the Last Day, and divine decree",
    },
    husn_al_dhann: {
      english: ["good opinion", "optimism", "hope", "positive", "trust"],
      description:
        "Husn al-Dhann (good opinion of Allah) - maintaining hope in Allah's mercy and wisdom",
    },
    nafs: {
      english: ["soul", "self", "ego", "desires", "lower self", "temptation"],
      description:
        "Nafs (self/soul) - the inner self that must be trained and purified",
    },
    akhira: {
      english: [
        "hereafter",
        "afterlife",
        "next life",
        "paradise",
        "judgment",
        "eternal",
      ],
      description: "Akhira (hereafter) - the eternal life after death",
    },
  };

// Reverse map: english word -> islamic term(s)
const ENGLISH_TO_CONCEPT: Map<string, string[]> = new Map();
for (const [concept, { english }] of Object.entries(CONCEPT_MAP)) {
  for (const word of english) {
    const existing = ENGLISH_TO_CONCEPT.get(word) || [];
    existing.push(concept);
    ENGLISH_TO_CONCEPT.set(word, existing);
  }
}

// =============================================================================
// DATA LOADING
// =============================================================================

let verses: VerseRecord[] = [];
let hadiths: HadithRecord[] = [];
let surahMap: Map<number, string> = new Map();
let dataLoaded = false;

function ensureDataLoaded(): void {
  if (dataLoaded) return;

  const seedDir = path.resolve(process.cwd(), "shared", "seed-data");

  // Load surahs for reference formatting
  try {
    const surahsPath = path.join(seedDir, "surahs.json");
    if (fs.existsSync(surahsPath)) {
      const surahs: SurahRecord[] = JSON.parse(
        fs.readFileSync(surahsPath, "utf-8"),
      );
      surahMap = new Map(surahs.map((s) => [s.number, s.nameEnglish]));
    }
  } catch (err) {
    console.warn("[IslamicKnowledge] Failed to load surahs:", err);
  }

  // Load verses
  try {
    const versesPath = path.join(seedDir, "verses.json");
    if (fs.existsSync(versesPath)) {
      verses = JSON.parse(fs.readFileSync(versesPath, "utf-8"));
      console.log(`[IslamicKnowledge] Loaded ${verses.length} Quran verses`);
    }
  } catch (err) {
    console.warn("[IslamicKnowledge] Failed to load verses:", err);
  }

  // Load hadiths
  try {
    const hadithsPath = path.join(seedDir, "hadiths.json");
    if (fs.existsSync(hadithsPath)) {
      const raw = JSON.parse(fs.readFileSync(hadithsPath, "utf-8"));
      // hadiths.json has { collections: [...], hadiths: [...] }
      hadiths = Array.isArray(raw) ? raw : raw.hadiths || [];
      console.log(`[IslamicKnowledge] Loaded ${hadiths.length} hadiths`);
    }
  } catch (err) {
    console.warn("[IslamicKnowledge] Failed to load hadiths:", err);
  }

  dataLoaded = true;
}

// =============================================================================
// STOP WORDS & TEXT PROCESSING
// =============================================================================

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "and",
  "but",
  "or",
  "nor",
  "not",
  "so",
  "yet",
  "if",
  "when",
  "while",
  "how",
  "all",
  "any",
  "about",
  "up",
  "there",
  "their",
  "them",
  "they",
  "this",
  "that",
  "these",
  "those",
  "he",
  "she",
  "it",
  "his",
  "her",
  "its",
  "who",
  "whom",
  "which",
  "what",
  "where",
  "why",
  "you",
  "your",
  "we",
  "our",
  "i",
  "my",
  "me",
  "does",
  "tell",
  "know",
  "really",
  "mean",
  "means",
  "like",
  "just",
  "also",
  "very",
  "much",
  "more",
  "most",
  "some",
  "than",
  "then",
  "here",
  "now",
]);

/**
 * Extract meaningful search terms from a query.
 * Handles Islamic terms, expands concepts, removes stop words.
 */
function extractSearchTerms(query: string): {
  terms: string[];
  concepts: string[];
} {
  const lower = query.toLowerCase().replace(/[^\w\s'-]/g, "");
  const words = lower.split(/\s+/).filter((w) => w.length > 1);

  const detectedConcepts: Set<string> = new Set();
  const expandedTerms: Set<string> = new Set();

  for (const word of words) {
    // Check if word is an Islamic term
    if (CONCEPT_MAP[word]) {
      detectedConcepts.add(word);
      // Add all English synonyms
      for (const eng of CONCEPT_MAP[word].english) {
        expandedTerms.add(eng);
      }
      expandedTerms.add(word);
      continue;
    }

    // Check if word maps to an Islamic concept
    const mappedConcepts = ENGLISH_TO_CONCEPT.get(word);
    if (mappedConcepts) {
      for (const concept of mappedConcepts) {
        detectedConcepts.add(concept);
        for (const eng of CONCEPT_MAP[concept].english) {
          expandedTerms.add(eng);
        }
      }
    }

    // Add non-stop words
    if (!STOP_WORDS.has(word)) {
      expandedTerms.add(word);
    }
  }

  return {
    terms: Array.from(expandedTerms),
    concepts: Array.from(detectedConcepts),
  };
}

/**
 * Score how well a text matches the search terms.
 * Uses term frequency with bonus for exact phrase matches.
 */
function scoreText(text: string, terms: string[]): number {
  if (!text || terms.length === 0) return 0;

  const lower = text.toLowerCase();
  let score = 0;

  for (const term of terms) {
    // Exact word boundary match gets higher score
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
    const exactMatches = (lower.match(wordBoundaryRegex) || []).length;
    score += exactMatches * 3;

    // Partial/substring match gets lower score
    if (exactMatches === 0 && lower.includes(term)) {
      score += 1;
    }
  }

  // Normalize by text length to avoid bias toward long texts
  // But use a soft normalization so relevant long texts still rank well
  const lengthFactor = Math.log2(text.split(/\s+/).length + 1);
  return score / Math.max(lengthFactor, 1);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Search Quran verses by translation text.
 */
export function searchQuran(query: string, limit: number = 5): Citation[] {
  ensureDataLoaded();

  const { terms } = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const scored: { verse: VerseRecord; score: number }[] = [];

  for (const verse of verses) {
    if (!verse.translationEn) continue;
    const score = scoreText(verse.translationEn, terms);
    if (score > 0) {
      scored.push({ verse, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ verse, score }) => {
    const surahName =
      surahMap.get(verse.surahNumber) || `Surah ${verse.surahNumber}`;
    return {
      type: "quran" as const,
      reference: `${surahName} ${verse.surahNumber}:${verse.verseNumber}`,
      arabic: verse.arabicText,
      english: verse.translationEn,
      score: Math.round(score * 100) / 100,
    };
  });
}

/**
 * Search Hadith texts.
 */
export function searchHadith(query: string, limit: number = 5): Citation[] {
  ensureDataLoaded();

  const { terms } = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const scored: { hadith: HadithRecord; score: number }[] = [];

  for (const hadith of hadiths) {
    if (!hadith.textEnglish) continue;
    const score = scoreText(hadith.textEnglish, terms);
    if (score > 0) {
      scored.push({ hadith, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ hadith, score }) => ({
    type: "hadith" as const,
    reference:
      hadith.reference || `${hadith.collectionId} ${hadith.hadithNumber}`,
    arabic: hadith.textArabic || "",
    english: hadith.textEnglish,
    score: Math.round(score * 100) / 100,
  }));
}

/**
 * Combined search across Quran and Hadith.
 * Returns the top results from both sources, interleaved by relevance score.
 */
export function findRelevantContent(
  query: string,
  limit: number = 5,
): SearchResult {
  const { concepts } = extractSearchTerms(query);

  const quranResults = searchQuran(query, limit);
  const hadithResults = searchHadith(query, limit);

  // Merge and sort by score
  const all = [...quranResults, ...hadithResults];
  all.sort((a, b) => b.score - a.score);

  // Ensure diversity: at least 1 of each type if available
  const topResults: Citation[] = [];
  const hasQuran = quranResults.length > 0;
  const hasHadith = hadithResults.length > 0;

  if (hasQuran && hasHadith) {
    // Guarantee at least one of each
    const bestQuran = quranResults[0];
    const bestHadith = hadithResults[0];

    // Start with the top overall result
    if (all[0].type === "quran") {
      topResults.push(bestQuran);
      topResults.push(bestHadith);
    } else {
      topResults.push(bestHadith);
      topResults.push(bestQuran);
    }

    // Fill remaining slots from the merged list, avoiding duplicates
    const usedRefs = new Set(topResults.map((r) => r.reference));
    for (const item of all) {
      if (topResults.length >= limit) break;
      if (!usedRefs.has(item.reference)) {
        topResults.push(item);
        usedRefs.add(item.reference);
      }
    }
  } else {
    // Only one type available
    for (const item of all) {
      if (topResults.length >= limit) break;
      topResults.push(item);
    }
  }

  // Map detected concepts to their descriptions
  const conceptDescriptions = concepts
    .filter((c) => CONCEPT_MAP[c])
    .map((c) => CONCEPT_MAP[c].description);

  return {
    citations: topResults,
    concepts: conceptDescriptions,
    query,
  };
}

/**
 * Detect if a query is asking about Islamic knowledge.
 * More sophisticated than the basic keyword check in islamic-context.ts.
 */
export function isIslamicKnowledgeQuery(message: string): boolean {
  const { terms, concepts } = extractSearchTerms(message);

  // If we detected any Islamic concepts, it's an Islamic query
  if (concepts.length > 0) return true;

  // Check for Islamic-specific terms
  const islamicTerms = [
    "quran",
    "qur'an",
    "hadith",
    "sunnah",
    "surah",
    "ayah",
    "verse",
    "prophet",
    "muhammad",
    "allah",
    "islam",
    "muslim",
    "mosque",
    "masjid",
    "salah",
    "prayer",
    "fasting",
    "ramadan",
    "zakat",
    "hajj",
    "umrah",
    "halal",
    "haram",
    "fiqh",
    "fatwa",
    "imam",
    "scholar",
    "jannah",
    "jahannam",
    "angels",
    "judgment day",
  ];

  const lower = message.toLowerCase();
  return islamicTerms.some((term) => lower.includes(term));
}

/**
 * Get the total number of searchable documents.
 */
export function getKnowledgeBaseStats(): {
  verses: number;
  hadiths: number;
  concepts: number;
} {
  ensureDataLoaded();
  return {
    verses: verses.length,
    hadiths: hadiths.length,
    concepts: Object.keys(CONCEPT_MAP).length,
  };
}
