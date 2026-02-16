/**
 * Translation Service
 *
 * Provides free translation using two APIs:
 * - Primary: MyMemory (50,000 chars/day, no API key)
 * - Fallback: Google Translate free endpoint (500K chars/month)
 *
 * Also provides basic Arabic-to-Latin transliteration.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TranslationResult {
  translatedText: string;
  source: "mymemory" | "google";
  detectedLanguage?: string;
}

// =============================================================================
// ARABIC TRANSLITERATION MAP
// =============================================================================

const ARABIC_TO_LATIN: Record<string, string> = {
  // Basic letters
  "ا": "a",
  "ب": "b",
  "ت": "t",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "dh",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ظ": "z",
  "ع": "'",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "و": "w",
  "ي": "y",

  // Hamza forms
  "ء": "'",
  "أ": "a",
  "إ": "i",
  "ؤ": "'",
  "ئ": "'",
  "آ": "aa",

  // Taa marbuta and alef maqsura
  "ة": "h",
  "ى": "a",

  // Vowel marks (diacritics)
  "\u064E": "a",   // fatha
  "\u064F": "u",   // damma
  "\u0650": "i",   // kasra
  "\u064B": "an",  // tanwin fatha
  "\u064C": "un",  // tanwin damma
  "\u064D": "in",  // tanwin kasra
  "\u0651": "",    // shadda (doubling handled below)
  "\u0652": "",    // sukun (no vowel)

  // Lam-alef ligatures
  "لا": "la",
  "لأ": "la",
  "لإ": "li",
  "لآ": "laa",

  // Tatweel (kashida)
  "\u0640": "",
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Translate text using MyMemory (primary) with Google Translate fallback.
 * Throws if both services fail.
 */
export async function translateText(
  text: string,
  from: string,
  to: string,
): Promise<TranslationResult> {
  // Try MyMemory first
  const myMemoryResult = await tryMyMemory(text, from, to);
  if (myMemoryResult) {
    return myMemoryResult;
  }

  // Fall back to Google Translate
  const googleResult = await tryGoogleTranslate(text, from, to);
  if (googleResult) {
    return googleResult;
  }

  throw new Error("Translation failed: both MyMemory and Google Translate returned errors");
}

/**
 * Basic Arabic-to-Latin transliteration using character mapping.
 * Best-effort approximation, not scholarly transliteration.
 */
export function transliterateArabic(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    // Check for two-character ligatures first (lam-alef combinations)
    if (i + 1 < text.length) {
      const pair = text[i] + text[i + 1];
      if (ARABIC_TO_LATIN[pair] !== undefined) {
        result += ARABIC_TO_LATIN[pair];
        i += 2;
        continue;
      }
    }

    const char = text[i];

    // Handle shadda (doubling): repeat the previous consonant
    if (char === "\u0651" && result.length > 0) {
      result += result[result.length - 1];
      i++;
      continue;
    }

    if (ARABIC_TO_LATIN[char] !== undefined) {
      result += ARABIC_TO_LATIN[char];
    } else {
      // Pass through non-Arabic characters (spaces, punctuation, numbers)
      result += char;
    }

    i++;
  }

  return result;
}

// =============================================================================
// INTERNAL: MyMemory API
// =============================================================================

async function tryMyMemory(
  text: string,
  from: string,
  to: string,
): Promise<TranslationResult | null> {
  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${from}|${to}`);

    const response = await fetch(url.toString());
    if (response.status !== 200) {
      return null;
    }

    const json = await response.json();
    const translatedText = json?.responseData?.translatedText;
    if (!translatedText) {
      return null;
    }

    return {
      translatedText,
      source: "mymemory",
    };
  } catch {
    return null;
  }
}

// =============================================================================
// INTERNAL: Google Translate (free tier)
// =============================================================================

async function tryGoogleTranslate(
  text: string,
  from: string,
  to: string,
): Promise<TranslationResult | null> {
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", from);
    url.searchParams.set("tl", to);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const response = await fetch(url.toString());
    if (response.status !== 200) {
      return null;
    }

    const json = await response.json();
    if (!Array.isArray(json) || !Array.isArray(json[0])) {
      return null;
    }

    const translatedText = json[0]
      .map((segment: unknown[]) => segment[0])
      .join("");

    if (!translatedText) {
      return null;
    }

    return {
      translatedText,
      source: "google",
      detectedLanguage: json[2] ?? undefined,
    };
  } catch {
    return null;
  }
}
