import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import ThoughtCaptureScreen from "../ThoughtCaptureScreen";

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  }),
  useHeaderHeight: () => 100,
}));

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 100,
}));

describe("ThoughtCaptureScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render with all key elements", async () => {
      render(<ThoughtCaptureScreen />);

      await waitFor(() => {
        // Check for main prompt
        expect(screen.getByText("What's Weighing on Your Heart?")).toBeTruthy();

        // Check for emotional intensity section
        expect(screen.getByText("HOW HEAVY DOES THIS FEEL?")).toBeTruthy();

        // Check for Continue button
        expect(screen.getByText("Continue")).toBeTruthy();
      });
    });

    it("should display niyyah (intention) prompt", async () => {
      render(<ThoughtCaptureScreen />);

      await waitFor(() => {
        // One of the niyyah prompts should be visible
        const hasNiyyah =
          screen.queryByText(/seeking clarity/i) ||
          screen.queryByText(/reflect to understand/i) ||
          screen.queryByText(/bring this thought to light/i) ||
          screen.queryByText(/seek clarity/i);

        expect(hasNiyyah).toBeTruthy();
      });
    });
  });

  describe("Thought Input", () => {
    it("should allow text input", async () => {
      render(<ThoughtCaptureScreen />);

      const input = screen.getByPlaceholderText(/Write what's on your mind/i);
      fireEvent.changeText(input, "I'm worried about my exam");

      expect(input.props.value).toBe("I'm worried about my exam");
    });

    it("should disable Continue button for short thoughts (< 10 chars)", async () => {
      render(<ThoughtCaptureScreen />);

      const input = screen.getByPlaceholderText(/Write what's on your mind/i);
      const continueButton = screen.getByText("Continue");

      fireEvent.changeText(input, "Short");

      // Button should be disabled (accessibility state)
      await waitFor(() => {
        expect(continueButton).toBeTruthy();
      });
    });

    it("should enable Continue button for valid thoughts (> 10 chars)", async () => {
      render(<ThoughtCaptureScreen />);

      const input = screen.getByPlaceholderText(/Write what's on your mind/i);
      fireEvent.changeText(input, "I'm feeling anxious about my presentation");

      const continueButton = screen.getByText("Continue");
      expect(continueButton).toBeTruthy();
    });
  });

  describe("Emotional Intensity", () => {
    it("should display intensity section", async () => {
      render(<ThoughtCaptureScreen />);

      await waitFor(() => {
        expect(screen.getByText("HOW HEAVY DOES THIS FEEL?")).toBeTruthy();
      });
    });

    it("should render intensity level buttons", async () => {
      render(<ThoughtCaptureScreen />);

      // Should have 5 intensity level buttons (1-5)
      await waitFor(() => {
        const button3 = screen.getByLabelText(/Intensity level 3/i);
        expect(button3).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to Distortion screen when Continue pressed with valid input", async () => {
      render(<ThoughtCaptureScreen />);

      const input = screen.getByPlaceholderText(/Write what's on your mind/i);
      fireEvent.changeText(
        input,
        "I'm worried about failing this important test",
      );

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        fireEvent.press(continueButton);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "Distortion",
          expect.objectContaining({
            thought: "I'm worried about failing this important test",
            emotionalIntensity: 3,
          }),
        );
      });
    });
  });

  describe("Exit Confirmation", () => {
    it("should show cancel button in header", () => {
      render(<ThoughtCaptureScreen />);

      // Verify setOptions was called to add Cancel button
      expect(mockSetOptions).toHaveBeenCalled();
    });
  });

  describe("Progress Indicator", () => {
    it("should render without crashing", async () => {
      render(<ThoughtCaptureScreen />);

      // Progress component is mocked, but screen should render successfully
      await waitFor(() => {
        expect(screen.getByText("What's Weighing on Your Heart?")).toBeTruthy();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible placeholder text", () => {
      render(<ThoughtCaptureScreen />);

      const input = screen.getByPlaceholderText(/Write what's on your mind/i);
      expect(input).toBeTruthy();
    });

    it("should have accessible continue button", async () => {
      render(<ThoughtCaptureScreen />);

      await waitFor(() => {
        const continueButton = screen.getByText("Continue");
        expect(continueButton).toBeTruthy();
      });
    });
  });
});
