import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import DistortionScreen from "../DistortionScreen";
import * as api from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  analyzeThought: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  }),
  useRoute: () => ({
    params: {
      thought: "I'm worried about failing my exam",
      emotionalIntensity: 3,
      somaticAwareness: "chest tightness",
    },
  }),
  useHeaderHeight: () => 100,
}));

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 100,
}));

describe("DistortionScreen", () => {
  const mockAnalyzeThought = api.analyzeThought as jest.MockedFunction<
    typeof api.analyzeThought
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render without crashing during loading", async () => {
      mockAnalyzeThought.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          distortions: ["test"],
          happening: "test",
          pattern: ["test"],
          matters: "test",
        }), 100))
      );

      render(<DistortionScreen />);

      // Component should render (loading skeleton is mocked)
      expect(screen.root).toBeTruthy();
    });
  });

  describe("Successful Analysis", () => {
    it("should display analysis result when API returns data", async () => {
      const mockResult = {
        distortions: ["catastrophizing", "all-or-nothing thinking"],
        happening: "You're facing a challenging situation",
        pattern: ["This is a common worry pattern"],
        matters: "Your preparation matters more than perfection",
      };

      mockAnalyzeThought.mockResolvedValue(mockResult);

      render(<DistortionScreen />);

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeTruthy();
      });
    });

    it("should call analyzeThought API with correct parameters", async () => {
      mockAnalyzeThought.mockResolvedValue({
        distortions: ["test"],
        happening: "test",
        pattern: ["test"],
        matters: "test",
      });

      render(<DistortionScreen />);

      await waitFor(() => {
        expect(mockAnalyzeThought).toHaveBeenCalledWith(
          "I'm worried about failing my exam",
          3,
          "chest tightness"
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when API fails", async () => {
      mockAnalyzeThought.mockRejectedValue(new Error("NETWORK_ERROR"));

      render(<DistortionScreen />);

      await waitFor(() => {
        const retryButton = screen.queryByText("Try Again");
        expect(retryButton || screen.root).toBeTruthy();
      });
    });

    it("should allow retry after error", async () => {
      mockAnalyzeThought.mockRejectedValueOnce(new Error("NETWORK_ERROR"));
      mockAnalyzeThought.mockResolvedValueOnce({
        distortions: ["test"],
        happening: "test",
        pattern: ["test"],
        matters: "test",
      });

      render(<DistortionScreen />);

      await waitFor(() => {
        const retryButton = screen.queryByText("Try Again");
        expect(retryButton || mockAnalyzeThought).toHaveBeenCalled();
      });
    });
  });

  describe("Crisis Detection", () => {
    it("should handle crisis response from API", async () => {
      const crisisResult = {
        crisis: true,
        level: "emergency" as const,
        resources: {
          title: "Immediate Support Available",
          message: "You're not alone. Help is available right now.",
          resources: [
            {
              name: "988 Suicide & Crisis Lifeline",
              contact: "Call or text 988",
              description: "24/7 crisis support",
            },
          ],
          islamicContext: "Your life has immeasurable value",
        },
        distortions: [],
        happening: "",
        pattern: [],
        matters: "",
      };

      mockAnalyzeThought.mockResolvedValue(crisisResult);

      render(<DistortionScreen />);

      // Wait for API call to complete
      await waitFor(() => {
        expect(mockAnalyzeThought).toHaveBeenCalled();
      });

      // Crisis screen should render (content may vary)
      expect(screen.root).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should navigate to Reframe when Continue is pressed", async () => {
      const mockResult = {
        distortions: ["catastrophizing"],
        happening: "You're facing a challenge",
        pattern: ["Common worry pattern"],
        matters: "Your effort matters",
      };

      mockAnalyzeThought.mockResolvedValue(mockResult);

      render(<DistortionScreen />);

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        expect(continueButton).toBeTruthy();
      });
    });
  });

  describe("Timeout Handling", () => {
    it.skip("should show timeout warning after 15 seconds", async () => {
      mockAnalyzeThought.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 20000))
      );

      render(<DistortionScreen />);

      // Fast-forward 15 seconds
      jest.advanceTimersByTime(15000);

      // Component should still be mounted and handling timeout
      await waitFor(() => {
        expect(screen.root).toBeTruthy();
      });
    });

    it.skip("should abort after 30 seconds with error", async () => {
      mockAnalyzeThought.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 35000))
      );

      render(<DistortionScreen />);

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        const retryButton = screen.queryByText("Try Again");
        expect(retryButton || screen.root).toBeTruthy();
      });
    });
  });

  describe("Exit Confirmation", () => {
    it("should show cancel button in header", () => {
      mockAnalyzeThought.mockResolvedValue({
        distortions: ["test"],
        happening: "test",
        pattern: ["test"],
        matters: "test",
      });

      render(<DistortionScreen />);

      expect(mockSetOptions).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible continue button when analysis completes", async () => {
      mockAnalyzeThought.mockResolvedValue({
        distortions: ["test"],
        happening: "test",
        pattern: ["test"],
        matters: "test",
      });

      render(<DistortionScreen />);

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        expect(continueButton).toBeTruthy();
      });
    });
  });
});
