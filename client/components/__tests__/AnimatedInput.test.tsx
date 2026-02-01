import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AnimatedInput } from "../AnimatedInput";

describe("AnimatedInput Component", () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render input with placeholder", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text here"
      />,
    );

    expect(screen.getByPlaceholderText("Enter text here")).toBeTruthy();
  });

  it("should display current value", () => {
    render(
      <AnimatedInput
        value="Test value"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />,
    );

    const input = screen.getByDisplayValue("Test value");
    expect(input).toBeTruthy();
  });

  it("should call onChangeText when text changes", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");
    fireEvent.changeText(input, "New text");

    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
    expect(mockOnChangeText).toHaveBeenCalledWith("New text");
  });

  it("should show character count when maxLength is set", () => {
    render(
      <AnimatedInput
        value="Hello"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={50}
      />,
    );

    expect(screen.getByText("5/50")).toBeTruthy();
  });

  it("should update character count as text changes", () => {
    const { rerender } = render(
      <AnimatedInput
        value="Hello"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={100}
      />,
    );

    expect(screen.getByText("5/100")).toBeTruthy();

    rerender(
      <AnimatedInput
        value="Hello World"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={100}
      />,
    );

    expect(screen.getByText("11/100")).toBeTruthy();
  });

  it("should hide character count when showCharacterCount is false", () => {
    render(
      <AnimatedInput
        value="Hello"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={50}
        showCharacterCount={false}
      />,
    );

    expect(screen.queryByText("5/50")).toBeNull();
  });

  it("should display error message when error prop is provided", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        error="This field is required"
      />,
    );

    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("should not display error message when error prop is not provided", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />,
    );

    expect(screen.queryByText("This field is required")).toBeNull();
  });

  it("should support multiline mode", () => {
    render(
      <AnimatedInput
        value="Line 1\nLine 2"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        multiline={true}
        numberOfLines={4}
      />,
    );

    const input = screen.getByDisplayValue("Line 1\nLine 2");
    expect(input.props.multiline).toBe(true);
  });

  it("should respect maxLength constraint", () => {
    render(
      <AnimatedInput
        value="Test"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={10}
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");
    expect(input.props.maxLength).toBe(10);
  });

  it("should support accessibility label", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        accessibilityLabel="Text input field"
      />,
    );

    expect(screen.getByLabelText("Text input field")).toBeTruthy();
  });

  it("should support accessibility hint", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        accessibilityHint="Enter your thoughts here"
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");
    expect(input.props.accessibilityHint).toBe("Enter your thoughts here");
  });

  it("should apply custom style", () => {
    const customStyle = { marginTop: 20 };

    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        style={customStyle}
      />,
    );

    // Component should render successfully with custom style
    expect(screen.getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("should handle focus events", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");

    // Trigger focus event
    fireEvent(input, "focus");

    // Input should still be in the DOM after focus
    expect(screen.getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("should handle blur events", () => {
    render(
      <AnimatedInput
        value="Test"
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");

    // Trigger blur event
    fireEvent(input, "blur");

    // Input should still be in the DOM after blur
    expect(screen.getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("should handle empty value", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        maxLength={100}
      />,
    );

    expect(screen.getByText("0/100")).toBeTruthy();
  });

  it("should forward additional TextInput props", () => {
    render(
      <AnimatedInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        keyboardType="email-address"
        autoCapitalize="none"
      />,
    );

    const input = screen.getByPlaceholderText("Enter text");
    expect(input.props.keyboardType).toBe("email-address");
    expect(input.props.autoCapitalize).toBe("none");
  });
});
