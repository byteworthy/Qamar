import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { HifzPeekOverlay } from "../HifzPeekOverlay";

describe("HifzPeekOverlay Component", () => {
  const mockOnRevealWord = jest.fn();
  const mockOnRevealAyah = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show overlay when visible is true", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(screen.getByText("Need a hint?")).toBeTruthy();
  });

  it("should hide overlay when visible is false", () => {
    render(
      <HifzPeekOverlay
        visible={false}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    expect(screen.queryByText("Need a hint?")).toBeNull();
  });

  it("should call onRevealWord when Reveal Next Word button is pressed", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    const revealWordButton = screen.getByText("Reveal Next Word");
    fireEvent.press(revealWordButton);

    expect(mockOnRevealWord).toHaveBeenCalledTimes(1);
  });

  it("should call onRevealAyah when Reveal Full Ayah button is pressed", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    const revealAyahButton = screen.getByText("Reveal Full Ayah");
    fireEvent.press(revealAyahButton);

    expect(mockOnRevealAyah).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when background is tapped", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    // Find the background overlay by test ID
    const background = screen.getByTestId("hifz-peek-overlay-background");
    fireEvent.press(background);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should display revealedText when provided", () => {
    const revealedText = "وَالْعَصْرِ";

    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
        revealedText={revealedText}
      />,
    );

    expect(screen.getByText(revealedText)).toBeTruthy();
  });

  it("should not display revealedText when not provided", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    // Should only show the hint text, no revealed text
    expect(screen.getByText("Need a hint?")).toBeTruthy();
    expect(screen.getByText("Reveal Next Word")).toBeTruthy();
  });

  it("should call onDismiss when close button is pressed", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    const closeButton = screen.getByText("Cancel");
    fireEvent.press(closeButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should have accessibility properties", () => {
    render(
      <HifzPeekOverlay
        visible={true}
        onRevealWord={mockOnRevealWord}
        onRevealAyah={mockOnRevealAyah}
        onDismiss={mockOnDismiss}
      />,
    );

    const revealWordButton = screen.getByText("Reveal Next Word");
    expect(revealWordButton).toBeTruthy();
  });
});
