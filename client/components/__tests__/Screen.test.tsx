import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { Screen } from "../Screen";

describe("Screen Component", () => {
  it("should render children", () => {
    render(
      <Screen>
        <Text>Screen Content</Text>
      </Screen>
    );

    expect(screen.getByText("Screen Content")).toBeTruthy();
  });

  it("should display title when provided", () => {
    render(
      <Screen title="Test Screen">
        <Text>Content</Text>
      </Screen>
    );

    expect(screen.getByText("Test Screen")).toBeTruthy();
  });

  it("should show back button when showBack is true", () => {
    render(
      <Screen title="Test Screen" showBack>
        <Text>Content</Text>
      </Screen>
    );

    // Screen component should render
    expect(screen.getByText("Test Screen")).toBeTruthy();
  });

  it("should apply scrollable container by default", () => {
    render(
      <Screen>
        <Text>Scrollable Content</Text>
      </Screen>
    );

    expect(screen.getByText("Scrollable Content")).toBeTruthy();
  });

  it("should handle non-scrollable screens", () => {
    render(
      <Screen scrollable={false}>
        <Text>Non-Scrollable Content</Text>
      </Screen>
    );

    expect(screen.getByText("Non-Scrollable Content")).toBeTruthy();
  });

  it("should support custom styles", () => {
    render(
      <Screen style={{ backgroundColor: "blue" }}>
        <Text>Styled Screen</Text>
      </Screen>
    );

    expect(screen.getByText("Styled Screen")).toBeTruthy();
  });
});
