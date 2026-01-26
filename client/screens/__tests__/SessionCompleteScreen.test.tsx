import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useQuery } from "@tanstack/react-query";
import SessionCompleteScreen from "../SessionCompleteScreen";
import * as storage from "@/lib/storage";
import * as queryClient from "@/lib/query-client";

// Mock dependencies
jest.mock("@/lib/storage", () => ({
  saveSession: jest.fn(),
}));

jest.mock("@/lib/query-client", () => ({
  apiRequest: jest.fn(),
}));

jest.mock("@/lib/haptics", () => ({
  hapticSuccess: jest.fn(),
  hapticMedium: jest.fn(),
  hapticLight: jest.fn(),
}));

jest.mock("@tanstack/react-query");

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockDispatch,
  }),
  useRoute: () => ({
    params: {
      thought: "I'm worried about my exam",
      distortions: ["catastrophizing"],
      reframe: "A more balanced view",
      intention: "Focus on preparation",
      practice: "Deep breathing",
      anchor: "Effort matters",
    },
  }),
  CommonActions: {
    reset: jest.fn((params) => ({ type: "RESET", ...params })),
  },
}));

describe("SessionCompleteScreen", () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
  const mockSaveSession = storage.saveSession as jest.MockedFunction<
    typeof storage.saveSession
  >;
  const mockApiRequest = queryClient.apiRequest as jest.MockedFunction<
    typeof queryClient.apiRequest
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseQuery.mockReturnValue({
      data: { status: "free", planName: "Free" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockApiRequest.mockResolvedValue({
      json: () => Promise.resolve({ detectedState: "anxious" }),
    } as any);
  });

  describe("Initial Render", () => {
    it("should render without crashing", () => {
      render(<SessionCompleteScreen />);
      expect(screen.root).toBeTruthy();
    });

    it("should display Return Home button", async () => {
      render(<SessionCompleteScreen />);

      await waitFor(
        () => {
          expect(screen.getByText("Return Home")).toBeTruthy();
        },
        { timeout: 5000 },
      );
    });
  });

  describe("Session Saving", () => {
    it("should save session to local storage on mount", async () => {
      render(<SessionCompleteScreen />);

      await waitFor(() => {
        expect(mockSaveSession).toHaveBeenCalled();
      });
    });

    it("should save session to server on mount", async () => {
      render(<SessionCompleteScreen />);

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith(
          "POST",
          "/api/reflection/save",
          expect.objectContaining({
            thought: "I'm worried about my exam",
          }),
        );
      });
    });
  });

  describe("Navigation", () => {
    it("should have dispatch function for navigation", async () => {
      render(<SessionCompleteScreen />);

      await waitFor(() => {
        expect(screen.getByText("Return Home")).toBeTruthy();
      });

      const returnHomeButton = screen.getByText("Return Home");
      fireEvent.press(returnHomeButton);

      // mockDispatch should eventually be called
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle server save errors gracefully", async () => {
      mockApiRequest.mockRejectedValue(new Error("Network error"));

      render(<SessionCompleteScreen />);

      // Should still render completion screen even if server save fails
      await waitFor(() => {
        expect(screen.getByText("Return Home")).toBeTruthy();
      });
    });
  });

  describe("Billing Status", () => {
    it("should check billing status on mount", async () => {
      render(<SessionCompleteScreen />);

      await waitFor(() => {
        expect(mockUseQuery).toHaveBeenCalled();
      });
    });
  });
});
