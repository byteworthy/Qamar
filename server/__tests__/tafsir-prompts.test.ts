import { describe, test, expect } from "@jest/globals";
import { buildTafsirPrompt } from "../services/tafsir-prompts";

describe("buildTafsirPrompt", () => {
  test("builds system prompt with verse context and classical sources", () => {
    const prompt = buildTafsirPrompt({
      surahNumber: 1,
      surahName: "Al-Fatihah",
      verseNumber: 1,
      arabicText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation:
        "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    });

    expect(prompt).toContain("surah Al-Fatihah");
    expect(prompt).toContain("1:1");
    expect(prompt).toContain("Ibn Kathir");
    expect(prompt).toContain("Al-Tabari");
    expect(prompt).toContain("practical reflection");
  });

  test("instructs to format as structured JSON", () => {
    const prompt = buildTafsirPrompt({
      surahNumber: 2,
      surahName: "Al-Baqarah",
      verseNumber: 255,
      arabicText: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ",
      translation: "Allah - there is no deity except Him",
    });

    expect(prompt).toContain("JSON");
    expect(prompt).toContain("context");
    expect(prompt).toContain("keyTerms");
    expect(prompt).toContain("scholarlyViews");
  });
});
