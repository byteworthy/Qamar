import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type ScreenErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

function ScreenErrorFallback({ error, resetError }: ScreenErrorFallbackProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleGoHome = () => {
    resetError();
    // @ts-expect-error - navigation types
    navigation.navigate("Home");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="alert-circle" size={64} color={theme.link} />
      </View>

      <ThemedText type="h2" style={styles.title}>
        This screen encountered an issue
      </ThemedText>

      <ThemedText type="body" style={styles.message}>
        We've recorded this error and will fix it soon. You can go back to the
        home screen to continue using the app.
      </ThemedText>

      {__DEV__ && (
        <View
          style={[
            styles.errorDetails,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="caption" style={styles.errorText}>
            {error.message}
          </ThemedText>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={resetError}
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            {
              borderColor: theme.link,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: theme.link }]}
          >
            Try Again
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            {
              backgroundColor: theme.link,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: theme.buttonText }]}
          >
            Go to Home
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: Spacing.xl,
    lineHeight: 24,
    maxWidth: 400,
  },
  errorDetails: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
    maxWidth: 400,
  },
  errorText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
    maxWidth: 400,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});

type ScreenErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: Error, stackTrace: string) => void;
};

/**
 * Screen-level error boundary that provides navigation fallback
 * when a screen crashes. This allows the rest of the app to
 * continue working even if one screen encounters an error.
 */
export function ScreenErrorBoundary({
  children,
  onError,
}: ScreenErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ScreenErrorFallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Higher-order component that wraps a screen component with error boundary.
 * Usage: export default withScreenErrorBoundary(YourScreen);
 */
export function withScreenErrorBoundary<P extends object>(
  ScreenComponent: React.ComponentType<P>,
  onError?: (error: Error, stackTrace: string) => void,
): React.ComponentType<P> {
  const WrappedScreen = (props: P) => {
    return (
      <ScreenErrorBoundary onError={onError}>
        <ScreenComponent {...props} />
      </ScreenErrorBoundary>
    );
  };

  WrappedScreen.displayName = `withScreenErrorBoundary(${
    ScreenComponent.displayName || ScreenComponent.name || "Screen"
  })`;

  return WrappedScreen;
}
