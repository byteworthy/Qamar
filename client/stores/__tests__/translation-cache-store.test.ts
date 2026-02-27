/**
 * Unit tests for Translation Cache Store
 */

import { renderHook, act } from "@testing-library/react-native";
import { useTranslationCache } from "../translation-cache-store";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("TranslationCache Store", () => {
  beforeEach(() => {
    act(() => {
      useTranslationCache.setState({ cache: {} });
    });
  });

  it("should start with empty cache", () => {
    const { result } = renderHook(() => useTranslationCache());
    expect(result.current.getCacheSize()).toBe(0);
  });

  it("should add an entry to cache", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "hello",
        translatedText: "مرحبا",
        from: "en",
        to: "ar",
        transliteration: "marhaba",
      });
    });

    expect(result.current.getCacheSize()).toBe(1);
  });

  it("should look up a cached entry", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "hello",
        translatedText: "مرحبا",
        from: "en",
        to: "ar",
        transliteration: "marhaba",
      });
    });

    const cached = result.current.lookupCache("hello", "en", "ar");
    expect(cached).not.toBeNull();
    expect(cached!.translatedText).toBe("مرحبا");
    expect(cached!.transliteration).toBe("marhaba");
  });

  it("should return null for cache miss", () => {
    const { result } = renderHook(() => useTranslationCache());
    const cached = result.current.lookupCache("goodbye", "en", "ar");
    expect(cached).toBeNull();
  });

  it("should be case-insensitive for lookup", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "Hello",
        translatedText: "مرحبا",
        from: "en",
        to: "ar",
        transliteration: "marhaba",
      });
    });

    const cached = result.current.lookupCache("hello", "en", "ar");
    expect(cached).not.toBeNull();
  });

  it("should distinguish direction (en→ar vs ar→en)", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "hello",
        translatedText: "مرحبا",
        from: "en",
        to: "ar",
        transliteration: "marhaba",
      });
    });

    const forward = result.current.lookupCache("hello", "en", "ar");
    const reverse = result.current.lookupCache("hello", "ar", "en");
    expect(forward).not.toBeNull();
    expect(reverse).toBeNull();
  });

  it("should clear cache", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "hello",
        translatedText: "مرحبا",
        from: "en",
        to: "ar",
        transliteration: null,
      });
      result.current.addToCache({
        sourceText: "goodbye",
        translatedText: "وداعا",
        from: "en",
        to: "ar",
        transliteration: null,
      });
    });

    expect(result.current.getCacheSize()).toBe(2);

    act(() => {
      result.current.clearCache();
    });

    expect(result.current.getCacheSize()).toBe(0);
  });

  it("should handle null transliteration", () => {
    const { result } = renderHook(() => useTranslationCache());

    act(() => {
      result.current.addToCache({
        sourceText: "مرحبا",
        translatedText: "hello",
        from: "ar",
        to: "en",
        transliteration: null,
      });
    });

    const cached = result.current.lookupCache("مرحبا", "ar", "en");
    expect(cached!.transliteration).toBeNull();
  });
});
