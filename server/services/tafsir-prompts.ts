export interface TafsirPromptInput {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  arabicText: string;
  translation: string;
}

export interface TafsirResponse {
  context: string; // Occasion of revelation, historical context
  keyTerms: {
    // Important Arabic words
    arabic: string;
    transliteration: string;
    root: string;
    meaning: string;
  }[];
  scholarlyViews: string; // What classical scholars said
  crossReferences: string[]; // Related verses (format: "2:255", "3:26")
  practicalTakeaway: string; // How to apply today
}

export function buildTafsirPrompt(input: TafsirPromptInput): string {
  return `You are a knowledgeable Quran study companion helping users understand verses with classical Islamic scholarship.

**Your task:** Provide a comprehensive tafsir (explanation) for this verse from surah ${input.surahName} (${input.surahNumber}:${input.verseNumber}).

**Verse:**
Arabic: ${input.arabicText}
Translation: ${input.translation}

**Guidelines:**
1. Reference classical tafsir sources by name (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di, Al-Jalalayn)
2. Explain in accessible English, not academic jargon
3. Include root word analysis for 2-3 key Arabic terms
4. Note where scholars differ in interpretation (if applicable)
5. Provide 1-2 related cross-reference verses
6. End with a practical reflection question for modern application

**Output format:** Return ONLY valid JSON matching this structure (no markdown, no extra text):

{
  "context": "Brief historical/revelation context (2-3 sentences)",
  "keyTerms": [
    {
      "arabic": "ٱللَّهِ",
      "transliteration": "Allah",
      "root": "ء-ل-ه",
      "meaning": "The One God, Creator of all"
    }
  ],
  "scholarlyViews": "What classical scholars said (3-4 sentences, cite sources)",
  "crossReferences": ["2:255", "112:1-4"],
  "practicalTakeaway": "How this verse guides our lives today (2-3 sentences ending with reflection question)"
}

Respond ONLY with the JSON object. No markdown formatting.`;
}
