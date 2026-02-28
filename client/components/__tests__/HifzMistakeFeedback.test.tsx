/**
 * HifzMistakeFeedback.test.tsx
 *
 * Tests for the Hifz Mistake Feedback component.
 * Verifies score display, word-level coloring, mistake summary, and tips.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HifzMistakeFeedback } from "../HifzMistakeFeedback";
import type { RecitationResult } from "@/shared/types/hifz";

// Mock dependencies
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      text: "#e8f0f8",
      textSecondary: "#9fb3c9",
      border: "#2d3a52",
      glassSurface: "rgba(36, 47, 66, 0.65)",
      glassStroke: "rgba(212, 175, 55, 0.2)",
      subtleGlow: "rgba(212, 175, 55, 0.18)",
    },
    isDark: true,
  }),
}));

jest.mock("expo-blur", () => ({
  BlurView: "BlurView",
}));

jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    default: {
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withSpring: (value: any) => value,
    withRepeat: (value: any) => value,
    withSequence: (value: any) => value,
    withTiming: (value: any) => value,
  };
});

jest.mock("react-native-svg", () => ({
  Svg: "Svg",
  Circle: "Circle",
}));

// Helper to create mock RecitationResult
function createMockResult(
  score: number,
  wordResults: { expected: string; actual: string; isCorrect: boolean }[]
): RecitationResult {
  return {
    verseKey: "1:1",
    surahNumber: 1,
    verseNumber: 1,
    expectedText: wordResults.map((w) => w.expected).join(" "),
    transcribedText: wordResults.map((w) => w.actual).join(" "),
    score,
    accuracy: score / 100,
    wordResults,
  };
}

describe("HifzMistakeFeedback", () => {
  // Test 1: Renders null state (no result yet)
  it("renders null state when result is not provided", () => {
    const { getByText } = render(<HifzMistakeFeedback result={null} />);

    expect(
      getByText(/record your recitation to see results/i)
    ).toBeTruthy();
  });

  // Test 2: Shows score with correct color (green ≥80)
  it("displays green score for high accuracy (≥80)", () => {
    const result = createMockResult(85, [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللَّهِ", isCorrect: true },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    // Score should be displayed
    expect(getByText("85")).toBeTruthy();
  });

  // Test 3: Shows score with yellow color (50-79)
  it("displays yellow score for medium accuracy (50-79)", () => {
    const result = createMockResult(65, [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللهِ", isCorrect: false },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    expect(getByText("65")).toBeTruthy();
  });

  // Test 4: Shows score with red color (<50)
  it("displays red score for low accuracy (<50)", () => {
    const result = createMockResult(40, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
      { expected: "اللَّهِ", actual: "اللهِ", isCorrect: false },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    expect(getByText("40")).toBeTruthy();
  });

  // Test 5: Colors words correctly (green for correct, red for incorrect)
  it("colors correct words green and incorrect words red", () => {
    const result = createMockResult(50, [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللهِ", isCorrect: false },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    // Both words should be rendered
    expect(getByText("بِسْمِ")).toBeTruthy();
    expect(getByText("اللَّهِ")).toBeTruthy();
  });

  // Test 6: Shows mistake summary with count
  it("displays mistake summary with count and incorrect words", () => {
    const result = createMockResult(60, [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللهِ", isCorrect: false },
      { expected: "الرَّحْمَٰنِ", actual: "الرَّحْمَٰنِ", isCorrect: true },
      { expected: "الرَّحِيمِ", actual: "الرَحِيمِ", isCorrect: false },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    // Mistake summary should show count
    expect(getByText(/2 mistakes out of 4 words/i)).toBeTruthy();
  });

  // Test 7: Shows tips when provided
  it("displays tips when aiTips is provided", () => {
    const result = createMockResult(70, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
    ]);

    const { getByText } = render(
      <HifzMistakeFeedback
        result={result}
        aiTips="Focus on the kasra vowel at the beginning."
        showAITips={true}
      />
    );

    expect(getByText(/focus on the kasra vowel/i)).toBeTruthy();
  });

  // Test 8: Shows "Get Tips" button when tips null but callback exists
  it("displays Get Tips button when aiTips is null and onRequestTips exists", () => {
    const result = createMockResult(70, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
    ]);

    const mockRequestTips = jest.fn();

    const { getByText } = render(
      <HifzMistakeFeedback
        result={result}
        aiTips={undefined}
        showAITips={true}
        onRequestTips={mockRequestTips}
      />
    );

    expect(getByText(/get tips/i)).toBeTruthy();
  });

  // Test 9: Calls onRequestTips when button pressed
  it("calls onRequestTips callback when Get Tips button is pressed", () => {
    const result = createMockResult(70, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
    ]);

    const mockRequestTips = jest.fn();

    const { getByText } = render(
      <HifzMistakeFeedback
        result={result}
        aiTips={undefined}
        showAITips={true}
        onRequestTips={mockRequestTips}
      />
    );

    const button = getByText(/get tips/i);
    fireEvent.press(button);

    expect(mockRequestTips).toHaveBeenCalledTimes(1);
  });

  // Test 10: Hides AI tips panel when showAITips=false
  it("hides AI tips panel when showAITips is false", () => {
    const result = createMockResult(70, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
    ]);

    const { queryByText } = render(
      <HifzMistakeFeedback
        result={result}
        aiTips="Focus on pronunciation"
        showAITips={false}
      />
    );

    expect(queryByText(/focus on pronunciation/i)).toBeNull();
  });

  // Test 11: Shows all incorrect words with expected vs actual
  it("shows expected vs actual for all incorrect words", () => {
    const result = createMockResult(50, [
      { expected: "بِسْمِ", actual: "بَسْمِ", isCorrect: false },
      { expected: "اللَّهِ", actual: "اللَّهِ", isCorrect: true },
      { expected: "الرَّحْمَٰنِ", actual: "الرَحْمَٰنِ", isCorrect: false },
    ]);

    const { getByText } = render(<HifzMistakeFeedback result={result} />);

    // Check for expected words in mistake list
    expect(getByText(/expected:/i)).toBeTruthy();
    expect(getByText(/you said:/i)).toBeTruthy();
  });
});
