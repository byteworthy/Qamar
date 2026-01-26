import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemedText } from "../ThemedText";

describe("ThemedText Component", () => {
  it("should render text content", () => {
    render(<ThemedText>Hello World</ThemedText>);

    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("should apply custom styles", () => {
    const customStyle = { fontSize: 20, fontWeight: "bold" as const };

    render(<ThemedText style={customStyle}>Styled Text</ThemedText>);

    expect(screen.getByText("Styled Text")).toBeTruthy();
  });

  it("should support semantic props", () => {
    render(<ThemedText numberOfLines={1}>Truncated Text</ThemedText>);

    expect(screen.getByText("Truncated Text")).toBeTruthy();
  });

  it("should inherit accessibility properties", () => {
    render(
      <ThemedText accessibilityLabel="Custom Label">
        Accessible Text
      </ThemedText>,
    );

    const text = screen.getByLabelText("Custom Label");
    expect(text).toBeTruthy();
  });

  it("should render children correctly", () => {
    render(
      <ThemedText>
        <ThemedText>Nested</ThemedText>
        <ThemedText> Text</ThemedText>
      </ThemedText>,
    );

    expect(screen.getByText("Nested")).toBeTruthy();
    expect(screen.getByText("Text")).toBeTruthy();
  });
});
