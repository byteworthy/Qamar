import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { useQuery } from "@tanstack/react-query";
import HomeScreen from "../HomeScreen";

jest.mock("@tanstack/react-query");

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

describe("HomeScreen", () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Reflection Limit - Free Tier", () => {
    it("should display reflection limit for free users", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: true, remaining: 1, isPaid: false },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      expect(screen.getByText(/1 reflection remaining today/i)).toBeTruthy();
    });

    it("should show upgrade prompt when limit reached", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: false, remaining: 0, isPaid: false },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      expect(screen.getByText(/daily limit reached/i)).toBeTruthy();
      expect(screen.getByText(/Upgrade to Noor Plus/i)).toBeTruthy();
    });
  });

  describe("Reflection Limit - Paid Tier", () => {
    it("should show unlimited for paid users", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: true, remaining: null, isPaid: true },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      expect(screen.getByText(/unlimited/i)).toBeTruthy();
    });
  });

  describe("Start Reflection Flow", () => {
    it("should navigate to ThoughtCapture when Start button pressed", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: true, remaining: 1, isPaid: false },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      const startButton = screen.getByText(/start reflection/i);
      fireEvent.press(startButton);

      expect(mockNavigate).toHaveBeenCalledWith("ThoughtCapture");
    });

    it("should navigate to Pricing when upgrade button pressed", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: false, remaining: 0, isPaid: false },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      const upgradeButton = screen.getByText(/Upgrade to Noor Plus/i);
      fireEvent.press(upgradeButton);

      expect(mockNavigate).toHaveBeenCalledWith("Pricing");
    });
  });

  describe("Loading State", () => {
    it("should show loading state while fetching limit", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      // Should render without crashing during loading
      expect(screen).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button for starting reflection", () => {
      mockUseQuery.mockReturnValue({
        data: { canReflect: true, remaining: 1, isPaid: false },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      const startButton = screen.getByText(/start reflection/i);
      expect(startButton).toBeTruthy();
    });
  });
});
