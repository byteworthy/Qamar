/**
 * Unit tests for Travel Favorites Store
 */

import { renderHook, act } from "@testing-library/react-native";
import { useTravelFavorites } from "../travel-favorites-store";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("TravelFavorites Store", () => {
  beforeEach(() => {
    act(() => {
      useTravelFavorites.setState({ favorites: [] });
    });
  });

  it("should start with empty favorites", () => {
    const { result } = renderHook(() => useTravelFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("should add a favorite", () => {
    const { result } = renderHook(() => useTravelFavorites());

    act(() => {
      result.current.toggleFavorite("greetings-1");
    });

    expect(result.current.favorites).toEqual(["greetings-1"]);
  });

  it("should remove a favorite when toggled again", () => {
    const { result } = renderHook(() => useTravelFavorites());

    act(() => {
      result.current.toggleFavorite("greetings-1");
    });
    act(() => {
      result.current.toggleFavorite("greetings-1");
    });

    expect(result.current.favorites).toEqual([]);
  });

  it("should track multiple favorites", () => {
    const { result } = renderHook(() => useTravelFavorites());

    act(() => {
      result.current.toggleFavorite("greetings-1");
      result.current.toggleFavorite("airport-2");
      result.current.toggleFavorite("hotel-3");
    });

    expect(result.current.favorites).toHaveLength(3);
    expect(result.current.favorites).toContain("greetings-1");
    expect(result.current.favorites).toContain("airport-2");
    expect(result.current.favorites).toContain("hotel-3");
  });

  it("should report isFavorite correctly", () => {
    const { result } = renderHook(() => useTravelFavorites());

    act(() => {
      result.current.toggleFavorite("greetings-1");
    });

    expect(result.current.isFavorite("greetings-1")).toBe(true);
    expect(result.current.isFavorite("greetings-2")).toBe(false);
  });
});
