import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "../HomeScreen";

jest.mock("@tanstack/react-query");
jest.mock("@react-native-async-storage/async-storage");

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
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AsyncStorage defaults
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === "@noor_user_name") return Promise.resolve("Aisha");
      if (key === "@noor_journey_stats") {
        return Promise.resolve(
          JSON.stringify({
            totalReflections: 5,
            currentStreak: 3,
            lastReflectionDate: new Date().toISOString(),
          }),
        );
      }
      return Promise.resolve(null);
    });
  });

  describe("Greeting and User Name", () => {
    it("should display greeting with user name", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Salaam,")).toBeTruthy();
        expect(screen.getByText(/Aisha/i)).toBeTruthy();
      });
    });

    it("should have greeting button with accessibility label", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        const greeting = screen.getByLabelText(/Greeting: Salaam, Aisha/i);
        expect(greeting).toBeTruthy();
      });
    });
  });

  describe("Journey Progress Card", () => {
    it("should display journey level based on total reflections", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        // With 5 reflections, should be at "Growing" level (3-9 reflections)
        expect(screen.getByText("Growing")).toBeTruthy();
        expect(screen.getByText("🌿")).toBeTruthy();
        expect(screen.getByText("5")).toBeTruthy();
        expect(screen.getByText("reflections")).toBeTruthy();
      });
    });

    it("should display current streak when streak > 0", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("🔥 3 day streak")).toBeTruthy();
      });
    });
  });

  describe("Module Cards Navigation", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);
    });

    it("should navigate to ThoughtCapture when Reflection card pressed", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        const reflectionCard = screen.getByText("Reflection");
        expect(reflectionCard).toBeTruthy();
      });

      const reflectionCard = screen.getByText("Reflection");
      fireEvent.press(reflectionCard.parent!);

      expect(mockNavigate).toHaveBeenCalledWith("ThoughtCapture");
    });

    it("should display all module cards", async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Reflection")).toBeTruthy();
        expect(screen.getByText("Calming Practice")).toBeTruthy();
        expect(screen.getByText("Dua")).toBeTruthy();
        expect(screen.getByText("Insights")).toBeTruthy();
      });
    });
  });

  describe("Upgrade Button - Free Tier", () => {
    it("should show upgrade button for free users", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Upgrade to Noor Plus")).toBeTruthy();
      });
    });

    it("should navigate to Pricing when upgrade button pressed", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        const upgradeButton = screen.getByLabelText("Upgrade to Noor Plus");
        fireEvent.press(upgradeButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith("Pricing");
    });
  });

  describe("Paid Tier", () => {
    it("should NOT show upgrade button for paid users", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "active", planName: "Plus" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText("Salaam,")).toBeTruthy();
      });

      // Verify upgrade button is NOT present
      expect(screen.queryByText("Upgrade to Noor Plus")).toBeNull();
    });
  });

  describe("Loading State", () => {
    it("should render without crashing during loading", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      // Should render without errors
      expect(screen).toBeTruthy();
    });
  });

  describe("Daily Anchor", () => {
    it("should display subtitle text", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText("What's on your mind today?")).toBeTruthy();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible labels on interactive elements", async () => {
      mockUseQuery.mockReturnValue({
        data: { status: "free", planName: "Free" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<HomeScreen />);

      await waitFor(() => {
        const greeting = screen.getByLabelText(/Greeting: Salaam/i);
        expect(greeting).toBeTruthy();

        const upgradeButton = screen.getByLabelText("Upgrade to Noor Plus");
        expect(upgradeButton).toBeTruthy();
      });
    });
  });
});
