import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { ThemedText } from "./ThemedText";
import { Button } from "./Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

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
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[
            styles.modalContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
          onPress={(e) => e.stopPropagation()}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
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
