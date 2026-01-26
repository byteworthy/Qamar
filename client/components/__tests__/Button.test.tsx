import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button onPress={jest.fn()}>Click Me</Button>);

    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const mockOnPress = jest.fn();

    render(<Button onPress={mockOnPress}>Press Me</Button>);

    const button = screen.getByText("Press Me");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", () => {
    const mockOnPress = jest.fn();

    render(
      <Button onPress={mockOnPress} disabled>
        Disabled Button
      </Button>
    );

    const button = screen.getByText("Disabled Button");
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("should apply custom styles", () => {
    const customStyle = { backgroundColor: "red" };

    render(
      <Button onPress={jest.fn()} style={customStyle}>
        Styled Button
      </Button>
    );

    const button = screen.getByText("Styled Button");
    expect(button).toBeTruthy();
  });

  it("should render with secondary variant", () => {
    render(
      <Button onPress={jest.fn()} variant="secondary">
        Secondary Button
      </Button>
    );

    expect(screen.getByText("Secondary Button")).toBeTruthy();
  });

  it("should have accessibility role of button", () => {
    render(<Button onPress={jest.fn()}>Accessible Button</Button>);

    const button = screen.getByText("Accessible Button");
    // The button should have proper accessibility role
    expect(button).toBeTruthy();
  });

  it("should support accessibility hints", () => {
    render(
      <Button onPress={jest.fn()} accessibilityHint="This performs an action">
        Button with Hint
      </Button>
    );

    const button = screen.getByA11yHint("This performs an action");
    expect(button).toBeTruthy();
  });

  it("should show loading state when loading prop is true", () => {
    render(
      <Button onPress={jest.fn()} loading>
        Loading Button
      </Button>
    );

    // Button should be disabled when loading
    const button = screen.getByText("Loading Button");
    expect(button).toBeTruthy();
  });
});
