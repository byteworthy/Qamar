import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { AnimatedModal } from "../AnimatedModal";

// Mock reanimated
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

// Mock useTheme hook
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      backgroundDefault: "#ffffff",
      textSecondary: "#666666",
    },
    isDark: false,
  }),
}));

describe("AnimatedModal", () => {
  it("renders children when visible", () => {
    const { getByText } = render(
      <AnimatedModal visible={true} onRequestClose={() => {}}>
        <Text>Modal Content</Text>
      </AnimatedModal>,
    );
    expect(getByText("Modal Content")).toBeTruthy();
  });

  it("calls onRequestClose when backdrop is pressed", () => {
    const onRequestClose = jest.fn();
    const { getByLabelText } = render(
      <AnimatedModal visible={true} onRequestClose={onRequestClose}>
        <Text>Content</Text>
      </AnimatedModal>,
    );
    fireEvent.press(getByLabelText("Close modal"));
    expect(onRequestClose).toHaveBeenCalled();
  });

  it("does not close on backdrop press when dismissOnBackdropPress is false", () => {
    const onRequestClose = jest.fn();
    const { getByLabelText } = render(
      <AnimatedModal
        visible={true}
        onRequestClose={onRequestClose}
        dismissOnBackdropPress={false}
      >
        <Text>Content</Text>
      </AnimatedModal>,
    );
    fireEvent.press(getByLabelText("Close modal"));
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it("applies custom contentStyle", () => {
    const { getByTestId } = render(
      <AnimatedModal
        visible={true}
        onRequestClose={() => {}}
        contentStyle={{ padding: 100 }}
      >
        <View testID="content">
          <Text>Content</Text>
        </View>
      </AnimatedModal>,
    );
    // Test that component renders without error with custom style
    expect(getByTestId("content")).toBeTruthy();
  });

  it("renders with correct accessibility attributes", () => {
    const { getByLabelText } = render(
      <AnimatedModal visible={true} onRequestClose={() => {}}>
        <Text>Content</Text>
      </AnimatedModal>,
    );
    const backdrop = getByLabelText("Close modal");
    expect(backdrop).toBeTruthy();
  });
});
