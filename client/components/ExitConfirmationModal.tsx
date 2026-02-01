import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { Button } from "./Button";
import { AnimatedModal } from "./AnimatedModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ExitConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmationModal({
  visible,
  onConfirm,
  onCancel,
}: ExitConfirmationModalProps) {
  const { theme } = useTheme();

  return (
    <AnimatedModal
      visible={visible}
      onRequestClose={onCancel}
      dismissOnBackdropPress={true}
    >
      <ThemedText type="h4" style={styles.title}>
        Exit reflection?
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.message, { color: theme.textSecondary }]}
      >
        Your progress will be lost and cannot be recovered.
      </ThemedText>

      <View style={styles.buttonContainer}>
        <Button
          onPress={onCancel}
          variant="secondary"
          style={{ flex: 1, marginRight: Spacing.sm }}
        >
          Stay
        </Button>
        <Button
          onPress={onConfirm}
          variant="primary"
          style={{ flex: 1, backgroundColor: "#ef4444" }}
        >
          Exit
        </Button>
      </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.sm,
  },
  message: {
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
