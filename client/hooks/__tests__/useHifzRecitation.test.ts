/**
 * useHifzRecitation Hook Tests
 *
 * Tests recitation flow: record → transcribe (STT) → check → rate → update store
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useHifzRecitation } from "../useHifzRecitation";
import { useHifzStore } from "../../stores/hifz-store";
import { checkRecitation } from "../../services/hifz/recitation-checker";
import type { RecitationResult } from "../../../shared/types/hifz";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock dependencies
jest.mock("../../stores/hifz-store");
jest.mock("../../services/hifz/recitation-checker");

const mockUseHifzStore = useHifzStore as jest.MockedFunction<
  typeof useHifzStore
>;
const mockCheckRecitation = checkRecitation as jest.MockedFunction<
  typeof checkRecitation
>;

describe("useHifzRecitation", () => {
  const mockUpdateAfterRecitation = jest.fn();
  const mockGetVerseState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store
    mockUseHifzStore.mockReturnValue({
      updateAfterRecitation: mockUpdateAfterRecitation,
      getVerseState: mockGetVerseState,
      memorizedVerses: new Map(),
      juzProgress: [],
      isLoading: false,
      lastSyncedAt: null,
      markVerseAsMemorized: jest.fn(),
      getReviewQueue: jest.fn(),
      getDueVerseCount: jest.fn(),
      getJuzProgress: jest.fn(),
      calculateJuzProgress: jest.fn(),
      reset: jest.fn(),
    } as any);
  });

  describe("Initial state", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useHifzRecitation(1, 1));

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.transcription).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("Recording flow", () => {
    it("should start recording", async () => {
      const { result } = renderHook(() => useHifzRecitation(1, 1));

      await act(async () => {
        await result.current.startRecitation();
      });

      expect(result.current.isRecording).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should stop recording and process transcription", async () => {
      const mockResult: RecitationResult = {
        verseKey: "1:1",
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transcribedText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        score: 100,
        accuracy: 1.0,
        wordResults: [
          { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
          { expected: "ٱللَّهِ", actual: "ٱللَّهِ", isCorrect: true },
          { expected: "ٱلرَّحْمَٰنِ", actual: "ٱلرَّحْمَٰنِ", isCorrect: true },
          { expected: "ٱلرَّحِيمِ", actual: "ٱلرَّحِيمِ", isCorrect: true },
        ],
      };

      mockCheckRecitation.mockReturnValue(mockResult);

      const { result } = renderHook(() => useHifzRecitation(1, 1));

      // Start recording
      await act(async () => {
        await result.current.startRecitation();
      });

      // Stop recording
      await act(async () => {
        await result.current.stopRecitation();
      });

      await waitFor(() => {
        expect(result.current.isRecording).toBe(false);
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.result).toEqual(mockResult);
        expect(mockCheckRecitation).toHaveBeenCalledWith(
          1,
          1,
          expect.any(String),
          expect.any(String),
        );
      });
    });

    it("should handle recording errors gracefully", async () => {
      mockCheckRecitation.mockImplementation(() => {
        throw new Error("STT service unavailable");
      });

      const { result } = renderHook(() => useHifzRecitation(1, 1));

      await act(async () => {
        await result.current.startRecitation();
      });

      await act(async () => {
        await result.current.stopRecitation();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isProcessing).toBe(false);
      });
    });
  });

  describe("Rating and saving", () => {
    it("should save rating and update store", async () => {
      const mockResult: RecitationResult = {
        verseKey: "1:1",
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transcribedText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      };

      mockCheckRecitation.mockReturnValue(mockResult);

      const { result } = renderHook(() => useHifzRecitation(1, 1));

      // Complete a recitation
      await act(async () => {
        await result.current.startRecitation();
      });

      await act(async () => {
        await result.current.stopRecitation();
      });

      // Rate the recitation
      await act(async () => {
        result.current.rateAndSave("good");
      });

      await waitFor(() => {
        expect(mockUpdateAfterRecitation).toHaveBeenCalledWith(
          1,
          1,
          "good",
          [],
        );
      });
    });

    it("should include mistakes when rating", async () => {
      const mockResult: RecitationResult = {
        verseKey: "1:1",
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transcribedText: "بِسْمِ ٱللَّهِ الرحمن الرحيم",
        score: 50,
        accuracy: 0.5,
        wordResults: [
          { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
          { expected: "ٱللَّهِ", actual: "ٱللَّهِ", isCorrect: true },
          { expected: "ٱلرَّحْمَٰنِ", actual: "الرحمن", isCorrect: false },
          { expected: "ٱلرَّحِيمِ", actual: "الرحيم", isCorrect: false },
        ],
      };

      mockCheckRecitation.mockReturnValue(mockResult);

      const { result } = renderHook(() => useHifzRecitation(1, 1));

      await act(async () => {
        await result.current.startRecitation();
        await result.current.stopRecitation();
      });

      await act(async () => {
        result.current.rateAndSave("again");
      });

      await waitFor(() => {
        expect(mockUpdateAfterRecitation).toHaveBeenCalledWith(1, 1, "again", [
          "الرحمن",
          "الرحيم",
        ]);
      });
    });

    it("should not allow rating without a result", () => {
      const { result } = renderHook(() => useHifzRecitation(1, 1));

      act(() => {
        result.current.rateAndSave("good");
      });

      expect(mockUpdateAfterRecitation).not.toHaveBeenCalled();
    });
  });

  describe("Reset", () => {
    it("should reset all state", async () => {
      const mockResult: RecitationResult = {
        verseKey: "1:1",
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "test",
        transcribedText: "test",
        score: 100,
        accuracy: 1.0,
        wordResults: [],
      };

      mockCheckRecitation.mockReturnValue(mockResult);

      const { result } = renderHook(() => useHifzRecitation(1, 1));

      await act(async () => {
        await result.current.startRecitation();
        await result.current.stopRecitation();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.transcription).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
