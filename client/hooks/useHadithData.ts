import { useQuery } from "@tanstack/react-query";
import { getOfflineDatabase } from "../lib/offline-database";
import type { Hadith as SchemaHadith } from "../../shared/offline-schema";

// ============================================================================
// TYPES
// ============================================================================

export interface HadithCollection {
  id: string;
  name: string;
  nameArabic: string;
  compiler: string;
  description: string;
  totalHadiths: number;
}

export interface Hadith {
  id: string;
  collection: string;
  bookNumber: number;
  hadithNumber: number;
  narrator: string;
  textArabic: string;
  textEnglish: string;
  grade: "Sahih" | "Hasan" | "Da'if";
  topics: string[];
}

// ============================================================================
// COLLECTION METADATA (static - not stored in offline DB)
// ============================================================================

const MOCK_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    nameArabic: "صحيح البخاري",
    compiler: "Imam Muhammad al-Bukhari",
    description:
      "The most authentic collection of hadith, compiled by Imam Bukhari over 16 years from over 600,000 narrations.",
    totalHadiths: 7563,
  },
  {
    id: "muslim",
    name: "Sahih Muslim",
    nameArabic: "صحيح مسلم",
    compiler: "Imam Muslim ibn al-Hajjaj",
    description:
      "The second most authentic hadith collection, known for its strict methodology and organization.",
    totalHadiths: 7500,
  },
  {
    id: "tirmidhi",
    name: "Jami at-Tirmidhi",
    nameArabic: "جامع الترمذي",
    compiler: "Imam Abu Isa at-Tirmidhi",
    description:
      "A comprehensive collection notable for grading each hadith and including jurisprudential commentary.",
    totalHadiths: 3956,
  },
  {
    id: "abudawud",
    name: "Sunan Abu Dawud",
    nameArabic: "سنن أبي داود",
    compiler: "Imam Abu Dawud as-Sijistani",
    description:
      "A major collection focused on hadiths of legal rulings, compiled from 500,000 narrations.",
    totalHadiths: 5274,
  },
  {
    id: "nasai",
    name: "Sunan an-Nasa'i",
    nameArabic: "سنن النسائي",
    compiler: "Imam Ahmad an-Nasa'i",
    description:
      "Known for its strict grading criteria, considered among the most reliable of the six collections.",
    totalHadiths: 5761,
  },
  {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    nameArabic: "سنن ابن ماجه",
    compiler: "Imam Ibn Majah al-Qazwini",
    description:
      "The sixth of the canonical hadith collections, containing unique narrations not found in the other five.",
    totalHadiths: 4341,
  },
];

const COLLECTION_IDS = MOCK_COLLECTIONS.map((c) => c.id);

// ============================================================================
// MAPPER: offline schema -> hook interface
// ============================================================================

function mapGrade(grade?: string): "Sahih" | "Hasan" | "Da'if" {
  if (!grade) return "Sahih";
  const lower = grade.toLowerCase();
  if (lower === "hasan") return "Hasan";
  if (lower === "daif" || lower === "mawdu") return "Da'if";
  return "Sahih";
}

function mapHadith(h: SchemaHadith): Hadith {
  return {
    id: String(h.id),
    collection: h.collection,
    bookNumber: h.book_number ?? 0,
    hadithNumber: h.hadith_number ?? 0,
    narrator: h.narrator ?? "",
    textArabic: h.arabic_text,
    textEnglish: h.translation_en,
    grade: mapGrade(h.grade),
    topics: [],
  };
}

// ============================================================================
// DATA FUNCTIONS (offline database)
// ============================================================================

async function fetchCollections(): Promise<HadithCollection[]> {
  return MOCK_COLLECTIONS;
}

async function fetchHadiths(collection: string): Promise<Hadith[]> {
  const db = getOfflineDatabase();
  if (db.isReady()) {
    const rows = await db.getHadithsByCollection(collection);
    return rows.map(mapHadith);
  }
  return [];
}

async function fetchAllHadiths(): Promise<Hadith[]> {
  const db = getOfflineDatabase();
  if (!db.isReady()) return [];
  const results: Hadith[] = [];
  for (const col of COLLECTION_IDS) {
    const rows = await db.getHadithsByCollection(col);
    results.push(...rows.map(mapHadith));
  }
  return results;
}

async function searchHadiths(query: string): Promise<Hadith[]> {
  const all = await fetchAllHadiths();
  const q = query.toLowerCase();
  return all.filter(
    (h) =>
      h.textArabic.includes(query) ||
      h.textEnglish.toLowerCase().includes(q) ||
      h.narrator.toLowerCase().includes(q)
  );
}

async function fetchDailyHadith(): Promise<Hadith> {
  const all = await fetchAllHadiths();
  if (all.length === 0) {
    throw new Error("No hadiths available in offline database");
  }
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return all[dayOfYear % all.length];
}

async function fetchHadithById(id: string): Promise<Hadith | undefined> {
  const db = getOfflineDatabase();
  if (db.isReady()) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      const row = await db.getHadith(numId);
      if (row) return mapHadith(row);
    }
  }
  return undefined;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Fetches the list of all hadith collections
 */
export function useHadithCollections() {
  return useQuery({
    queryKey: ["hadith", "collections"],
    queryFn: fetchCollections,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetches all hadiths for a specific collection
 */
export function useHadiths(collection: string) {
  return useQuery({
    queryKey: ["hadith", "list", collection],
    queryFn: () => fetchHadiths(collection),
    enabled: collection.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Searches hadiths by text (Arabic, English, or narrator)
 */
export function useHadithSearch(query: string) {
  return useQuery({
    queryKey: ["hadith", "search", query],
    queryFn: () => searchHadiths(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetches the daily hadith (rotates based on day of year)
 */
export function useDailyHadith() {
  return useQuery({
    queryKey: ["hadith", "daily"],
    queryFn: fetchDailyHadith,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetches a single hadith by ID
 */
export function useHadithById(id: string) {
  return useQuery({
    queryKey: ["hadith", "detail", id],
    queryFn: () => fetchHadithById(id),
    enabled: id.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
