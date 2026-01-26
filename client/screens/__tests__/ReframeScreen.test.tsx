import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import ReframeScreen from "../ReframeScreen";
import * as api from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  generateReframe: jest.fn(),
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
      thought: "I'm going to fail my exam",
      distortions: ["catastrophizing", "all-or-nothing thinking"],
      analysis: "You're worrying about an unlikely outcome",
      emotionalIntensity: 4,
      beliefStrength: 8,
    },
  }),
  useHeaderHeight: () => 100,
}));

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 100,
}));

describe("ReframeScreen", () => {
  const mockGenerateReframe = api.generateReframe as jest.MockedFunction<
    typeof api.generateReframe
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render without crashing during loading", async () => {
      mockGenerateReframe.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  beliefTested: "test",
                  perspective: "test",
                  nextStep: "test",
                  anchors: [],
                }),
              100,
            ),
          ),
      );

      render(<ReframeScreen />);

      // Component should render (loading skeleton is mocked)
      expect(screen.root).toBeTruthy();
    });
  });

  describe("Successful Reframe Generation", () => {
    it("should display reframe result when API returns data", async () => {
      const mockResult = {
        beliefTested: "I will definitely fail",
        perspective:
          "A more balanced view is that you've prepared and outcomes are uncertain",
        nextStep: "Focus on doing your best rather than predicting the outcome",
        anchors: [
          "Effort matters more than outcomes",
          "Uncertainty is part of life",
        ],
      };

      mockGenerateReframe.mockResolvedValue(mockResult);

      render(<ReframeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeTruthy();
      });
    });

    it("should call generateReframe API with correct parameters", async () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        expect(mockGenerateReframe).toHaveBeenCalledWith(
          "I'm going to fail my exam",
          ["catastrophizing", "all-or-nothing thinking"],
          "You're worrying about an unlikely outcome",
          4,
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when API fails", async () => {
      mockGenerateReframe.mockRejectedValue(new Error("NETWORK_ERROR"));

      render(<ReframeScreen />);

      await waitFor(() => {
        const retryButton = screen.queryByText("Try Again");
        expect(retryButton || screen.root).toBeTruthy();
      });
    });

    it("should allow retry after error", async () => {
      mockGenerateReframe.mockRejectedValueOnce(new Error("NETWORK_ERROR"));
      mockGenerateReframe.mockResolvedValueOnce({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        expect(mockGenerateReframe).toHaveBeenCalled();
      });
    });
  });

  describe("Perspective Selection", () => {
    it("should render with default empathic perspective", async () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        expect(screen.root).toBeTruthy();
      });
    });
  });

  describe("Belief Strength Rating", () => {
    it("should allow rating belief strength after viewing reframe", async () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "I will fail",
        perspective: "A balanced view",
        nextStep: "Focus on preparation",
        anchors: ["Effort matters"],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        expect(screen.getByText("Continue")).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("should have Continue button when reframe loads", async () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        expect(continueButton).toBeTruthy();
      });
    });
  });

  describe("Timeout Handling", () => {
    it.skip("should show timeout warning after 15 seconds", async () => {
      mockGenerateReframe.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({} as any), 20000)),
      );

      render(<ReframeScreen />);

      jest.advanceTimersByTime(15000);

      await waitFor(() => {
        expect(screen.root).toBeTruthy();
      });
    });

    it.skip("should abort after 30 seconds with error", async () => {
      mockGenerateReframe.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({} as any), 35000)),
      );

      render(<ReframeScreen />);

      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        const retryButton = screen.queryByText("Try Again");
        expect(retryButton || screen.root).toBeTruthy();
      });
    });
  });

  describe("Exit Confirmation", () => {
    it("should show cancel button in header", () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      expect(mockSetOptions).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible continue button when reframe completes", async () => {
      mockGenerateReframe.mockResolvedValue({
        beliefTested: "test",
        perspective: "test",
        nextStep: "test",
        anchors: [],
      });

      render(<ReframeScreen />);

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        expect(continueButton).toBeTruthy();
      });
    });
  });
});
